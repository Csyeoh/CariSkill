#!/usr/bin/env python
import json
import sys
from crewai.flow.flow import Flow, start, listen, router
from crewai.flow.persistence import persist

# Import the SystemState from the model folder
from master_flow.model.system_state import SystemState
from master_flow.model.extracted_data import ExtractedData

# Import the crews
from master_flow.crews.requirements_extraction_crew.extraction_crew import ExtractionCrew
from master_flow.crews.requirements_extraction_crew.questioning_crew import QuestioningCrew

@persist()
class MasterFlow(Flow[SystemState]):
    
    @start()
    def process_chat(self):
        self.state.chat_history.append({"role": "user", "content": self.state.latest_user_message})
        current_data_json = self.state.model_dump_json(include=set(ExtractedData.model_fields.keys()))
        result = ExtractionCrew().crew().kickoff(
            inputs={
                'current_data': current_data_json,
                'user_message': self.state.latest_user_message
            }
        )
        
        extracted_data = result.pydantic
        if extracted_data:
            if extracted_data.topic: self.state.topic = extracted_data.topic
            if extracted_data.experience: self.state.experience = extracted_data.experience
            if extracted_data.goal: self.state.goal = extracted_data.goal
            # Append constraints if they exist, rather than overwrite, so we don't lose earlier worries
            if extracted_data.constraints: 
                self.state.constraints = f"{self.state.constraints or ''} {extracted_data.constraints}".strip()
                
        return "route_elicitation"

    @router(process_chat)
    def check_elicitation_status(self):
        # Check if we have the "Must-Haves"
        has_core = all([self.state.topic, self.state.experience, self.state.goal])
        
        if not has_core:
            return "ask_core_info"
            
        # Core is met. Have we asked the optional constraints question yet?
        if not self.state.asked_for_constraints:
            return "ask_constraints"
            
        # Core is met, AND we already asked about constraints (so their last message was the reply).
        # We are done with elicitation!
        print("Elicitation complete. Moving to Research.")
        return "trigger_research"

    @listen("ask_core_info")
    def ask_missing_core(self):
        # Find the first missing core field
        core_fields = {'topic': self.state.topic, 'experience': self.state.experience, 'goal': self.state.goal}
        missing = [k for k, v in core_fields.items() if v is None]
        
        result = QuestioningCrew().core_crew().kickoff(inputs={'missing_field': missing[0]})
        question = result.raw
        
        self.state.chat_history.append({"role": "assistant", "content": question})
        return {"status": "chatting", "reply": question}

    @listen("ask_constraints")
    def ask_optional_constraints(self):
        # Mark that we are asking the constraint question right now
        self.state.asked_for_constraints = True 
        
        inputs = {
            'topic': self.state.topic,
            'experience': self.state.experience,
            'goal': self.state.goal
        }
        
        # You will need a specific crew/task method to call the `ask_constraints_task`
        result = QuestioningCrew().constraints_crew().kickoff(inputs=inputs) 
        question = result.raw
        
        self.state.chat_history.append({"role": "assistant", "content": question})
        return {"status": "chatting", "reply": question}

    @listen("trigger_research")
    def execute_research(self):
        """Step 3B: If complete, package data and call the next Crew."""
        print("All information collected. Triggering research...")
        print("Final collected state:", self.state.model_dump(
            exclude={'chat_history', 'raw_research', 'roadmap', 'critic_feedback'}
        ))
        
        # NOTE: Implement call to ResearchCrew here.
        # e.g., result = ResearchCrew().crew().kickoff(inputs={...})
        pass

def kickoff():
    master_flow = MasterFlow()
    master_flow.kickoff()

def plot():
    master_flow = MasterFlow()
    master_flow.plot()

if __name__ == "__main__":
    kickoff()
