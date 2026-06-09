import { useState } from "react";

const HistoryAnalyzeAgain = ({history_ID}) =>{
    console.log(history_ID);
    const [isAvailable, setIsAvailable] = useState(true)
    const handleAnalyzeAgain = async () =>{
        setIsAvailable(false);
        if (!history_ID) {
            alert("history_IDが存在しません．");
            setIsAvailable(true);
            return;
        }

        const token = localStorage.getItem('token');

        try {
            // UPDATE（PUT）リクエストを送信（競合するPOSTとは別エンドポイント）
            const response = await fetch(`http://127.0.0.1:8000/api/process-db-data/${history_ID}/update`, {
                method: "PUT",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action: 'reanalyze' })
            });

            if (!response.ok) {
                throw new Error("分析処理に失敗しました．");
            }

            // 必要ならここでレスポンスを処理し、画面遷移や状態更新を行う

        } catch (error) {
            console.error("エラー:", error);
            alert("分析処理中にエラーが発生しました．");
        } finally {
            setIsAvailable(true);
        }
    };
    return (
        <>
        <button onClick={handleAnalyzeAgain} disabled={!isAvailable}>
            {isAvailable ? '再度分析を行う' : '処理中...'}
        </button>
        </>
    )
}

export default HistoryAnalyzeAgain;