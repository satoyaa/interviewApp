import { use, useContext, useEffect, useState } from "react";

import {AppContext} from './Context/Context.jsx'

const HistoryNavigation = () => {
    const [histories, setHistories] = useState([]);

    const {history_ID, setHistory_ID} = useContext(AppContext);

    useEffect(() => {
        console.log("実行されました１");
        const fetchHistory = async () => {
            console.log("実行されました２");
            try {
                console.log("実行されました３");
                const response = await fetch(`http://127.0.0.1:8000/api/history`);
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

    return (
        <>
        <h3>過去の面接対策の結果</h3>
        <ul>
            {histories.map((history) => (
                <li key={history.id} onClick={() => setHistory_ID(history.id)}> {/* keyにはidを使用します． */}
                    {history.title}
                </li>
            ))}
        </ul>
        </>
    );
};

export default HistoryNavigation;