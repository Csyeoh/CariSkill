from crewai import Agent, Crew, Task, LLM
from crewai.project import CrewBase, agent, crew, task
from master_flow.model.extracted_data import ExtractedData
import os

@CrewBase
class ExtractionCrew():
    """Crew responsible for reading the message and returning Pydantic data."""
    agents_config = 'config/agents.yaml'
    tasks_config = 'config/extraction_task.yaml'

    @agent
    def extractor(self) -> Agent:
        llm = LLM(
            model="gemini/gemini-2.5-flash-lite",
            api_key='AIzaSyBd80wsbqgu3wG2bMu5rq5mst8b6389Amg',
        )

        return Agent(
            config=self.agents_config['extractor'],
            verbose=True,
            llm=llm
        )

    @task
    def extract_task(self) -> Task:
        return Task(
            config=self.tasks_config['extract_task'],
            output_pydantic=ExtractedData # Forces the agent to output the Pydantic model
        )

    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=[self.extractor()],
            tasks=[self.extract_task()],
            verbose=True
        )

