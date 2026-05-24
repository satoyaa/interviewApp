import { useState } from 'react';
import ContentsArea from '../components/ContentsArea'
import SideBar from '../components/SideBar'
import { useNavigate } from 'react-router-dom';

const Top = () => {
    const [page, setPage] = useState("interviewTraining");

    const navigate = useNavigate();

    const handleLogout = () => {
    // ログアウト処理：localStorageからトークンを削除する
    localStorage.removeItem('token');
    // ログイン画面へ強制遷移
    navigate('/login');
    };
    return(
        <div id='center'>
              <SideBar setPage={setPage}></SideBar>
              <ContentsArea page={page}></ContentsArea>
              <button 
              onClick={handleLogout}
              className='logout'>
                ログアウト
              </button>
        </div>
    )
}

export default Top;