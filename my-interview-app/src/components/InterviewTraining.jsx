/*このプログラムは面接対策機能の対策画面の状態を管理します．
面接対策では，質問，回答を繰り返し表示して指定回数回答を終えるまでこれを繰り返します．
*/

import { use, useState } from "react";
import InterviewTrainingQuestion from "./InterviewTrainingQuestion";
import InterviewTrainingAnswer from "./InterviewTrainingAnswer";
import reactIcon from "../assets/react.svg";
import InterviewTrainingLoading from "./InterviewTriningLoading";



const InterviewTraining = ({setInterviewTrainingState, currentQuestion, setCurrentQuestion, sessionID, interviewPhase, setInterviewPhase, selected, setSelected, company, setCompany}) => {
    const [questionAnswerState, setQuestionAnswerState] = useState("question");
    const [countAnswer, setCountAnswer] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const resetToStart = () => {
        // reset local and parent states to initial values
        setIsLoading(false);
        setCompany("");
        setInterviewPhase(0);
        setSelected([]);
        setCurrentQuestion("");
        setCountAnswer(1);
        setQuestionAnswerState("question");
        setInterviewTrainingState("start");
    };

    const handleFinishTraining = async () => {
        if (!sessionID) {
            alert("セッションIDが存在しません．");
            return;
        }

        setIsLoading(true);
        try {
            // バックエンドに分析要求を送信
            const token = localStorage.getItem('token');
            if (!token) {
                alert('ログインが必要です．');
                setIsLoading(false);
                return;
            }

            const response = await fetch(`http://127.0.0.1:8000/api/process-db-data/${sessionID}`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error("分析処理に失敗しました．");
            }
            
            // 分析が完了したら各stateを初期値に戻し結果画面へ状態を遷移させる
            setIsLoading(false);
            setCompany("");
            setInterviewPhase(0);
            setSelected([]);
            setCurrentQuestion("");
            setInterviewTrainingState("result");
            
        } catch (error) {
            console.error("エラー:", error);
            alert("分析処理中にエラーが発生しました．");
            // 通信エラーが発生した場合は開始画面に戻して状態を初期化
            resetToStart();
        }
    };

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
                interviewPhase={interviewPhase}
                setInterviewPhase={setInterviewPhase}
                company={company}
                selected={selected}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                handleFinishTraining={handleFinishTraining}
                onCommunicationError={resetToStart}
                ></InterviewTrainingAnswer>)
        }
    }

    

    if(isLoading){
        return(<InterviewTrainingLoading></InterviewTrainingLoading>)
    }

    

    return(
        <section className="interviewTraining">
            <header className="interviewHeader">
                <div className="headerLeft">
                    <div className="qLabel">質問</div>
                    <div className="qCounter">{countAnswer}/{selected[interviewPhase].count}</div>
                    <div>{selected[interviewPhase].name}</div>
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