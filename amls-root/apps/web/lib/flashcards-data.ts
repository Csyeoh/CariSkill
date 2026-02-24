// lib/flashcards-data.ts

export interface Flashcard {
  id: string;
  tag: string;
  front: string;
  back: string[];
}

export interface FlashcardSet {
  moduleId: string;
  title: string;
  cards: Flashcard[];
}

export const flashcardSets: Record<string, FlashcardSet> = {
  "m1": {
    moduleId: "m1",
    title: "Introduction to Databases",
    cards: [
      {
        id: "fc1",
        tag: "DEFINITION",
        front: "What is a Database Management System (DBMS)?",
        back: [
          "Software that serves as an interface between the database and its end users or programs.",
          "Allows users to easily access, manage, and update data."
        ]
      },
      {
        id: "fc2",
        tag: "KEY CONCEPT",
        front: "What is a Primary Key?",
        back: [
          "A unique identifier for each record in a database table.",
          "It must contain unique values and cannot contain NULL values."
        ]
      },
      {
        id: "fc3",
        tag: "RELATIONAL MODEL",
        front: "What is a Foreign Key?",
        back: [
          "A field (or collection of fields) in one table that refers to the Primary Key in another table.",
          "Used to establish and enforce a link between the data in two tables."
        ]
      },
      {
        id: "fc4",
        tag: "PROPERTIES",
        front: "What are the ACID properties?",
        back: [
          "Atomicity: All or nothing execution.",
          "Consistency: Valid state transitions.",
          "Isolation: Concurrent transactions don't interfere.",
          "Durability: Committed data is saved permanently."
        ]
      }
    ]
  }
};