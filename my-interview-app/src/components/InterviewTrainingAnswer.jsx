import { useState } from "react";

const InterviewTrainingAnswer = ({setQuestionAnswerState, countAnswer, setCountAnswer, setCurrentQuestion, sessionID}) => {
    const [answer, setAnswer] = useState("");

    const handleAnswer = async () => {
        if (!answer) {
            alert("回答を入力してください");
            return;
        }

        console.log(sessionID);

        // FastAPIに送るデータをFormDataに詰める
        const formData = new FormData();
        formData.append("text_prompt", answer);
        formData.append("session_id:", sessionID);

        try {
            // FastAPIのAPIエンドポイントへPOSTリクエストを送信
            //個人開発なのでローカルホスト，ホスティングするならここを変更
            const response = await fetch("http://127.0.0.1:8000/api/process-prompt", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("ネットワークエラーが発生しました．");
            }

            const data = await response.json();
            console.log("バックエンドからの応答（最初の質問）:", data);
        
            // バックエンドから返ってきた response (質問文) を state に保存
            setCurrentQuestion(data.response); 
                        
            // 通信に成功したら，面接画面を切り替える
            // ※必要に応じて data.response (最初の質問) や data.saved_id を
            // 質問数に達したなら終了，達していないなら質問画面へ移る．
            setQuestionAnswerState("question");
            
        } catch (error) {
            console.error("エラー:", error);
            alert("バックエンドとの通信に失敗しました．");
        }

    } 

    return (
        <>
        <h1>これは回答画面です．</h1>
        <form onSubmit={(e) => e.preventDefault()}>
            <input type="text" name="Answer" value={answer} onChange={(e) => {setAnswer(e.target.value)}}/>
            <input type="button" name="submit" value="回答を送信" onClick={handleAnswer}/>
        </form>
        </>
    )
}

export default InterviewTrainingAnswer;