import { useState } from "react";
import { phases } from "./Phase/Phases";

const InterviewTrainingAnswer = ({setQuestionAnswerState, countAnswer, setCountAnswer, setCurrentQuestion, sessionID, setInterviewTrainingState, interviewPhase, setInterviewPhase, maxAnswers, company}) => {
    const [answer, setAnswer] = useState("");

    const handleAnswer = async () => {
        if (!answer) {
            alert("回答を入力してください");
            return;
        }

        console.log(sessionID);
        const nextCount = countAnswer + 1;
        

        // FastAPIに送るデータをFormDataに詰める
        const formData = new FormData();
        formData.append("text_prompt", answer);
        formData.append("session_id", sessionID);
        formData.append("company_info", company)
        setCountAnswer(nextCount)
        if(nextCount > maxAnswers){
            setCountAnswer(1);
            formData.append("phase", phases[0][interviewPhase+1]);
            setInterviewPhase(prev => prev+1);
            formData.append("reset", true);
            
        }else{
            formData.append("phase", phases[0][interviewPhase]);
            formData.append("reset", false);
        }
        
        
        try {
            // FastAPIのAPIエンドポイントへPOSTリクエストを送信
            //個人開発なのでローカルホスト，ホスティングするならここを変更
            //setInterviewTrainingState("loading");
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
            setInterviewTrainingState("training");           
        } catch (error) {
            console.error("エラー:", error);
            alert("バックエンドとの通信に失敗しました．");
        }

    } 

    return (
        <>
        <form onSubmit={(e) => e.preventDefault()}>
            <textarea name="Answer" value={answer} onChange={(e) => {setAnswer(e.target.value)}} rows={4} maxLength={2000} placeholder="ここに回答を入力してください（Enterで改行）" />
            <input type="button" name="submit" value="回答を送信" onClick={handleAnswer}/>
        </form>
        </>
    )
}

export default InterviewTrainingAnswer;