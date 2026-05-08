/*このプログラムは面接対策機能の対策画面の状態を管理します．
面接対策では，質問，回答を繰り返し表示して指定回数回答を終えるまでこれを繰り返します．
*/

import { use, useState } from "react";
import InterviewTrainingQuestion from "./InterviewTrainingQuestion";
import InterviewTrainingAnswer from "./InterviewTrainingAnswer";


const InterviewTraining = ({setInterviewTrainingState, currentQuestion, setCurrentQuestion, sessionID}) => {
    const [questionAnswerState, setQuestionAnswerState] = useState("question");
    const [countAnswer, setCountAnswer] = useState(0);


    const switchQuestionAnswer = (questionAnswerState) => {
        if(questionAnswerState === "question"){
            return(<InterviewTrainingQuestion 
                setQuestionAnswerState={setQuestionAnswerState}
                currentQuestion={currentQuestion}
                ></InterviewTrainingQuestion>)
        }
        if(questionAnswerState === "answer"){
            return(<InterviewTrainingAnswer 
                setQuestionAnswerState={setQuestionAnswerState} 
                setCountAnswer={setCountAnswer} 
                countAnswer={countAnswer}
                setCurrentQuestion={setCurrentQuestion}
                sessionID={sessionID}
                ></InterviewTrainingAnswer>)
        }
    }

    const handleFinishTraining = async () => {
        if (!sessionID) {
            alert("セッションIDが存在しません．");
            return;
        }

        try {
            // バックエンドに分析要求を送信
            console.log("分析を開始します")
            const response = await fetch(`http://127.0.0.1:8000/api/process-db-data/${sessionID}`, {
                method: "POST"
            });
            
            if (!response.ok) {
                throw new Error("分析処理に失敗しました．");
            }
            
            // 分析が完了したら結果画面へ状態を遷移させる
            setInterviewTrainingState("result");
            
        } catch (error) {
            console.error("エラー:", error);
            alert("分析処理中にエラーが発生しました．");
        }
    };

    

    return(
        <section>
        <button onClick={handleFinishTraining}>結果に移る</button>
        {switchQuestionAnswer(questionAnswerState)}
        <h2>{countAnswer}回の回答を終えました．</h2>
        </section>
    )
}

export default InterviewTraining;