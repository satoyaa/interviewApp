import { useState } from 'react'
import { NavLink } from 'react-router-dom'

import hamburger from './../assets/hamburger.png'
import './SideBar.css'

import HistoryNavigation from './HistoryNavigation'


const SideBar = () => {
    const [isOpen, setIsOpen] = useState(true)
    return(
        <aside >
            <button onClick={()=>{setIsOpen(!isOpen)}} className='hamburgerButton'>
                <img src={hamburger} alt="ハンバーガーメニュー" />
            </button>
            <div id="sideBar" className={isOpen ? 'isOpen' : ''}>
                <ul className={isOpen ? 'sidebar isOpen' : 'sidebar'}>
                <li role="button"><NavLink to="/interviewTraining">面接対策を始める</NavLink></li>
                <li role="button"><NavLink to="/selfAnalysis">自己分析をする</NavLink></li>
                <li role="button" className="noHover">
                    <HistoryNavigation />
                </li>
            </ul>
            </div>
        </aside>
    )
}


export default SideBar;