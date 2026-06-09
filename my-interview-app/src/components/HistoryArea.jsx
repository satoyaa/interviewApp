import ResultVisual from "./ResultVisual";
import HistoryAnalyzeAgain from "./HistoryAnalyzeAgain.jsx";
import './HistoryArea.css';

import { AppContext} from './Context/Context.jsx';
import { useState, useContext, useEffect } from "react";

const HistoryArea = () => {
    // 取得したデータを管理するためのState
    const [scoreData, setScoreData] = useState([]);
    const [feedbackData, setFeedbackData] = useState([]);
    const [title, setTitle] = useState("無題のタイトル");
    const [isLoading, setIsLoading] = useState(true);
    const {history_ID, setHistory_ID} = useContext(AppContext);
    const [chatData, setChatData] = useState([]);
    

    useEffect(() => {
        console.log("分析結果を取得します1")
        const fetchResult = async () => {
            console.log("分析結果を取得します2")
            // history_IDが渡されていない場合は処理を中断
            if (!history_ID) {
                setIsLoading(false);
                return;
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

                const response = await fetch(`http://127.0.0.1:8000/api/feedback/${history_ID}`, {
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
    }, [history_ID]); // history_ID が変更された時（初回マウント時含む）に実行

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
        <HistoryAnalyzeAgain history_ID={history_ID}></HistoryAnalyzeAgain>
        <ResultVisual score={scoreData} feedback={feedbackData} title={title} chatData={chatData}></ResultVisual>
        </section>
    )
}

export default HistoryArea;