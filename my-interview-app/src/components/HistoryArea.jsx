import ResultVisual from "./ResultVisual";
import HistoryAnalyzeAgain from "./HistoryAnalyzeAgain.jsx";
import { Helmet } from "react-helmet-async";
import './HistoryArea.css';

import { AppContext} from './Context/Context.jsx';
import { useState, useContext, useEffect } from "react";
import { useParams } from 'react-router-dom'

const HistoryArea = () => {
    // 取得したデータを管理するためのState
    const [scoreData, setScoreData] = useState([]);
    const [feedbackData, setFeedbackData] = useState([]);
    const [title, setTitle] = useState("無題のタイトル");
    const [isLoading, setIsLoading] = useState(true);
    const {history_ID, setHistory_ID} = useContext(AppContext);
    const { historyId } = useParams();
    const [chatData, setChatData] = useState([]);
    

    useEffect(() => {
        console.log("分析結果を取得します1")
        const fetchResult = async () => {
            console.log("分析結果を取得します2")
                // ルートパラメータがあれば優先して使用
                const effectiveId = historyId || history_ID;
                // history_IDが渡されていない場合は処理を中断
                if (!effectiveId) {
                    setIsLoading(false);
                    return;
                }

                // params に基づき context を更新
                if (historyId && historyId !== history_ID) {
                    setHistory_ID(historyId);
                }

            try {
                // バックエンドから分析結果を取得
                console.log("分析結果を取得します3")
                const token = localStorage.getItem('token');
                if (!token) {
                    alert('ログインが必要です．');
                    setIsLoading(false);
                    return;
                }

                const response = await fetch(`http://127.0.0.1:8000/api/feedback/${effectiveId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) {
                    throw new Error("結果の取得に失敗しました．");
                }
                const data = await response.json();

                // バックエンドから受け取った feedback 配列をフロントエンド用に整形
                if (data.feedback && data.feedback.length > 0) {
                    
                    // 1. テキスト表示用のfeedbackデータを作成
                    const formattedFeedback = data.feedback.map(item => ({
                        subject: item.subject,
                        contents: item.contents
                    }));

                    // 2. グラフ表示用のscoreデータを作成（'総評'はグラフから除外し，数値を'A'に割り当て）
                    const formattedScore = data.feedback
                        .map(item => ({
                            subject: item.subject,
                            average: item.average, // バックエンドの 'average' をグラフ用の 'A' に対応させる
                            fullMark: 5
                        }));

                    setFeedbackData(formattedFeedback);
                    setScoreData(formattedScore);
                }

                if(data.chat_data){
                    const formattedChatData = data.chat_data.map(item => ({
                        answer: item.content,
                        question: item.llm_response
                    }));
                    setChatData(formattedChatData);
                }
                

                // タイトルがあればセットする
                if (data.title) {
                    setTitle(data.title);
                }

            } catch (error) {
                console.error("エラー:", error);
                alert("データの読み込みに失敗しました．");
            } finally {
                // 成功・失敗にかかわらずローディング状態を解除
                setIsLoading(false);
            }
        };

        fetchResult();
    }, [history_ID, historyId]); // history_ID または route param が変更された時に実行

    // データ取得中の表示
    if (isLoading) {
        return (
            <div className="historyAreaLoading">
                <h2>分析結果を読み込んでいます...</h2>
            </div>
        );
    }

    return (
        <section className="historyArea">
        <Helmet>
            <title>分析結果詳細 | 面接対策アプリ</title>
            <meta name="description" content="実施した面接練習のスコアと詳細フィードバック．成長の軌跡を振り返り，次の練習に活かしましょう．" />
        </Helmet>
        <HistoryAnalyzeAgain history_ID={historyId || history_ID}></HistoryAnalyzeAgain>
        <ResultVisual score={scoreData} feedback={feedbackData} title={title} chatData={chatData}></ResultVisual>
        </section>
    )
}

export default HistoryArea;