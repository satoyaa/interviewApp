import { useState } from 'react';
import { AppContext } from './components/Context/Context.jsx';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Top from './pages/Top';
import InterviewTrainingArea from './components/InterviewTrainingArea';
import SelfAnalysis from './components/SelfAnalysis';
import HistoryArea from './components/HistoryArea';

import './App.css';

// ログイン状態を判定して，未ログインならログイン画面へ弾くコンポーネント
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    // トークンがなければ /login へリダイレクト
    return <Navigate to="/login" replace />;
  }
  // トークンがあれば，そのまま子コンポーネント（Top画面）を表示
  return children;
}

function App() {
  const [history_ID, setHistory_ID] = useState("");
  
  return (
    // Providerで全体を囲むことで，どの画面でもContextが使えるようにする
    <AppContext.Provider value={{ history_ID, setHistory_ID }}>
      <BrowserRouter>
        <Routes>
          {/* ログイン画面は保護せずそのまま表示 */}
          <Route path="/login" element={<Login />} />
          
          {/* Top画面は ProtectedRoute で囲んで未ログインユーザーを弾く */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Top />
              </ProtectedRoute>
            } 
          >
            <Route index element={<Navigate to="interviewTraining" replace />} />
            <Route path="interviewTraining" element={<InterviewTrainingArea />} />
            <Route path="selfAnalysis" element={<SelfAnalysis />} />
            <Route path="historyArea" element={<HistoryArea />} />
            <Route path="historyArea/:historyId" element={<HistoryArea />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  );
}

export default App;