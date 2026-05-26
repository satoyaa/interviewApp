import SelfAnalysisFlowChart from './SelfAnalysisFlowChart'

// --- 1. ノードのデータ（親・子・孫） ---
const rawNodes = [
  // 【親ノード：エピソード概要】
  {
    id: 'center',
    data: { label: <div><strong>エピソード概要</strong><br/>ここにバックエンドから取得した600文字程度の非常に長い文章が入ると仮定します．サークル活動の背景，当時の課題，なぜそのイベントが必要だったのかという動機から，具体的な組織の状況まで，面接官に詳細に伝えるための詳細なエピソードテキストがここに出力されます．</div> },
    style: { backgroundColor: '#1E293B', color: 'white', borderRadius: '8px', padding: '16px', textAlign: 'center' },
  },

  // 【子ノード：項目名】
  { id: 'think', data: { label: <strong>何を考えたか</strong> }, style: { backgroundColor: '#DBEAFE', borderColor: '#93C5FD', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
  { id: 'gain', data: { label: <strong>何を得たか</strong> }, style: { backgroundColor: '#FEF08A', borderColor: '#FDE047', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
  { id: 'learn', data: { label: <strong>何を学んだか</strong> }, style: { backgroundColor: '#BBF7D0', borderColor: '#86EFAC', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
  { id: 'why', data: { label: <strong>なぜそれをやったのか</strong> }, style: { backgroundColor: '#DBEAFE', borderColor: '#93C5FD', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
  { id: 'appeal', data: { label: <strong>どんな能力がアピールできるか</strong> }, style: { backgroundColor: '#FEF08A', borderColor: '#FDE047', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
  { id: 'contribution', data: { label: <strong>どう活かせるか</strong> }, style: { backgroundColor: '#BBF7D0', borderColor: '#86EFAC', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' } },

  // 【孫ノード：各項目のエピソード詳細】（1〜複数個）
  // "何を考えたか" の孫（3つ）
  { id: 'think-1', data: { label: <div>参加者が笑顔になる企画を最優先に考えた．</div> }, style: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderRadius: '8px', padding: '10px' } },
  { id: 'think-2', data: { label: <div>限られた予算内で最大の効果を出す方法を模索した．</div> }, style: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderRadius: '8px', padding: '10px' } },
  { id: 'think-3', data: { label: <div>メンバーそれぞれの得意分野をどう活かすか考えた．</div> }, style: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderRadius: '8px', padding: '10px' } },

  // "何を得たか" の孫（2つ）
  { id: 'gain-1', data: { label: <div>困難な状況でも諦めずにやり遂げる行動力を得た．</div> }, style: { backgroundColor: '#FEFCE8', borderColor: '#FEF08A', borderRadius: '8px', padding: '10px' } },
  { id: 'gain-2', data: { label: <div>周囲を巻き込み，チームとして動く力を得た．</div> }, style: { backgroundColor: '#FEFCE8', borderColor: '#FEF08A', borderRadius: '8px', padding: '10px' } },

  // "何を学んだか" の孫（1つ）
  { id: 'learn-1', data: { label: <div>事前の綿密な計画と柔軟に軌道修正する重要性を学んだ．</div> }, style: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0', borderRadius: '8px', padding: '10px' } },
];

// --- 2. エッジ（線）のデータ ---
const fixedEdges = [
    // 親から子への接続
    { id: 'e-center-think', source: 'center', target: 'think' },
    { id: 'e-center-gain', source: 'center', target: 'gain' },
    { id: 'e-center-learn', source: 'center', target: 'learn' },
    { id: 'e-center-why', source: 'center', target: 'why' },
    { id: 'e-center-appeal', source: 'center', target: 'appeal' },
    { id: 'e-center-contribution', source: 'center', target: 'contribution' },
]

const dynamicEdges = [
  // 子から孫への接続
  { id: 'e-think-1', source: 'think', target: 'think-1' },
  { id: 'e-think-2', source: 'think', target: 'think-2' },
  { id: 'e-think-3', source: 'think', target: 'think-3' },
  
  { id: 'e-gain-1', source: 'gain', target: 'gain-1' },
  { id: 'e-gain-2', source: 'gain', target: 'gain-2' },
  
  { id: 'e-learn-1', source: 'learn', target: 'learn-1' },
];


const SelfAnalysis = () => {
    const rawEdges = [...fixedEdges, ...dynamicEdges];

    return (
        <>
        <SelfAnalysisFlowChart rawNodes={rawNodes} rawEdges={rawEdges}></SelfAnalysisFlowChart>
        </>
    )
}

export default SelfAnalysis;