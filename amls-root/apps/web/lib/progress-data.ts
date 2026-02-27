// lib/progress-data.ts
import { Node, Edge } from '@xyflow/react';

export type NodeStatus = 'completed' | 'progress' | 'locked';
export type NodeType = 'root' | 'category' | 'skill' | 'topic';

export type ProgressNodeData = {
  label: string;
  icon?: string;
  status: NodeStatus;
  type: NodeType;
  color?: string; // used for categories e.g. 'blue', 'pink'
  percentage?: string;
  isCollapsible?: boolean;
  isCollapsed?: boolean;
};

// Based on the user's sketch 
export const initialNodes: Node<ProgressNodeData>[] = [
  // --- ROOT ---
  {
    id: 'root',
    position: { x: 400, y: 700 }, // Placed at the bottom-center
    data: { label: '', icon: 'Crown', status: 'completed', type: 'root', color: '#ffeb3b' },
    type: 'progressNode',
  },

  // --- PINK BRANCH (Category 2) ---
  {
    id: 'cat-pink',
    position: { x: 400, y: 850 },
    data: { label: '', status: 'locked', type: 'category', color: '#ffb3e6' },
    type: 'progressNode',
  },
  {
    id: 'skill-pink-1',
    position: { x: 250, y: 850 },
    data: { label: '', status: 'locked', type: 'skill', color: '#ffb3e6' },
    type: 'progressNode',
  },
  {
    id: 'skill-pink-2',
    position: { x: 550, y: 800 },
    data: { label: '', status: 'locked', type: 'skill', color: '#ffb3e6' },
    type: 'progressNode',
  },
  {
    id: 'skill-pink-3',
    position: { x: 450, y: 950 },
    data: { label: '', status: 'locked', type: 'skill', color: '#ffb3e6' },
    type: 'progressNode',
  },

  // --- BLUE BRANCH (Tech / Category 1) ---
  {
    id: 'cat-tech',
    position: { x: 400, y: 550 },
    data: { label: 'Tech', status: 'completed', type: 'category', color: '#4da6ff' },
    type: 'progressNode',
  },

  // Skills under Tech
  {
    id: 'skill-ml',
    position: { x: 250, y: 450 },
    data: { label: 'ML', status: 'completed', type: 'skill', color: '#4da6ff', isCollapsible: true, isCollapsed: true },
    type: 'progressNode',
  },
  {
    id: 'skill-python',
    position: { x: 400, y: 400 },
    data: { label: 'Python', status: 'progress', type: 'skill', color: '#4da6ff', percentage: '60%' },
    type: 'progressNode',
  },
  {
    id: 'skill-ml2', // The right ML branch
    position: { x: 550, y: 450 },
    data: { label: 'ML', status: 'completed', type: 'skill', color: '#4da6ff', isCollapsible: true, isCollapsed: false },
    type: 'progressNode',
  },

  // Topics under Python
  {
    id: 'topic-py-intro',
    position: { x: 400, y: 250 },
    data: { label: 'Intro', status: 'completed', type: 'topic', color: '#4da6ff' },
    parent: 'skill-python',
    type: 'progressNode',
  },
  {
    id: 'topic-py-func',
    position: { x: 500, y: 150 },
    data: { label: 'Function', status: 'locked', type: 'topic', color: '#4da6ff' },
    parent: 'skill-python',
    type: 'progressNode',
  },
  {
    id: 'topic-py-etc',
    position: { x: 300, y: 150 },
    data: { label: '...', status: 'locked', type: 'topic', color: '#4da6ff' },
    parent: 'skill-python',
    type: 'progressNode',
  },
  {
    id: 'topic-py-class',
    position: { x: 400, y: 50 },
    data: { label: 'Class', status: 'locked', type: 'topic', color: '#4da6ff' },
    parent: 'skill-python',
    type: 'progressNode',
  },

  // Topics under ML2 (The expanded one on the right)
  {
    id: 'topic-ml-intro',
    position: { x: 650, y: 250 },
    data: { label: 'Intro', status: 'completed', type: 'topic', color: '#4da6ff' },
    parent: 'skill-ml2', // Used for rendering collapse
    type: 'progressNode',
  },
  {
    id: 'topic-ml-fund',
    position: { x: 750, y: 400 },
    data: { label: 'Fundamental', status: 'progress', type: 'topic', color: '#4da6ff', percentage: '30%' },
    parent: 'skill-ml2',
    type: 'progressNode',
  },
  {
    id: 'topic-ml-etc1',
    position: { x: 900, y: 250 }, // Top
    data: { label: '...', status: 'locked', type: 'topic', color: '#4da6ff' },
    parent: 'skill-ml2',
    type: 'progressNode',
  },
  {
    id: 'topic-ml-etc2',
    position: { x: 900, y: 400 }, // Middle
    data: { label: '...', status: 'locked', type: 'topic', color: '#4da6ff' },
    parent: 'skill-ml2',
    type: 'progressNode',
  },
  {
    id: 'topic-ml-etc3',
    position: { x: 900, y: 550 }, // Bottom
    data: { label: '...', status: 'locked', type: 'topic', color: '#4da6ff' },
    parent: 'skill-ml2',
    type: 'progressNode',
  },
  {
    id: 'topic-ml-adv',
    position: { x: 1100, y: 400 },
    data: { label: 'Advanced', status: 'locked', type: 'topic', color: '#4da6ff' },
    parent: 'skill-ml2',
    type: 'progressNode',
  },
];

