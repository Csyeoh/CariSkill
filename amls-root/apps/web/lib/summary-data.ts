// lib/summary-data.ts

export interface SummaryNote {
  moduleId: string;
  topicTag: string;
  subject: string;
  title: string;
  lastUpdated: string;
  keyTakeaways: string[];
  coreConcepts: {
    icon: string; // Material symbol name
    title: string;
    description: string;
  }[];
  cheatSheet: {
    sqlStructure: string;
    properties: string[];
    dataTypes: string[];
  };
}

export const summaryNotes: Record<string, SummaryNote> = {
  "m1": {
    moduleId: "m1",
    topicTag: "Topic 1.1",
    subject: "Databases",
    title: "Introduction to Databases",
    lastUpdated: "2 mins ago",
    keyTakeaways: [
      "A database is an organized collection of structured information, or data, typically stored electronically in a computer system.",
      "Database Management Systems (DBMS) serve as an interface between the database and its end users or programs.",
      "SQL (Structured Query Language) is the standard language for dealing with Relational Databases."
    ],
    coreConcepts: [
      { icon: "table_chart", title: "Relational Databases", description: "Data is organized into tables with rows and columns. Each row is a unique record." },
      { icon: "dns", title: "NoSQL Databases", description: "Non-relational databases that store data in formats other than tables, such as JSON." },
      { icon: "key", title: "Primary Key", description: "A unique identifier for a record in a table. It ensures no two rows have the same key." },
      { icon: "link", title: "Foreign Key", description: "A field in one table that refers to the primary key in another table, establishing a link." }
    ],
    cheatSheet: {
      sqlStructure: "SELECT column1, column2 \nFROM table_name \nWHERE condition;",
      properties: ["Atomicity", "Consistency", "Isolation", "Durability"],
      dataTypes: ["INT / INTEGER", "VARCHAR(n)", "BOOLEAN", "DATE / TIMESTAMP"]
    }
  }
};