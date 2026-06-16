/**
 * このプログラムは面接対策機能の親玉
 * 面接対策機能はすべてInterviewTrainingAreaとなる．
 * そのため，ここで面接対策機能に関するAPI通信を定義している
 * 
 */

import InterviewTrainingStart from "./InterviewTrainingStart";
import InterviewTraining from "./InterviewTraining";
import InterviewTrainingResult from "./InterviewTrainingResult";
import { Helmet } from "react-helmet-async";

import { useState } from "react";

const InterviewTrainingArea = () => {
    const [interviewTrainingState, setInterviewTrainingState] = useState("start");
    const [currentQuestion, setCurrentQuestion] = useState("");
    const [sessionID, setSessionID] = useState("");
    const [interviewPhase, setInterviewPhase] = useState(0);
    const [company, setCompany] = useState("");
    const [selected, setSelected] = useState([]);

    const goToInterviewTraining = (interviewTrainingState) => {
        if(interviewTrainingState === "start"){
        return <InterviewTrainingStart 
        setInterviewTrainingState={setInterviewTrainingState}
        setCurrentQuestion={setCurrentQuestion}
        setSessionID={setSessionID}
        interviewPhase={interviewPhase}
        selected={selected}
        setSelected={setSelected}
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
        selected={selected}
        setSelected={setSelected}
        company={company}
        setCompany={setCompany}
        ></InterviewTraining>;
        }
        if(interviewTrainingState === "result"){
        return <InterviewTrainingResult 
        setInterviewTrainingState={setInterviewTrainingState}
        sessionID={sessionID}
        ></InterviewTrainingResult>;
        }
    }
    return (
        <>
        <Helmet>
            <title>AI面接練習 | 面接対策アプリ</title>
            <meta name="description" content="志望企業に合わせたAI面接官との実戦練習。リアルタイムな質問とフィードバックで合格力を高めます。" />
        </Helmet>
        {goToInterviewTraining(interviewTrainingState)}   
        </>
    )
}

export default InterviewTrainingArea;