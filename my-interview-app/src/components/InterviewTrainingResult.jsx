import { useState, useEffect } from "react";
import ResultVisual from "./ResultVisual";

const InterviewTrainingResult = ({ sessionID, setInterviewTrainingState }) => {
    // 取得したデータを管理するためのState
    const [scoreData, setScoreData] = useState([]);
    const [feedbackData, setFeedbackData] = useState([]);
    const [title, setTitle] = useState("無題のタイトル");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log("分析結果を取得します1")
        const fetchResult = async () => {
            console.log("分析結果を取得します2")
            // sessionIDが渡されていない場合は処理を中断
            if (!sessionID) {
                setIsLoading(false);
                return;
            }

            try {
                // バックエンドから分析結果を取得
                console.log("分析結果を取得します3")
                const response = await fetch(`http://127.0.0.1:8000/api/feedback/${sessionID}`);
                if (!response.ok) {
                    throw new Error("結果の取得に失敗しました．");
                }
                const data = await response.json();

                console.log(data.feedback);
                console.log(data.title);

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
    }, [sessionID]); // sessionID が変更された時（初回マウント時含む）に実行

    // データ取得中の表示
    if (isLoading) {
        return (
            <div style={{ textAlign: "center", marginTop: "50px" }}>
                <h2>分析結果を読み込んでいます...</h2>
            </div>
        );
    }

    return(
        <section className="interviewTrainingResult">
        <button onClick={() => {setInterviewTrainingState("start")}} style={{ marginLeft: "20px" }}>
            スタート画面に戻る
        </button>
        {/* Stateに保存されたデータを ResultVisual に渡す */}
        <ResultVisual score={scoreData} feedback={feedbackData} title={title}></ResultVisual> 
        </section>
    )
}

export default InterviewTrainingResult;