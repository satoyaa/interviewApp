/*このプログラムは面接対策機能の対策画面の状態を管理します．
面接対策では，質問，回答を繰り返し表示して指定回数回答を終えるまでこれを繰り返します．
*/

import { use, useState } from "react";
import InterviewTrainingQuestion from "./InterviewTrainingQuestion";
import InterviewTrainingAnswer from "./InterviewTrainingAnswer";
import reactIcon from "../assets/react.svg";
import {phases} from "./Phase/Phases";



const InterviewTraining = ({setInterviewTrainingState, currentQuestion, setCurrentQuestion, sessionID, interviewPhase, setInterviewPhase, maxAnswers, company}) => {
    const [questionAnswerState, setQuestionAnswerState] = useState("question");
    const [countAnswer, setCountAnswer] = useState(1);


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
                countAnswer={countAnswer} 
                setCountAnswer={setCountAnswer} 
                setCurrentQuestion={setCurrentQuestion}
                sessionID={sessionID}
                setInterviewTrainingState={setInterviewTrainingState}
                setInterviewPhase={setInterviewPhase}
                maxAnswers={maxAnswers}
                company={company}
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
            setInterviewTrainingState("loading");
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
        <section className="interviewTraining">
            <header className="interviewHeader">
                <div className="headerLeft">
                    <div className="qLabel">質問</div>
                    <div className="qCounter">{countAnswer}/{maxAnswers}</div>
                    <div>{phases[0][interviewPhase]}</div>
                </div>
                <div className="headerRight">
                    <button className="finishButton" onClick={handleFinishTraining}>終了する</button>
                </div>
            </header>

            <div className="interviewBody">
                {questionAnswerState === "question" ? <div className="robotCol">
                    <img src={reactIcon} alt="robot" className="robotIcon" />
                </div> : <div></div>}
                
                <div className="bubbleCol">
                    <div className="speechBubble">
                        {switchQuestionAnswer(questionAnswerState)}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default InterviewTraining;