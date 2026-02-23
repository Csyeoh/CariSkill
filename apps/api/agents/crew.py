import os
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, Process
from langchain_google_genai import ChatGoogleGenerativeAI
from tools.search_tools import search_syllabi, format_roadmap_json, validate_prerequisites, web_syllabus_search

# 1. Force Python to load the GEMINI_API_KEY from your .env file
load_dotenv()

# 2. Define the Gemini LLM explicitly
gemini_llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash", # The core reasoning engine for your agents
    verbose=True,
    temperature=0.5,
    google_api_key=os.getenv("GEMINI_API_KEY"),
    max_retries=5
)

def generate_roadmap(skill: str):
    # Agent 1: Researcher
    researcher = Agent(
        role='Curriculum Researcher',
        goal=f'Find the best MOOC syllabi for the skill: {skill}',
        backstory='You always try the Qdrant Syllabus Search first. If it returns ERROR_NOT_FOUND, you must immediately switch to using the Web Syllabus Search tool. Otherwise, use the Qdrant results.',
        tools=[search_syllabi, web_syllabus_search],
        llm=gemini_llm, # <--- Hooking up the Gemini Brain
        verbose=True,
        allow_delegation=False
    )

    # Agent 2: Designer
    designer = Agent(
        role='Micro-Learning Architect',
        goal='Synthesize research into a step-by-step roadmap.',
        backstory='You design engaging and effective micro-learning paths optimized for student success.',
        tools=[format_roadmap_json],
        llm=gemini_llm, # <--- Hooking up the Gemini Brain
        verbose=True,
        allow_delegation=False
    )

    # Agent 3: Critic
    critic = Agent(
        role='QA Specialist',
        goal='Ensure the roadmap is pedagogically sound and prerequisites are met.',
        backstory='You meticulously analyze learning plans to ensure foundational concepts are covered before advanced topics.',
        tools=[validate_prerequisites],
        llm=gemini_llm, # <--- Hooking up the Gemini Brain
        verbose=True,
        allow_delegation=False
    )

    # Define Tasks
    research_task = Task(
        description=f'First, use the "Qdrant Syllabus Search" tool to search the local vector database for {skill}. ONLY IF it returns "ERROR_NOT_FOUND", use the "Web Syllabus Search" tool to search the web for a standard curriculum structure for {skill}. Extract key topics, learning outcomes, and carefully retain any source URLs provided by the search tool.',
        expected_output='A summary of the most relevant syllabi content found for the skill, including an explicit list of source URLs.',
        agent=researcher
    )

    design_task = Task(
        description='Using the research summary, create a structured step-by-step learning roadmap. Format the output strictly as JSON. Make sure to include a "source_urls" array in the root of the JSON object containing any URLs found in the research phase.',
        expected_output='A JSON structured learning roadmap with title, description, learning_path, and source_urls.',
        agent=designer
    )

    qa_task = Task(
        description='Review the proposed JSON learning roadmap to ensure it is logically sequenced and foundational skills are not skipped. Make corrections if necessary.',
        expected_output='The final validated JSON learning roadmap.',
        agent=critic
    )

    # Form the Crew
    amls_crew = Crew(
        agents=[researcher, designer, critic],
        tasks=[research_task, design_task, qa_task],
        process=Process.sequential,
        verbose=True,
        max_rpm=10
    )

    # Kickoff the process
    result = amls_crew.kickoff()
    
    # Safely extract the raw string output from the CrewOutput object
    return getattr(result, 'raw', str(result))