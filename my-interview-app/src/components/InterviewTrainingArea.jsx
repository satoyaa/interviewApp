/**
 * このプログラムは面接対策機能の親玉
 * 面接対策機能はすべてInterviewTrainingAreaとなる．
 * そのため，ここで面接対策機能に関するAPI通信を定義している
 * 
 */

import InterviewTrainingStart from "./InterviewTrainingStart";
import InterviewTraining from "./InterviewTraining";
import InterviewTrainingResult from "./InterviewTrainingResult";
import InterviewTrainingLoading from "./InterviewTriningLoading";
import { useState } from "react";

const InterviewTrainingArea = () => {
    const [interviewTrainingState, setInterviewTrainingState] = useState("start");
    const [currentQuestion, setCurrentQuestion] = useState("");
    const [sessionID, setSessionID] = useState("");
    const [interviewPhase, setInterviewPhase] = useState(0);
    const [maxAnswers, setMaxAnswers] = useState(0);
    const [company, setCompany] = useState("");

    const goToInterviewTraining = (interviewTrainingState) => {
        if(interviewTrainingState === "start"){
        return <InterviewTrainingStart 
        setInterviewTrainingState={setInterviewTrainingState}
        setCurrentQuestion={setCurrentQuestion}
        setSessionID={setSessionID}
        maxAnswers={maxAnswers}
        setMaxAnswers={setMaxAnswers}
        interviewPhase={interviewPhase}
        company={company}
        setCompany={setCompany}
        ></InterviewTrainingStart>;
        }
        if(interviewTrainingState === "training"){
        return <InterviewTraining 
        setInterviewTrainingState={setInterviewTrainingState}
        currentQuestion={currentQuestion}
        setCurrentQuestion={setCurrentQuestion}
        sessionID={sessionID}
        interviewPhase={interviewPhase}
        setInterviewPhase={setInterviewPhase}
        maxAnswers={maxAnswers}
        company={company}
        ></InterviewTraining>;
        }
        if(interviewTrainingState === "result"){
        return <InterviewTrainingResult 
        setInterviewTrainingState={setInterviewTrainingState}
        sessionID={sessionID}
        ></InterviewTrainingResult>;
        }
        if(interviewTrainingState === "loading"){
        return <InterviewTrainingLoading></InterviewTrainingLoading>;
        }
    }
    return (
        <>
        {goToInterviewTraining(interviewTrainingState)}   
        </>
    )
}

export default InterviewTrainingArea;