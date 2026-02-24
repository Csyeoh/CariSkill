from crewai import Agent, Crew, Task, LLM
from crewai.project import CrewBase, agent, crew, task
import os

@CrewBase
class QuestioningCrew():
    """Crew responsible for generating the next chat question."""
    agents_config = 'config/agents.yaml'
    tasks_config = 'config/ask_task.yaml'

    @agent
    def interviewer(self) -> Agent:
        llm = LLM(
            model="gemini/gemini-2.5-flash-lite",
            api_key='AIzaSyBd80wsbqgu3wG2bMu5rq5mst8b6389Amg',
        )
        return Agent(
            config=self.agents_config['interviewer'],
            verbose=True,
            llm=llm
        )

    @task
    def ask_core_task(self) -> Task:
        return Task(
            config=self.tasks_config['ask_core_task']
        )

    @task
    def ask_constraints_task(self) -> Task:
        return Task(
            config=self.tasks_config['ask_constraints_task']
        )

    @crew
    def core_crew(self) -> Crew:
        return Crew(
            agents=[self.interviewer()],
            tasks=[self.ask_core_task()],
            verbose=True
        )

    @crew
    def constraints_crew(self) -> Crew:
        return Crew(
            agents=[self.interviewer()],
            tasks=[self.ask_constraints_task()],
            verbose=True
        )