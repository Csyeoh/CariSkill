#!/usr/bin/env python
import json
import sys
from crewai.flow.flow import Flow, start, listen, router
from crewai.flow.persistence import persist

# Import the SystemState from the model folder
from master_flow.model.system_state import SystemState

# Import the crews
from master_flow.crews.macro_planning_crew.macro_crew import MacroPlanningCrew

@persist()
class MasterFlow(Flow[SystemState]):
    
    @start()
    def execute_macro_planning(self):
        print(f"--- MACRO PLANNING CREW ACTIVATED (Attempt {self.state.macro_retry_count + 1}) ---")
        
        inputs = {
            "topic": self.state.topic,
            "experience": self.state.experience,
            "goal": self.state.goal,
            "constraints": self.state.constraints or "None specified.",
            "critic_feedback": self.state.macro_critic_feedback
        }
        
        # Kickoff the Crew. Because tasks are sequential, it runs Architect -> QA
        result = MacroPlanningCrew().crew().kickoff(inputs=inputs)
        evaluation = result.pydantic
        
        if evaluation.is_approved:
            print("--- BLUEPRINT APPROVED BY QA ---")
            # Save the final approved blueprint to the state
            self.state.blueprint = evaluation.blueprint.model_dump()
            return "macro_planning_success"
            
        else:
            print(f"--- BLUEPRINT REJECTED: {evaluation.feedback} ---")
            self.state.macro_critic_feedback = evaluation.feedback
            self.state.macro_retry_count += 1
            
            # The Safety Net: Don't loop forever
            if self.state.macro_retry_count >= 3:
                print("Max retries hit. Forcing approval of the latest draft to prevent infinite loops.")
                self.state.blueprint = evaluation.blueprint.model_dump()
                return "macro_planning_success"
                
            # Loop back to try again with the new feedback
            return "trigger_research" 

    @listen("macro_planning_success")
    def finalize_macro(self):
        reply = "Your personalized skill tree blueprint is ready! I am now generating the micro-learning content..."
        self.state.chat_history.append({"role": "assistant", "content": reply})
        
        # Next step would be routing to the Micro-Learning loop
        return {"status": "blueprint_ready", "reply": reply, "blueprint": self.state.blueprint}

def kickoff():
    master_flow = MasterFlow()
    master_flow.kickoff()

def plot():
    master_flow = MasterFlow()
    master_flow.plot()

if __name__ == "__main__":
    kickoff()
