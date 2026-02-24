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
        # Initialize or update chat history
        self.state.chat_history.append({"role": "user", "content": self.state.latest_user_message})
        # Get the currently known data to pass to the agent (only the ExtractedData parts)
        current_data = self.state.model_dump_json(include=set(ExtractedData.model_fields.keys()))
        # Kickoff the Extraction Crew and get the Pydantic object back
        result = ExtractionCrew().crew().kickoff(
            inputs={
                'current_data': current_data,
                'user_message': self.state.latest_user_message
            }
        )
        extracted_data = result.pydantic
        if extracted_data:
            for key, value in extracted_data.model_dump().items():
                if value is not None:
                    setattr(self.state, key, value)
            
        return "route_elicitation"

    @router(process_chat)
    def check_elicitation_status(self):
        # Ensure that ALL extracted fields are populated
        if all(getattr(self.state, field) for field in ExtractedData.model_fields.keys()):
            return "trigger_research"
        return "ask_user"

    @listen("ask_user")
    def ask_missing_info(self):
        """Step 3A: If incomplete, use the Interviewer Agent to ask for the next piece."""
        # Find the first ExtractedData field that is still None
        missing = [
            field for field in ExtractedData.model_fields.keys()
            if getattr(self.state, field) is None
        ]
        
        if missing:
            # Kickoff the Questioning Crew to generate the prompt
            result = QuestioningCrew().crew().kickoff(
                inputs={
                    'missing_field': missing[0]
                }
            )
            question = result.raw
            
            self.state.chat_history.append({"role": "assistant", "content": question})
            return {"status": "chatting", "reply": question}

    # @listen("trigger_research")
    # def execute_research(self):
    #     """Step 3B: If complete, package data and call the next Crew."""
    #     print("All information collected. Triggering research...")
    #     print("Final collected state:", self.state.model_dump(
    #         exclude={'chat_history', 'raw_research', 'roadmap', 'critic_feedback'}
    #     ))
        
    #     # NOTE: Implement call to ResearchCrew here.
    #     # e.g., result = ResearchCrew().crew().kickoff(inputs={...})
    #     pass

def kickoff():
    master_flow = MasterFlow()
    master_flow.kickoff()

def plot():
    master_flow = MasterFlow()
    master_flow.plot()

if __name__ == "__main__":
    kickoff()
