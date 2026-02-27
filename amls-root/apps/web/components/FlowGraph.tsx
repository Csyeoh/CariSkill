'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    ReactFlow,
    Controls,
    Background,
    applyNodeChanges,
    applyEdgeChanges,
    NodeChange,
    EdgeChange,
    Node,
    Edge,
    NodeMouseHandler,
    Position,
    useReactFlow,
} from '@xyflow/react';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { initialNodes, initialEdges, ProgressNodeData } from '@/lib/progress-data';
import { ProgressNode } from './ProgressNode';

const nodeTypes = {
    progressNode: ProgressNode,
};

// Computes auto-layout based on ranks (BT = bottom to top)
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
    // 1. Build relationships
    const childrenMap = new Map<string, string[]>();
    nodes.forEach(n => childrenMap.set(n.id, []));
    edges.forEach(e => {
        if (childrenMap.has(e.source)) {
            childrenMap.get(e.source)!.push(e.target);
        }
    });

    // Compute depth for sequential animation
    const depths = new Map<string, number>();
    depths.set('user', 0);
    const queue = ['user'];
    while (queue.length > 0) {
        const curr = queue.shift()!;
        const currentDepth = depths.get(curr)!;
        const children = childrenMap.get(curr) || [];
        children.forEach(child => {
            if (!depths.has(child)) {
                depths.set(child, currentDepth + 1);
                queue.push(child);
            }
        });
    }

    // 2. Radial Placement Math
    const nodePositions = new Map<string, { x: number, y: number }>();
    nodePositions.set('user', { x: 0, y: 0 });

    // Distance per depth level
    const depthRadius = 240;

    const visited = new Set<string>();
    visited.add('user');

    // We traverse out recursively and assign angles to children based on their parent's angle slice
    const traverseRadial = (nodeId: string, currentDepth: number, centerAngle: number, sliceWidth: number) => {
        const rawChildren = childrenMap.get(nodeId) || [];
        // Only process unvisited children to prevent multiple parents messing up the slice layout
        const children = rawChildren.filter(c => !visited.has(c));

        if (children.length === 0) return;

        // Start from the leftmost edge of this node's allotted pie slice
        const startAngle = centerAngle - (sliceWidth / 2);
        const childSlice = sliceWidth / children.length;

        children.forEach((childId, i) => {
            visited.add(childId);

            // The center of this specific child's slice
            const childAngle = startAngle + (i * childSlice) + (childSlice / 2);

            // Convert polar (radius, angle) to Cartesian (x, y)
            const r = currentDepth * depthRadius;
            const x = r * Math.cos(childAngle);
            const y = r * Math.sin(childAngle);

            nodePositions.set(childId, { x, y });

            // Reduce the slice width slightly as we go deeper so sub-branches don't fan out so wide they hit neighbors
            const nextSliceWidth = currentDepth === 1 ? (Math.PI * 2) / children.length : childSlice * 0.85;

            // Recurse to place its children
            traverseRadial(childId, currentDepth + 1, childAngle, nextSliceWidth);
        });
    };

    // Begin distribution: Give the root's immediate children the full 360 degrees (0 to 2PI)
    traverseRadial('user', 1, 0, Math.PI * 2);

    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    const newNodes = nodes.map((node) => {
        const pos = nodePositions.get(node.id) || { x: 0, y: 0 };
        const newNode = { ...node };

        // For radical map, we don't strict-bind source/target positions, letting ReactFlow find the shortest path edges
        // Or we use floating edges depending on design. For simplicity, just unbind specific BT routing.
        delete newNode.targetPosition;
        delete newNode.sourcePosition;

        let size = 64;
        if (node.data.type === 'user') size = 80;
        else if (node.data.type === 'category') size = 72;
        else if (node.data.type === 'tech') size = 64;
        else if (node.data.type === 'level1') size = 56;
        else size = 48;

        newNode.position = {
            x: pos.x - size / 2,
            y: pos.y - size / 2,
        };

        newNode.data = { ...newNode.data, depth: depths.get(node.id) || 0 };

        if (newNode.position.x < minX) minX = newNode.position.x;
        if (newNode.position.y < minY) minY = newNode.position.y;
        if (newNode.position.x > maxX) maxX = newNode.position.x;
        if (newNode.position.y > maxY) maxY = newNode.position.y;

        return newNode;
    });

    const newEdges = edges.map(edge => ({
        ...edge,
        data: { ...edge.data, sourceDepth: depths.get(edge.source) || 0 }
    }));

    const bounds = {
        minX: minX === Infinity ? -1000 : minX - 400,
        minY: minY === Infinity ? -1000 : minY - 400,
        maxX: maxX === -Infinity ? 1000 : maxX + 400,
        maxY: maxY === -Infinity ? 1000 : maxY + 400,
    };

    return { nodes: newNodes, edges: newEdges, bounds };
};

