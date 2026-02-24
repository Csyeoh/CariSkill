// lib/quiz-data.ts

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  hint: string; // Added hint field
}

export interface QuizSet {
  moduleId: string;
  title: string;
  questions: QuizQuestion[];
}

export const quizSets: Record<string, QuizSet> = {
  "m1": {
    moduleId: "m1",
    title: "Introduction to Databases",
    questions: [
      {
        id: "q1",
        question: "What is the primary function of a Database Management System (DBMS)?",
        options: [
          "To design the user interface of an application",
          "To serve as an interface between the database and its end users",
          "To physically repair broken hard drives",
          "To compile programming code into machine language"
        ],
        correctAnswerIndex: 1,
        explanation: "A DBMS is specialized software that acts as an intermediary, allowing users to safely access, manage, and update the data stored within a database.",
        hint: "Think about what the word 'Management' implies in software terms—it's about acting as a middleman."
      },
      {
        id: "q2",
        question: "Which SQL constraint is used to ensure that a column cannot have a NULL value?",
        options: [
          "UNIQUE",
          "NOT NULL",
          "PRIMARY KEY",
          "DEFAULT"
        ],
        correctAnswerIndex: 1,
        explanation: "The NOT NULL constraint specifically enforces a column to NOT accept NULL values, meaning you must always provide a value when inserting or updating a record.",
        hint: "The answer is quite literal to the requirement of the question."
      },
      {
        id: "q3",
        question: "Which acronym represents the properties that guarantee reliable database transactions?",
        options: [
          "BASE",
          "CRUD",
          "SOLID",
          "ACID"
        ],
        correctAnswerIndex: 3,
        explanation: "ACID stands for Atomicity, Consistency, Isolation, and Durability. These properties ensure that database transactions are processed reliably.",
        hint: "It sounds like a corrosive chemical."
      }
    ]
  }
};