export const initialEdges: Edge[] = [
  // Root -> Categories
  { id: 'e-root-pink', source: 'root', target: 'cat-pink', animated: true, style: { strokeWidth: 2, stroke: '#d9d9d9' } },
  { id: 'e-root-tech', source: 'root', target: 'cat-tech', animated: true, style: { strokeWidth: 6, stroke: '#1a75ff' } }, // Highlighted

  // Category Pink -> Skills
  { id: 'e-pink-1', source: 'cat-pink', target: 'skill-pink-1', style: { strokeWidth: 2, stroke: '#ffb3e6' } },
  { id: 'e-pink-2', source: 'cat-pink', target: 'skill-pink-2', style: { strokeWidth: 2, stroke: '#ffb3e6' } },
  { id: 'e-pink-3', source: 'cat-pink', target: 'skill-pink-3', style: { strokeWidth: 2, stroke: '#ffb3e6' } },

  // Category Tech -> Skills
  { id: 'e-tech-ml', source: 'cat-tech', target: 'skill-ml', animated: true, style: { strokeWidth: 6, stroke: '#1a75ff' } },
  { id: 'e-tech-py', source: 'cat-tech', target: 'skill-python', animated: true, style: { strokeWidth: 6, stroke: '#1a75ff' } },
  { id: 'e-tech-ml2', source: 'cat-tech', target: 'skill-ml2', animated: true, style: { strokeWidth: 6, stroke: '#1a75ff' } },

  // Skill Python -> Topics
  { id: 'e-py-intro', source: 'skill-python', target: 'topic-py-intro', animated: true, style: { strokeWidth: 6, stroke: '#1a75ff' } },
  { id: 'e-py-func', source: 'topic-py-intro', target: 'topic-py-func', style: { strokeWidth: 2, stroke: '#1a75ff' } },
  { id: 'e-py-etc', source: 'topic-py-intro', target: 'topic-py-etc', style: { strokeWidth: 2, stroke: '#1a75ff' } },
  { id: 'e-func-class', source: 'topic-py-func', target: 'topic-py-class', style: { strokeWidth: 2, stroke: '#1a75ff' } },
  { id: 'e-etc-class', source: 'topic-py-etc', target: 'topic-py-class', style: { strokeWidth: 2, stroke: '#1a75ff' } },

  // Skill ML2 -> Topics
  { id: 'e-ml2-intro', source: 'skill-ml2', target: 'topic-ml-intro', animated: true, style: { strokeWidth: 6, stroke: '#1a75ff' } },
  { id: 'e-ml2-fund', source: 'skill-ml2', target: 'topic-ml-fund', animated: true, style: { strokeWidth: 6, stroke: '#1a75ff' } },

  // Converging ML topics
  { id: 'e-ml-intro-etc1', source: 'topic-ml-intro', target: 'topic-ml-etc1', animated: true, style: { strokeWidth: 6, stroke: '#1a75ff' } },
  { id: 'e-ml-intro-fund', source: 'topic-ml-intro', target: 'topic-ml-fund', style: { strokeWidth: 2, stroke: '#1a75ff' } }, // DAG crosslink
  { id: 'e-ml-fund-etc1', source: 'topic-ml-fund', target: 'topic-ml-etc1', animated: true, style: { strokeWidth: 6, stroke: '#1a75ff' } },
  { id: 'e-ml-fund-etc2', source: 'topic-ml-fund', target: 'topic-ml-etc2', style: { strokeWidth: 2, stroke: '#1a75ff' } },
  { id: 'e-ml-fund-etc3', source: 'topic-ml-fund', target: 'topic-ml-etc3', style: { strokeWidth: 2, stroke: '#1a75ff' } },
  { id: 'e-ml-etc1-adv', source: 'topic-ml-etc1', target: 'topic-ml-adv', style: { strokeWidth: 2, stroke: '#1a75ff' } },
  { id: 'e-ml-etc2-adv', source: 'topic-ml-etc2', target: 'topic-ml-adv', style: { strokeWidth: 2, stroke: '#1a75ff' } },
  { id: 'e-ml-etc3-adv', source: 'topic-ml-etc3', target: 'topic-ml-adv', style: { strokeWidth: 2, stroke: '#1a75ff' } },
];