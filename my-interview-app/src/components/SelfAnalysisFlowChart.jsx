import React, { useState, useCallback } from 'react';
// 変更点①：インポート元を '@xyflow/react' に変更し，ReactFlowを名前付きインポートにする
import {
  ReactFlow,
  Background,
  Controls,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
// 変更点②：スタイルシートのインポートパスを変更
import '@xyflow/react/dist/style.css';
import SelfAnalysis from './SelfAnalysis';

// --- ノードとエッジの初期データ（前回のコードと全く同じです） ---
// --- ノードの初期データ ---
const initialNodes = [
  // 中央ノード
  {
    id: 'center',
    position: { x: 450, y: 300 },
    data: { label: <div><strong>エピソード</strong><br/>大学時代のサークル活動で<br/>イベントを企画・運営した経験</div> },
    style: { backgroundColor: '#1E293B', color: 'white', borderRadius: '8px', padding: '16px', width: 220, textAlign: 'center' },
  },

  // 左上：何を考えたか
  {
    id: 'think',
    position: { x: 100, y: 100 },
    data: { label: <div><strong>何を考えたか</strong><br/><span style={{fontSize: '10px'}}>その状況でどのように考え，<br/>行動の方向性を決めたか</span></div> },
    style: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderRadius: '8px', width: 200 },
  },
  { id: 'think-1', position: { x: -100, y: 50 }, data: { label: '参加者に楽しんでもらうには？' }, style: { width: 180, fontSize: '12px' } },
  { id: 'think-2', position: { x: -100, y: 110 }, data: { label: '限られた予算・時間で最大の成果を出すには？' }, style: { width: 180, fontSize: '12px' } },
  { id: 'think-3', position: { x: -100, y: 170 }, data: { label: 'メンバーの強みを活かすには？' }, style: { width: 180, fontSize: '12px' } },

  // 左下：何を得たか
  {
    id: 'gain',
    position: { x: 100, y: 500 },
    data: { label: <div><strong>何を得たか</strong><br/><span style={{fontSize: '10px'}}>経験を通じて得たものや<br/>成長したポイント</span></div> },
    style: { backgroundColor: '#FEFCE8', borderColor: '#FEF08A', borderRadius: '8px', width: 200 },
  },
  { id: 'gain-1', position: { x: -100, y: 450 }, data: { label: '企画力・行動力' }, style: { width: 180, fontSize: '12px' } },
  { id: 'gain-2', position: { x: -100, y: 510 }, data: { label: 'チームをまとめる力' }, style: { width: 180, fontSize: '12px' } },
  { id: 'gain-3', position: { x: -100, y: 570 }, data: { label: '自信と達成感' }, style: { width: 180, fontSize: '12px' } },

  // 右上：何を学んだか
  {
    id: 'learn',
    position: { x: 800, y: 100 },
    data: { label: <div><strong>何を学んだか</strong><br/><span style={{fontSize: '10px'}}>経験を通じて学んだことや<br/>気づきは何か</span></div> },
    style: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0', borderRadius: '8px', width: 200 },
  },
  { id: 'learn-1', position: { x: 1050, y: 50 }, data: { label: '計画の重要性と柔軟な対応力' }, style: { width: 180, fontSize: '12px' } },
  { id: 'learn-2', position: { x: 1050, y: 110 }, data: { label: 'チームでの役割分担の大切さ' }, style: { width: 180, fontSize: '12px' } },
  { id: 'learn-3', position: { x: 1050, y: 170 }, data: { label: '振り返りによる改善の効果' }, style: { width: 180, fontSize: '12px' } },

  // 右下：アピールポイント
  {
    id: 'appeal',
    position: { x: 800, y: 480 },
    data: { label: <div><strong>アピールポイント</strong><br/><span style={{fontSize: '10px'}}>強みとしてアピールできる<br/>ポイント（能力・スキル）</span></div> },
    style: { backgroundColor: '#FAF5FF', borderColor: '#E9D5FF', borderRadius: '8px', width: 200 },
  },
  { id: 'appeal-1', position: { x: 1050, y: 410 }, data: { label: <div><strong>課題解決力</strong><br/><span style={{fontSize: '10px'}}>課題を整理し，最適な解決策を考え実行した</span></div> }, style: { width: 220 } },
  { id: 'appeal-2', position: { x: 1050, y: 490 }, data: { label: <div><strong>コミュニケーション能力</strong><br/><span style={{fontSize: '10px'}}>メンバーや関係者と円滑に連携・調整した</span></div> }, style: { width: 220 } },
  { id: 'appeal-3', position: { x: 1050, y: 570 }, data: { label: <div><strong>主体性・行動力</strong><br/><span style={{fontSize: '10px'}}>自ら課題を見つけ，率先して行動した</span></div> }, style: { width: 220 } },
];

// --- エッジ（線）の初期データ ---
const edgeStyle = { stroke: '#94a3b8', strokeWidth: 2 };
const initialEdges = [
  // 中央からの分岐（Bezier曲線で滑らかに）
  { id: 'e-center-think', source: 'center', target: 'think', style: edgeStyle },
  { id: 'e-center-gain', source: 'center', target: 'gain', style: edgeStyle },
  { id: 'e-center-learn', source: 'center', target: 'learn', style: edgeStyle },
  { id: 'e-center-appeal', source: 'center', target: 'appeal', style: edgeStyle },
  
  // 各カテゴリーからの子要素への分岐（直角に近いsmoothstepを使用すると整理されて見えます）
  { id: 'e-think-1', source: 'think', target: 'think-1', type: 'smoothstep' },
  { id: 'e-think-2', source: 'think', target: 'think-2', type: 'smoothstep' },
  { id: 'e-think-3', source: 'think', target: 'think-3', type: 'smoothstep' },

  { id: 'e-gain-1', source: 'gain', target: 'gain-1', type: 'smoothstep' },
  { id: 'e-gain-2', source: 'gain', target: 'gain-2', type: 'smoothstep' },
  { id: 'e-gain-3', source: 'gain', target: 'gain-3', type: 'smoothstep' },

  { id: 'e-learn-1', source: 'learn', target: 'learn-1', type: 'smoothstep' },
  { id: 'e-learn-2', source: 'learn', target: 'learn-2', type: 'smoothstep' },
  { id: 'e-learn-3', source: 'learn', target: 'learn-3', type: 'smoothstep' },

  { id: 'e-appeal-1', source: 'appeal', target: 'appeal-1', type: 'smoothstep' },
  { id: 'e-appeal-2', source: 'appeal', target: 'appeal-2', type: 'smoothstep' },
  { id: 'e-appeal-3', source: 'appeal', target: 'appeal-3', type: 'smoothstep' },
];

const SelfAnalysisFlowChart = () => {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  return (
    <div style={{ width: '100%', height: '800px', backgroundColor: '#f8fafc' }}>
      {/* コンポーネントの呼び出し方も基本的には同じです */}
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