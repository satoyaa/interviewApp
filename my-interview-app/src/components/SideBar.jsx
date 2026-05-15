import { useState } from 'react'

import hamburger from './../assets/hamburger.png'
import './SideBar.css'

import HistoryNavigation from './HistoryNavigation'



const SideBar = ({setPage}) => {
    const [isOpen, setIsOpen] = useState(true)
    return(
        <>
        <aside id="sideBar" className={isOpen ? 'isOpen' : ''}>
            <button onClick={()=>{setIsOpen(!isOpen)}} className='hamburgerButton'>
                <img src={hamburger} alt="ハンバーガーメニュー" />
            </button>
            <ul className={isOpen ? 'sidebar isOpen' : 'sidebar'}>
                <li role="button" style={{ cursor: 'pointer' }} onClick={() => setPage("interviewTraining")}>面接対策を始める</li>
                <li role="button" style={{ cursor: 'pointer' }} onClick={() => setPage("selfAnalysis")}>自己分析をする</li>
                <li role="button" className="noHover" onClick={() => {setPage("history")}}>
                    <HistoryNavigation></HistoryNavigation>
                </li>
            </ul>
        </aside>
        </>
    )
}


export default SideBar;