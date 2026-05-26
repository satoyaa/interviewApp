import { useState } from 'react'

import InterviewTrainingArea from './InterviewTrainingArea'
import SelfAnalysis from './SelfAnalysis'
import HistoryArea from './HistoryArea'

import reactLogo from './../assets/react.svg'
import viteLogo from './../assets/vite.svg'
import heroImg from './../assets/hero.png'


const ContentsArea = ({page}) =>{

    const switchContentsArea = (page) => {
        if(page === "interviewTraining"){
            return <InterviewTrainingArea></InterviewTrainingArea>;
        }
        if(page === "selfAnalysis"){
            return <SelfAnalysis></SelfAnalysis>;
        }
        if(page == "history"){
            return <HistoryArea></HistoryArea>;
        }
    }
    return(
        <>
            <main id="contentsArea">
                {switchContentsArea(page)}
            </main>
        </>
    )
}

export default ContentsArea;