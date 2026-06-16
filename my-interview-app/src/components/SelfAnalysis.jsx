import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import SelfAnalysisFlowChart from './SelfAnalysisFlowChart';
import SelfAnalysisHeader from './SelfAnalysisHeader';
import './SelfAnalysis.css';

const fixedEdges = [
  { id: 'e-center-think', source: 'center', target: 'think' },
  { id: 'e-center-gain', source: 'center', target: 'gain' },
  { id: 'e-center-learn', source: 'center', target: 'learn' },
  { id: 'e-center-why', source: 'center', target: 'why' },
  { id: 'e-center-appeal', source: 'center', target: 'appeal' },
  { id: 'e-center-contribution', source: 'center', target: 'contribution' },
];

const categoryStyles = {
  think: { 
    bg: '#F5F3FF', 
    border: '#C4B5FD', 
    lightBg: '#F5F3FF', 
    lightBorder: '#DDD6FE' 
  },
  why: { 
    bg: '#EFF6FF', 
    border: '#93C5FD', 
    lightBg: '#EFF6FF', 
    lightBorder: '#BFDBFE' 
  },
  gain: { 
    bg: '#FEFCE8', 
    border: '#FDE047', 
    lightBg: '#FEFCE8', 
    lightBorder: '#FEF08A' 
  },
  appeal: { 
    bg: '#FFF7ED', 
    border: '#FDBA74', 
    lightBg: '#FFF7ED', 
    lightBorder: '#FED7AA' 
  },
  learn: { 
    bg: '#F0FDF4', 
    border: '#86EFAC', 
    lightBg: '#F0FDF4', 
    lightBorder: '#BBF7D0' 
  },
  contribution: { 
    bg: '#FFF1F2', 
    border: '#FDA4AF', 
    lightBg: '#FFF1F2', 
    lightBorder: '#FECDD3' 
  },
};

const SelfAnalysis = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState(fixedEdges);
  const [isLoading, setIsLoading] = useState(false);

  // 最新から何件の面接データを取得するかを指定します
  const interviewLimit = 10; 

  const formatNodes = (rawNodes) => {
    return rawNodes.map(node => {
      if (node.id === 'center') {
        return {
          ...node,
          type: 'default',
          data: { 
            label: (
              <div style={{ padding: '0 20px' }}>
                <div style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 'bold', 
                  marginBottom: '1rem',
                  color: '#1E293B'
                }}>
                  {node.data.label_title}
                </div>
                <div style={{ 
                  fontSize: '0.9rem', 
                  lineHeight: '1.6',
                  color: '#475569',
                  textAlign: 'left'
                }}>
                  {node.data.label_content}
                </div>
              </div>
            ) 
          },
          style: { 
            backgroundColor: '#F0F7FF', 
            color: '#1E293B', 
            borderRadius: '12px', 
            border: '1px solid #D1E9FF',
            padding: '24px', 
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
          },
        };
      }

      if (node.type === 'child') {
        const styleInfo = categoryStyles[node.id];
        return {
          ...node,
          type: 'default',
          data: { label: <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{node.data.label}</div> },
          style: { 
            backgroundColor: styleInfo?.bg, 
            borderColor: styleInfo?.border, 
            borderRadius: '10px', 
            borderWidth: '2px',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '8px'
          }
        };
      }

      if (node.type === 'grandchild') {
        const parentCategory = node.id.split('-')[0];
        const styleInfo = categoryStyles[parentCategory];
        return {
          ...node,
          type: 'default',
          data: { label: <div style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>{node.data.label}</div> },
          style: { 
            backgroundColor: styleInfo?.lightBg, 
            borderColor: styleInfo?.lightBorder, 
            borderRadius: '10px', 
            borderWidth: '1px',
            padding: '12px' 
          }
        };
      }

      return node;
    });
  };

  // --- データの取得 ---
  const HandleGetSelfAnalysis = async () => {
    try {
      // URLから sessionId を排除しました
      const token = localStorage.getItem("token"); 
      const response = await fetch(`http://localhost:8000/self-analysis/graph-data`, {
        headers: {
        "Authorization": `Bearer ${token}` // ヘッダを追加
        }
      });
      if (!response.ok) {
        throw new Error('データの取得に失敗しました．');
      }
      const data = await response.json();
      
      const formattedNodes = formatNodes(data.rawNodes);
      setNodes(formattedNodes);
      setEdges([...fixedEdges, ...data.dynamicEdges]);
    } catch (error) {
      console.error(error);
    }
  };

  // --- 分析のリクエスト ---
  const HandleRequestSelfAnalysis = async () => {
    setIsLoading(true);
    try {
          const token = localStorage.getItem("token"); // トークンを取得
          // クエリパラメータで limit 件数を渡すように変更しました
          const response = await fetch(`http://localhost:8000/self-analysis/analyze?limit=${interviewLimit}`, {
            method: 'POST',
            headers: {
              "Authorization": `Bearer ${token}` // ヘッダを追加
            }
          });
      if (!response.ok) {
        throw new Error('分析リクエストに失敗しました．');
      }
      await HandleGetSelfAnalysis();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    HandleGetSelfAnalysis();
  }, []);

  return (
    <>
      <Helmet>
        <title>自己分析マインドマップ | 面接対策アプリ</title>
        <meta name="description" content="過去の面接データからあなたの強みを可視化．エピソードを整理して話せるように" />
      </Helmet>
      <SelfAnalysisHeader 
        HandleRequestSelfAnalysis={HandleRequestSelfAnalysis} 
        isLoading={isLoading}
      />
      <SelfAnalysisFlowChart rawNodes={nodes} rawEdges={edges} />
    </>
  );
};

export default SelfAnalysis;