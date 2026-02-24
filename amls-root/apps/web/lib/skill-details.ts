// lib/skill-details.ts

export interface RoadmapStep {
  label: string;
  subLabel: string;
}

export interface SkillModule {
  id: string;
  title: string;
  description: string;
  isLocked: boolean;
}

export interface DetailedRoadmap {
  id: string;
  title: string;
  userCount: string;
  progressPercent: number;
  currentStepIndex: number; // 0 for Start, 1 for Step 2, etc.
  steps: RoadmapStep[];
  modules: SkillModule[];
}

export const skillRoadmaps: Record<string, DetailedRoadmap> = {
  "track-1": {
    id: "track-1",
    title: "Database",
    userCount: "123,456",
    progressPercent: 65,
    currentStepIndex: 2,
    steps: [
      { label: "Start", subLabel: "Introduction" },
      { label: "Step 2", subLabel: "SQL Fundamentals" },
      { label: "Step 3", subLabel: "Relational Design" },
      { label: "Finish", subLabel: "Advanced Joins" }
    ],
    modules: [
      { id: "m1", title: "Introduction to Databases", description: "Fundamental concepts and architecture", isLocked: false },
      { id: "m2", title: "SQL Fundamentals", description: "SELECT, WHERE, and basic filtering", isLocked: false },
      { id: "m3", title: "Relational Design & Normalization", description: "1NF, 2NF, 3NF and Entity Relationships", isLocked: false },
      { id: "m4", title: "Advanced Joins & Subqueries", description: "Complex data retrieval techniques", isLocked: true }
    ]
  },
  // You can easily add "track-2" (Web Dev) or "track-3" (ML) here later
};