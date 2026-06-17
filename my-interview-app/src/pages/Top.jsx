import ContentsArea from '../components/ContentsArea'
import SideBar from '../components/SideBar'
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Top = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [userData, setUserData] = useState({
        apiRequests: null,
        cooltime: 0,
        nextAnalysis: null
    });

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const fetchApiUsage = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch('http://localhost:8000/api/user/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setUserData({
                    apiRequests: data.api_requests,
                    cooltime: data.self_analysis_cooltime,
                    nextAnalysis: data.next_self_analysis_at
                });
            }
        } catch (error) {
            console.error("Failed to fetch user data:", error);
        }
    };

    useEffect(() => {
        fetchApiUsage();
    }, [location]);

    const formatNextDate = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    return (
        <div id='center'>
            <h1 className="sr-only">面接対策アプリ ダッシュボード</h1>
            <SideBar />
            <ContentsArea />
            <div style={{
                position: 'fixed',
                right: '5px',
                top: '5px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                zIndex: 1000
            }}>
                {userData.apiRequests !== null && (
                    <>
                        <span style={{
                            fontSize: '0.75rem',
                            color: userData.cooltime === 1 ? '#e67e22' : '#27ae60',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            border: `1px solid ${userData.cooltime === 1 ? '#f39c12' : '#2ecc71'}`,
                            whiteSpace: 'nowrap'
                        }}>
                            自己分析: {userData.cooltime === 1 ? `待機中 (${formatNextDate(userData.nextAnalysis)}〜)` : '実行可能'}
                        </span>
                        <span style={{
                            fontSize: '0.75rem',
                            color: '#666',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            whiteSpace: 'nowrap'
                        }}>
                            API回数: {userData.apiRequests} / 12
                        </span>
                    </>
                )}
                <button
                    onClick={handleLogout}
                    className='logout'
                    style={{ position: 'static' }}
                >
                    ログアウト
                </button>
            </div>
        </div>
    )
}

export default Top;