import os
from crewai import Agent, Crew, Task, LLM
from crewai.project import CrewBase, agent, crew, task
from master_flow.model.macro_models import QAEvaluation
from master_flow.tools.search_tools import search_syllabi, web_syllabus_search

@CrewBase
class MacroPlanningCrew():
    """Crew responsible for generating and validating the skill tree DAG."""
    agents_config = 'config/macro_agents.yaml'
    tasks_config = 'config/macro_tasks.yaml'

    def get_llm(self) -> LLM:
        return LLM(
            model="gemini/gemini-2.5-flash", 
            api_key=os.getenv("GEMINI_API_KEY"),
            temperature=0.5
        )

    @agent
    def architect(self) -> Agent:
        return Agent(
            config=self.agents_config['architect'],
            tools=[search_syllabi, web_syllabus_search],
            verbose=True,
            llm=self.get_llm(),
            allow_delegation=False
        )

    @agent
    def qa_auditor(self) -> Agent:
        return Agent(
            config=self.agents_config['qa_auditor'],
            verbose=True,
            llm=self.get_llm(),
            allow_delegation=False
        )

    @task
    def blueprint_task(self) -> Task:
        return Task(
            config=self.tasks_config['blueprint_task']
        )

    @task
    def qa_task(self) -> Task:
        return Task(
            config=self.tasks_config['qa_task'],
            output_pydantic=QAEvaluation # Forces output into our strict QA model
        )

    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=[self.architect(), self.qa_auditor()],
            tasks=[self.blueprint_task(), self.qa_task()],
            verbose=True,
            max_rpm=15
        )
