export interface OutlineItem {
  id: string;
  label: string;
  subLabel?: string;
  type: 'start' | 'node' | 'finish';
  isCompleted: boolean;
  isActive: boolean;
}

export interface MaterialTopic {
  id: string;
  moduleId: string;
  title: string;
  part: string;
  duration: string;
  description: string[];
  video: {
    title: string;
    url: string;
  };
  outline: OutlineItem[];
}

export const materialTopics: Record<string, MaterialTopic> = {
  "m1": {
    id: "m1",
    moduleId: "m1",
    title: "Introduction to Databases",
    part: "Part 1 of 4",
    duration: "Approx. 45 mins",
    description: [
      "A database is an organized collection of structured information, or data, typically stored electronically in a computer system. A database is usually controlled by a database management system (DBMS).",
      "Together, the data and the DBMS, along with the applications that are associated with them, are referred to as a database system, often shortened to just database.",
      "Most modern databases use structured query language (SQL) for writing and querying data, allowing for efficient processing and accessibility."
    ],
    video: {
      title: "Video 1.1: Introduction to Database Systems",
      url: "https://www.youtube.com/embed/dQw4w9WgXcQ", 
    },
    outline: [
      { id: "o1", label: "Start", subLabel: "Overview", type: "start", isCompleted: true, isActive: false },
      { id: "o2", label: "Core Concepts & Architecture", type: "node", isCompleted: false, isActive: true },
      { id: "o3", label: "Relational Data Model", type: "node", isCompleted: false, isActive: false },
      { id: "o4", label: "SQL Fundamentals", type: "node", isCompleted: false, isActive: false },
      { id: "o5", label: "Finish", type: "finish", isCompleted: false, isActive: false },
    ]
  }
};