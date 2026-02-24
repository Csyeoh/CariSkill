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
    def ask_task(self) -> Task:
        return Task(
            config=self.tasks_config['ask_task']
        )

    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=[self.interviewer()],
            tasks=[self.ask_task()],
            verbose=True
        )