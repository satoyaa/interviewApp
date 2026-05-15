import { useState } from "react";
import "./InterviewTraining.css";
import { phases } from "./Phase/Phases";

const InterviewTrainingStart = ({setInterviewTrainingState, setCurrentQuestion, setSessionID,maxAnswers, setMaxAnswers, interviewPhase, company, setCompany}) => {

    const handleStart = async () => {
        // 簡単な入力チェック
        if (!company || maxAnswers <= 0) {
            alert("すべての項目を入力・選択してください．");
            return;
        }
        console.log(maxAnswers);

        // FastAPIに送るデータをFormDataに詰める
        const formData = new FormData();
        formData.append("company_info", company);
        formData.append("phase", phases[0][interviewPhase]);

        try {
            // FastAPIのAPIエンドポイントへPOSTリクエストを送信
            //個人開発なのでローカルホスト，ホスティングするならここを変更
            setInterviewTrainingState("loading");
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
                <div className="input-group">
                    <input 
                    type="text" 
                    placeholder="ここに会社名やURLを入力してください" 
                    value={company} 
                    onChange={(e) => setCompany(e.target.value)}
                    />
                    {/*対策項目の調整，後ほど流れで対策したい*/}
                    <select required>
                        <option value="" disabled>対策したい内容を選んでください</option>
                        <option value="normal">ノーマル</option>
                    </select>
                    <select value={maxAnswers} onChange={(e) => setMaxAnswers(Number(e.target.value))} required>
                        <option value={0} disabled>深堀回数を選んでください</option>
                        <option value={3}>3問</option>
                        <option value={5}>5問</option>
                        <option value={10}>10問</option>
                    </select>
                </div>
                <input type="button" value="対策を開始する" onClick={handleStart}/>
            </form>
        </section>
    )
}

export default InterviewTrainingStart;