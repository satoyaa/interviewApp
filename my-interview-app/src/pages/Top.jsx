import ContentsArea from '../components/ContentsArea'
import SideBar from '../components/SideBar'
import { useNavigate } from 'react-router-dom';

const Top = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    };
    return(
        <div id='center'>
              <SideBar />
              <ContentsArea />
              <button 
              onClick={handleLogout}
              className='logout'>
                ログアウト
              </button>
        </div>
    )
}

export default Top;