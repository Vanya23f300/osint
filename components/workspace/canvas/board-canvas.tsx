'use client';

import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useBoardStore } from '@/lib/store';
import { ThoughtNode } from './thought-node';

const nodeTypes = {
  thought: ThoughtNode,
};

export function BoardCanvas() {
  const {
    thoughts,
    connections,
    selectThought,
    addConnection,
    updateThought,
  } = useBoardStore();

  // Convert thoughts to React Flow nodes
  const initialNodes = useMemo(
    () =>
      thoughts.map((thought) => ({
        id: thought.id,
        type: 'thought',
        position: thought.position,
        data: thought as any,
      })),
    [thoughts]
  );

  // Convert connections to React Flow edges
  const initialEdges: Edge[] = useMemo(
    () =>
      connections.map((conn) => ({
        id: conn.id,
        source: conn.sourceId,
        target: conn.targetId,
        type: 'straight',
        animated: false,
        style: {
          stroke:
            conn.type === 'supports'
              ? 'hsl(142 76% 46%)'
              : conn.type === 'contradicts'
              ? 'hsl(0 72% 51%)'
              : 'hsl(240 5% 60%)',
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 16,
          color:
            conn.type === 'supports'
              ? 'hsl(142 76% 46%)'
              : conn.type === 'contradicts'
              ? 'hsl(0 72% 51%)'
              : 'hsl(240 5% 60%)',
        },
      })),
    [connections]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when thoughts change
  useMemo(() => {
    setNodes(
      thoughts.map((thought) => ({
        id: thought.id,
        type: 'thought',
        position: thought.position,
        data: thought as any,
      }))
    );
  }, [thoughts, setNodes]);

  // Update edges when connections change
  useMemo(() => {
    setEdges(
      connections.map((conn) => ({
        id: conn.id,
        source: conn.sourceId,
        target: conn.targetId,
        type: 'straight',
        animated: false,
        style: {
          stroke:
            conn.type === 'supports'
              ? 'hsl(142 76% 46%)'
              : conn.type === 'contradicts'
              ? 'hsl(0 72% 51%)'
              : 'hsl(240 5% 60%)',
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 16,
          color:
            conn.type === 'supports'
              ? 'hsl(142 76% 46%)'
              : conn.type === 'contradicts'
              ? 'hsl(0 72% 51%)'
              : 'hsl(240 5% 60%)',
        },
      }))
    );
  }, [connections, setEdges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        console.log('Creating connection:', connection);
        const newConnection = {
          id: `connection-${Date.now()}`,
          boardId: thoughts[0]?.boardId || 'board-1',
          sourceId: connection.source,
          targetId: connection.target,
          type: 'related' as const,
        };
        console.log('Adding connection to store:', newConnection);
        addConnection(newConnection);
        
        // Also add to React Flow edges immediately
        setEdges((eds) => addEdge({
          ...connection,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#94a3b8', strokeWidth: 3 },
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#94a3b8' },
        }, eds));
      }
    },
    [addConnection, thoughts, setEdges]
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      selectThought(node.id);
    },
    [selectThought]
  );

  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      updateThought(node.id, { position: node.position });
    },
    [updateThought]
  );

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        className="bg-background"
      >
        <Background
          gap={40}
          size={1}
          color="hsl(240 5% 22%)"
          variant={BackgroundVariant.Lines}
        />
        <Controls className="bg-card border border-border" />
        <MiniMap
          nodeColor={(node) => {
            const thought = node.data;
            switch (thought.type) {
              case 'Question':
                return '#3b82f6';
              case 'Hypothesis':
                return '#8b5cf6';
              case 'Claim':
                return '#22c55e';
              case 'Observation':
                return '#f59e0b';
              default:
                return '#94a3b8';
            }
          }}
          className="bg-card border border-border"
          maskColor="rgba(15, 20, 25, 0.8)"
        />
      </ReactFlow>
    </div>
  );
}
