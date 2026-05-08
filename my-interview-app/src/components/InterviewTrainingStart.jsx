import { useState } from "react";
import "./InterviewTraining.css";

const InterviewTrainingStart = ({setInterviewTrainingState, setCurrentQuestion, setSessionID}) => {
    // フォームの状態を管理するためのstate
    const [company, setCompany] = useState("");
    const [domain, setDomain] = useState("");
    const [scale, setScale] = useState("");

    const handleStart = async () => {
        // 簡単な入力チェック
        if (!company || !domain || !scale) {
            alert("すべての項目を入力・選択してください．");
            return;
        }

        // FastAPIに送るデータをFormDataに詰める
        const formData = new FormData();
        formData.append("company_info", company);
        formData.append("focus_area", domain);
        formData.append("scale", scale); // 規模（質問数）を追加

        try {
            // FastAPIのAPIエンドポイントへPOSTリクエストを送信
            //個人開発なのでローカルホスト，ホスティングするならここを変更
            const response = await fetch("http://127.0.0.1:8000/api/process-prompt", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("ネットワークエラーが発生しました．");
            }

            const data = await response.json();
            console.log("バックエンドからの応答（最初の質問）:", data);
        
            // バックエンドから返ってきた response (質問文) を state に保存
            // session id を保存
            setCurrentQuestion(data.response); 
            setSessionID(data.session_id);
            
                        
            // 通信に成功したら，面接画面を切り替える
            // ※必要に応じて data.response (最初の質問) や data.saved_id を
            // 親コンポーネントや次の画面に渡す処理をここに追加します．
            setInterviewTrainingState("training");
            
            
        } catch (error) {
            console.error("エラー:", error);
            alert("バックエンドとの通信に失敗しました．");
        }
    };
    return(
        <section className="training">
            <form onSubmit={(e) => e.preventDefault()}>
                <input 
                    type="text" 
                    placeholder="ここに会社名やURLを入力してください" 
                    value={company} 
                    onChange={(e) => setCompany(e.target.value)}
                />
                <select value={domain} onChange={(e) => setDomain(e.target.value)} required>
                    <option value="" disabled>対策したい内容を選んでください</option>
                    <option value="全体">全体</option>
                    <option value="自己PR">自己PR</option>
                    <option value="志望動機">志望動機</option>
                </select>
                <select value={scale} onChange={(e) => setScale(e.target.value)} required>
                    <option value="" disabled>規模を選んでください</option>
                    <option value="3">3問</option>
                    <option value="5">5問</option>
                    <option value="10">10問</option>
                </select>
                <input type="button" value="対策を開始する" onClick={handleStart}/>
            </form>
        </section>
    )
}

export default InterviewTrainingStart;