export default function FlowGraph() {
    // Only compute layout once on initial render
    const { nodes: layoutedNodes, edges: layoutedEdges, bounds } = useMemo(() =>
        getLayoutedElements(initialNodes, initialEdges), []
    );

    const [nodes, setNodes] = useState<Node[]>(layoutedNodes);
    const [edges, setEdges] = useState<Edge[]>(layoutedEdges);

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );

    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    const router = useRouter();

    // Handle click to expand/collapse or navigate
    const onNodeClick: NodeMouseHandler = useCallback((event, clickedNode) => {
        const data = clickedNode.data as ProgressNodeData;
        const target = event.target as HTMLElement;

        // 1. If clicking the +/- toggle, expand/collapse
        if (target.closest('.collapse-toggle-btn')) {
            if (data.isCollapsible && data.status !== 'locked') {
                const isCurrentlyCollapsed = data.isCollapsed;
                setNodes((currentNodes) => {
                    return currentNodes.map((n) => {
                        if (n.id === clickedNode.id) {
                            return {
                                ...n,
                                data: { ...n.data, isCollapsed: !isCurrentlyCollapsed }
                            };
                        }
                        return n;
                    });
                });
            }
            return;
        }

        // 2. Otherwise navigate to the skill detail page
        if (data.status !== 'locked' && data.type !== 'user' && data.type !== 'category') {
            router.push(`/skill/${clickedNode.id}`);
        }
    }, [router]);

    // Filter hidden nodes before rendering
    const visibleNodes = useMemo(() => {
        // Collect all node IDs that are descendants of a collapsed node
        const hiddenNodeIds = new Set<string>();

        // Build adjacency list for fast lookup (parent -> children)
        const childrenMap = new Map<string, string[]>();
        edges.forEach(e => {
            if (!childrenMap.has(e.source)) childrenMap.set(e.source, []);
            childrenMap.get(e.source)!.push(e.target);
        });

        // Traverse to find all hidden nodes
        const traverseAndHide = (nodeId: string) => {
            const children = childrenMap.get(nodeId) || [];
            children.forEach(childId => {
                hiddenNodeIds.add(childId);
                traverseAndHide(childId); // recursively hide descendants
            });
        };

        nodes.forEach(node => {
            const data = node.data as ProgressNodeData;
            if (data.isCollapsed && !hiddenNodeIds.has(node.id)) {
                // This node is collapsed, hide ALL its descendants
                traverseAndHide(node.id);
            }
        });

        return nodes.filter(n => !hiddenNodeIds.has(n.id));

    }, [nodes, edges]);

    // Filter edges connected to hidden nodes
    const visibleEdges = useMemo(() => {
        const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
        return edges.filter(e => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)).map(e => ({
            ...e,
            style: {
                ...e.style,
                animationDelay: `${(e.data?.sourceDepth as number || 0) * 0.3}s`
            }
        }));
    }, [visibleNodes, edges]);


    function ZoomControls() {
        const { zoomIn, zoomOut, fitView } = useReactFlow();

        return (
            <div className="absolute right-6 bottom-6 flex flex-col gap-2 z-10">
                <button
                    onClick={() => zoomIn({ duration: 300 })}
                    className="bg-white p-3 rounded-xl shadow-lg border border-gray-100/50 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-95 group"
                    aria-label="Zoom In"
                >
                    <ZoomIn className="w-5 h-5 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                </button>
                <button
                    onClick={() => zoomOut({ duration: 300 })}
                    className="bg-white p-3 rounded-xl shadow-lg border border-gray-100/50 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-95 group"
                    aria-label="Zoom Out"
                >
                    <ZoomOut className="w-5 h-5 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                </button>
                <button
                    onClick={() => fitView({ duration: 800, padding: 0.3 })}
                    className="bg-white p-3 rounded-xl shadow-lg border border-gray-100/50 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-95 group mt-2"
                    aria-label="Fit View"
                >
                    <Maximize className="w-5 h-5 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                </button>
            </div>
        );
    }

    return (
        <div className="w-full h-[1200px] relative">
            <ReactFlow
                nodes={visibleNodes}
                edges={visibleEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                nodesDraggable={false}
                zoomOnDoubleClick={false}
                zoomOnScroll={false}
                panOnScroll={false}
                panOnDrag={true}
                preventScrolling={false}
                translateExtent={[[bounds.minX, bounds.minY], [bounds.maxX, bounds.maxY]]}
                fitView
                fitViewOptions={{ padding: 0.3 }}
                minZoom={0.2}
                maxZoom={1.5}
                proOptions={{ hideAttribution: true }}
            >
                {/* No Default Controls */}
                <ZoomControls />
            </ReactFlow>
        </div>
    );
}
