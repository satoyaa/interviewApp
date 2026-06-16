import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
  
  // 画面幅に応じてベースのサイズを調整
  const isMobile = window.innerWidth <= 600;

  // 3階層になるため，縦の隙間（ranksep）を少し調整
  dagreGraph.setGraph({ 
    rankdir: direction, 
    ranksep: isMobile ? 60 : 100, 
    nodesep: isMobile ? 30 : 60 
  });

  nodes.forEach((node) => {
    let width, height;

    // ノードのID規則を使って階層を判定し，サイズを割り当てる
    if (node.id === 'center') {
      // 親（エピソード概要）
      width = isMobile ? 320 : 600; 
      height = isMobile ? 240 : 200;
    } else if (!node.id.includes('-')) {
      // 子（項目名）
      width = isMobile ? 140 : 180;
      height = 50;
    } else {
      // 孫（エピソード詳細）
      width = isMobile ? 180 : 240;
      height = isMobile ? 120 : 100;
    }

    node.measuredWidth = width;
    node.measuredHeight = height;
    dagreGraph.setNode(node.id, { width, height });
  });

  // Build layout-only edges so that grandchildren are stacked vertically under their parent.
  // We create a chain: parent -> gc1 -> gc2 -> gc3 ... for each parent's grandchildren.
  const layoutEdges = [];
  // First, add non-grandchild edges (e.g., center -> child)
  edges.forEach((edge) => {
    if (!edge.target.includes('-')) {
      layoutEdges.push({ source: edge.source, target: edge.target });
    }
  });

  // Group grandchildren by parent
  const grandchildrenByParent = {};
  edges.forEach((edge) => {
    if (edge.target.includes('-')) {
      const parent = edge.source;
      grandchildrenByParent[parent] = grandchildrenByParent[parent] || [];
      grandchildrenByParent[parent].push(edge.target);
    }
  });

  // For each parent, sort grandchildren (stable order preserved) and add chain edges
  Object.keys(grandchildrenByParent).forEach((parent) => {
    const gcs = grandchildrenByParent[parent];
    if (gcs.length === 1) {
      layoutEdges.push({ source: parent, target: gcs[0] });
    } else if (gcs.length > 1) {
      // parent -> first
      layoutEdges.push({ source: parent, target: gcs[0] });
      // chain first -> second -> third ... to force vertical stacking
      for (let i = 0; i < gcs.length - 1; i++) {
        layoutEdges.push({ source: gcs[i], target: gcs[i + 1] });
      }
    }
  });

  layoutEdges.forEach((edge) => {
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
    style: { stroke: '#cbd5e1', strokeWidth: 1.5 },
  }));

  return { layoutedNodes, layoutedEdges };
};

const SelfAnalysisFlowChart = ({rawNodes, rawEdges}) => {
  // 1. 依存配列に rawNodes と rawEdges を追加し，データ到着時に再計算させる
  const { layoutedNodes, layoutedEdges } = useMemo(() => {
    // データがまだ無い場合は空配列を返すガード処理
    if (!rawNodes || rawNodes.length === 0) {
      return { layoutedNodes: [], layoutedEdges: [] };
    }
    return getLayoutedElements(rawNodes, rawEdges, 'TB');
  }, [rawNodes, rawEdges]);

  // 初期値として設定
  const [nodes, setNodes] = useState(layoutedNodes);
  const [edges, setEdges] = useState(layoutedEdges);

  // 2. layoutedNodes または layoutedEdges が再計算されたら，ステートを更新して再描画する
  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  return (
    <div className="flowChartWrapper">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-right"
      >
        <Background variant="dots" gap={16} size={1} color="#f1f5f9" />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default SelfAnalysisFlowChart;