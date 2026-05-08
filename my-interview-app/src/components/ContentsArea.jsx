import { useState } from 'react'

import InterviewTrainingArea from './InterviewTrainingArea'
import Self_Analysis from './Self_Analysis'
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
            return <Self_Analysis></Self_Analysis>;
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