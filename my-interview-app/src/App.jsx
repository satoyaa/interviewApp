
import { useState } from 'react';
import './App.css'

import ContentsArea from './components/ContentsArea'
import SideBar from './components/SideBar'

import { AppContext } from './components/Context/Context.jsx';

function App() {
  const [page, setPage] = useState("interviewTraining");
  const [history_ID, setHistory_ID] = useState("");
  return (
    <AppContext.Provider value={{history_ID, setHistory_ID}}>
    <div id='center'>
      <SideBar setPage={setPage}></SideBar>
      <ContentsArea page={page}></ContentsArea>
    </div>
    </AppContext.Provider>
  )
}

export default App
