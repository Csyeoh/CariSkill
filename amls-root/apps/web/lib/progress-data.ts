// lib/progress-data.ts

export type NodeStatus = 'completed' | 'progress' | 'locked';

export interface SkillNode {
  id: string;
  title: string;
  status: NodeStatus;
  percentage?: string;
}

export interface SkillTrack {
  id: string;
  title: string;
  icon: string;
  overallProgress: string;
  skills: SkillNode[];
}

export const mockSkillTracks: SkillTrack[] = [
  {
    id: "track-1",
    title: "Database",
    icon: "Database",
    overallProgress: "85% Complete",
    skills: [
      { id: "node-1-1", title: "SQL Basics", status: "completed" },
      { id: "node-1-2", title: "Normalization", status: "completed" },
      { id: "node-1-3", title: "Relational Design", status: "completed" }, // Added an extra completed node
      { id: "node-1-4", title: "NoSQL", status: "progress", percentage: "60%" },
    ]
  },
  {
    id: "track-2",
    title: "Web Dev",
    icon: "Code2",
    overallProgress: "45% Complete",
    skills: [
      { id: "node-2-1", title: "HTML/CSS", status: "completed" },
      { id: "node-2-2", title: "JavaScript", status: "progress", percentage: "30%" },
      // Removed React so this column is shorter
    ]
  },
  {
    id: "track-3",
    title: "Machine Learning",
    icon: "Brain",
    overallProgress: "10% Complete",
    skills: [
      { id: "node-3-1", title: "Python Basics", status: "progress", percentage: "25%" },
      { id: "node-3-2", title: "Pandas", status: "locked" },
      { id: "node-3-3", title: "Neural Nets", status: "locked" },
    ]
  }
];