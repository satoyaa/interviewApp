import { useContext, useEffect, useState } from "react";
import { NavLink, useNavigate } from 'react-router-dom'

import {AppContext} from './Context/Context.jsx'

const HistoryNavigation = () => {
    const {history_ID, setHistory_ID, histories, setHistories} = useContext(AppContext);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    alert('ログインが必要です．');
                    return;
                }

                const response = await fetch(`http://127.0.0.1:8000/api/history`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) {
                    throw new Error("結果の取得に失敗しました．");
                }

                const data = await response.json();

                // バックエンドの返り値 { history_data: [...] } をチェックします．
                if (data.history_data && data.history_data.length > 0) {
                    const formattedHistory = data.history_data.map(item => ({
                        title: item.title,
                        id: item.id,
                        date: item.date // item.date を参照します．
                    }));

                    setHistories(formattedHistory);
                }
            } catch (error) {
                console.error("エラー:", error);
                alert("履歴の取得中にエラーが発生しました．");
            }
        };

        fetchHistory();
    }, []); // 依存配列を空にして，初回のみ実行されるようにします．

    const navigate = useNavigate();

    const handleClick = (id) => {
        setHistory_ID(id);
        navigate(`/historyArea/${id}`);
    }

    return (
        <>
        <h3><NavLink to="/historyArea">過去の面接対策の結果</NavLink></h3>
        <ul>
            {histories.map((history) => (
                <li className="historyNavigation" key={history.id} onClick={() => handleClick(history.id)}> {/* keyにはidを使用します． */}
                    {history.title}
                </li>
            ))}
        </ul>
        </>
    );
};

export default HistoryNavigation;