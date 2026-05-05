import { useState } from 'react'

import hamburger from './../assets/hamburger.png'



const SideBar = () => {
    const [isOpen, setIsOpen] = useState(true)

    return(
        <>
        <aside id="sideBar" className={isOpen ? 'isOpen' : ''}>
            <button onClick={()=>{setIsOpen(!isOpen)}} className='hamburgerButton'>
                <img src={hamburger} alt="ハンバーガーメニュー" />
            </button>
            <section className={isOpen ? 'temp isOpen' : 'temp'}>
                <span>面接対策を始める<br /></span>
                <span>自己分析をする<br /></span>
                <span>過去の面接対策の結果<br /></span>

            </section>
        </aside>
        </>
    )
}


export default SideBar;