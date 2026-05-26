import React, { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';



// --- 3. 階層に応じたサイズと自動レイアウト計算 ---
const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  // 3階層になるため，縦の隙間（ranksep）を少し調整
  dagreGraph.setGraph({ rankdir: direction, ranksep: 80, nodesep: 40 });

  nodes.forEach((node) => {
    let width, height;

    // ノードのID規則を使って階層を判定し，サイズを割り当てる
    if (node.id === 'center') {
      // 親（エピソード概要）: 長文用
      width = 380;
      height = 240;
    } else if (!node.id.includes('-')) {
      // 子（項目名）: タイトルのみのコンパクトサイズ
      width = 180;
      height = 50;
    } else {
      // 孫（エピソード詳細）: 50文字程度の標準サイズ
      width = 220;
      height = 100;
    }

    node.measuredWidth = width;
    node.measuredHeight = height;
    dagreGraph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - node.measuredWidth / 2,
        y: nodeWithPosition.y - node.measuredHeight / 2,
      },
      style: {
        ...node.style,
        width: node.measuredWidth,
        minHeight: node.measuredHeight,
      }
    };
  });

  const layoutedEdges = edges.map((edge) => ({
    ...edge,
    type: 'smoothstep',
    style: { stroke: '#94a3b8', strokeWidth: 2 },
  }));

  return { layoutedNodes, layoutedEdges };
};

const SelfAnalysisFlowChart = ({rawNodes, rawEdges}) => {
  const { layoutedNodes, layoutedEdges } = useMemo(() => {
    return getLayoutedElements(rawNodes, rawEdges, 'TB');
  }, []);

  const [nodes, setNodes] = useState(layoutedNodes);
  const [edges, setEdges] = useState(layoutedEdges);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: '#f8fafc' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-right"
      >
        <Background color="#ccc" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default SelfAnalysisFlowChart;