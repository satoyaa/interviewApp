import React, { useState, useEffect } from 'react';
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
  think: { bg: '#DBEAFE', border: '#93C5FD', lightBg: '#EFF6FF', lightBorder: '#BFDBFE' },
  why: { bg: '#DBEAFE', border: '#93C5FD', lightBg: '#EFF6FF', lightBorder: '#BFDBFE' },
  gain: { bg: '#FEF08A', border: '#FDE047', lightBg: '#FEFCE8', lightBorder: '#FEF08A' },
  appeal: { bg: '#FEF08A', border: '#FDE047', lightBg: '#FEFCE8', lightBorder: '#FEF08A' },
  learn: { bg: '#BBF7D0', border: '#86EFAC', lightBg: '#F0FDF4', lightBorder: '#BBF7D0' },
  contribution: { bg: '#BBF7D0', border: '#86EFAC', lightBg: '#F0FDF4', lightBorder: '#BBF7D0' },
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
              <div>
                <strong>{node.data.label_title}</strong><br/>
                {node.data.label_content}
              </div>
            ) 
          },
          style: { backgroundColor: '#1E293B', color: 'white', borderRadius: '8px', padding: '16px', textAlign: 'center' },
        };
      }

      if (node.type === 'child') {
        const styleInfo = categoryStyles[node.id];
        return {
          ...node,
          type: 'default',
          data: { label: <strong>{node.data.label}</strong> },
          style: { 
            backgroundColor: styleInfo?.bg, 
            borderColor: styleInfo?.border, 
            borderRadius: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }
        };
      }

      if (node.type === 'grandchild') {
        const parentCategory = node.id.split('-')[0];
        const styleInfo = categoryStyles[parentCategory];
        return {
          ...node,
          type: 'default',
          data: { label: <div>{node.data.label}</div> },
          style: { 
            backgroundColor: styleInfo?.lightBg, 
            borderColor: styleInfo?.lightBorder, 
            borderRadius: '8px', 
            padding: '10px' 
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
      <SelfAnalysisHeader 
        HandleRequestSelfAnalysis={HandleRequestSelfAnalysis} 
        isLoading={isLoading}
      />
      <SelfAnalysisFlowChart rawNodes={nodes} rawEdges={edges} />
    </>
  );
};

export default SelfAnalysis;