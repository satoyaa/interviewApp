import { useState } from 'react'

import InterviewTraining from './InterviewTraining'

import reactLogo from './../assets/react.svg'
import viteLogo from './../assets/vite.svg'
import heroImg from './../assets/hero.png'


const ContentsArea = () =>{

    const [count, setCount] = useState(0)
    return(
        <>
            <main id="contentsArea">
                <InterviewTraining></InterviewTraining>
            </main>
        </>
    )
}

export default ContentsArea;