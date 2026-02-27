'use client';

import React, { useState, useCallback, useMemo } from 'react';
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
} from '@xyflow/react';

import { initialNodes, initialEdges, ProgressNodeData } from '@/lib/progress-data';
import { ProgressNode } from './ProgressNode';

const nodeTypes = {
    progressNode: ProgressNode,
};

export default function FlowGraph() {
    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );

    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    // Handle click to expand/collapse
    const onNodeClick: NodeMouseHandler = useCallback((event, clickedNode) => {
        const data = clickedNode.data as ProgressNodeData;

        // Only allow expanding if the node is collapsible AND we are allowed to click it
        if (data.isCollapsible && data.status !== 'locked') {
            const isCurrentlyCollapsed = data.isCollapsed;

            setNodes((currentNodes) => {
                return currentNodes.map((n) => {
                    // Toggle the clicked node's state
                    if (n.id === clickedNode.id) {
                        return {
                            ...n,
                            data: { ...n.data, isCollapsed: !isCurrentlyCollapsed }
                        };
                    }

                    // Show or hide chilren connected via 'parent' property mapping
                    const nData = n.data as ProgressNodeData & { parent?: string };
                    // If we are expanding, and this node is a child of the clicked node, reveal it
                    // Note: In a real app we might do deeper traversal. We assume immediate children for simplicity.
                    if ((n as any).parent === clickedNode.id) {
                        return {
                            ...n,
                            hidden: !isCurrentlyCollapsed,
                        }
                    }

                    return n;
                });
            });
        }
    }, []);

    // Filter hidden nodes before rendering
    const visibleNodes = useMemo(() => {
        // Determine which node IDs are visible
        const visibleIds = new Set<string>();

        nodes.forEach(node => {
            // Basic approach: If a node has a parent, check if parent is collapsed
            const parentId = (node as any).parent;
            if (parentId) {
                const parentNode = nodes.find(n => n.id === parentId);
                const parentData = parentNode?.data as ProgressNodeData;
                if (parentData?.isCollapsed) {
                    return; // Hide this child
                }
            }
            visibleIds.add(node.id);
        });

        return nodes.filter(n => visibleIds.has(n.id));

    }, [nodes]);

    // Filter edges connected to hidden nodes
    const visibleEdges = useMemo(() => {
        const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
        return edges.filter(e => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target));
    }, [visibleNodes, edges]);


    return (
        <div className="w-full h-full min-h-[600px] border border-gray-200 rounded-3xl overflow-hidden shadow-inner bg-white/50 backdrop-blur-sm">
            <ReactFlow
                nodes={visibleNodes}
                edges={visibleEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                minZoom={0.5}
                maxZoom={1.5}
                proOptions={{ hideAttribution: true }}
            >
                <Background gap={16} size={1} color="#cbd5e1" />
                <Controls showInteractive={false} className="bg-white border-gray-200 shadow-sm" />
            </ReactFlow>
        </div>
    );
}
