import { useState } from "react";

const HistoryAnalyzeAgain = ({history_ID}) =>{
    console.log(history_ID);
    const [isAvailable, setIsAvailable] = useState(true)
    const handleAnalyzeAgain = async () =>{
        console.log(history_ID);
        setIsAvailable(false);
        if (!history_ID) {
            alert("history_IDが存在しません．");
            return;
        }

        try {
            // バックエンドに分析要求を送信
            const response = await fetch(`http://127.0.0.1:8000/api/process-db-data/${history_ID}`, {
                method: "POST"
            });
            
            if (!response.ok) {
                throw new Error("分析処理に失敗しました．");
            }
            
            // 分析が完了したら結果画面へ状態を遷移させる
            
        } catch (error) {
            console.error("エラー:", error);
            alert("分析処理中にエラーが発生しました．");
        }
        setIsAvailable(true);
    };
    return (
        <>
        {isAvailable ? <button onClick={()=>handleAnalyzeAgain()}>再度分析を行う</button> : <button>再度分析を行う</button>}
        </>
    )
}

export default HistoryAnalyzeAgain;