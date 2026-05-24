import { useState } from "react";
import "./InterviewTraining.css";
import "./InterviewTrainingStart.css"
import InterviewTrainingLoading from "./InterviewTriningLoading";

const InterviewTrainingStart = ({setInterviewTrainingState, setCurrentQuestion, setSessionID, selected, setSelected, company, setCompany}) => {

    const count_max = 5; // 各フェーズの最大練習回数
    const selectOptions = [
        { id: "pr", name: "自己PR" },
        { id: "gakutika", name: "ガクチカ" },
        { id: "tech", name: "技術面接" },
        { id: "ice", name: "アイスブレイク" },
    ];
    const [isLoading, setIsLoading] = useState(false);

    const handleAdd = (item) => {
        setSelected((prev) => {
            if (prev.find((p) => p.id === item.id)) return prev;
            // 変更点: 追加時の初期値を1に変更
            return [...prev, { ...item, count: 1 }]; 
        });
    };

    const handleMoveUp = (id) => {
        setSelected((prev) => {
            const idx = prev.findIndex(p => p.id === id);
            if (idx <= 0) return prev;
            const next = [...prev];
            const tmp = next[idx - 1];
            next[idx - 1] = next[idx];
            next[idx] = tmp;
            return next;
        });
    };

    const handleMoveDown = (id) => {
        setSelected((prev) => {
            const idx = prev.findIndex(p => p.id === id);
            if (idx === -1 || idx >= prev.length - 1) return prev;
            const next = [...prev];
            const tmp = next[idx + 1];
            next[idx + 1] = next[idx];
            next[idx] = tmp;
            return next;
        });
    };

    const handleRemove = (id) => {
        setSelected((prev) => prev.filter(p => p.id !== id));
    };

    const handleIncrement = (id) => {
        setSelected((prev) => prev.map((p) => {
            if (p.id !== id) return p;
            const current = p.count || 1; // ここも念のためデフォルト1に
            if (current >= count_max) return p;
            return { ...p, count: current + 1 };
        }));
    };

    const handleDecrement = (id) => {
        setSelected((prev) => prev.map((p) => {
            if (p.id !== id) return p;
            const current = p.count || 1; // デフォルト1に
            // 変更点: 下限を1に変更
            return { ...p, count: Math.max(1, current - 1) }; 
        }));
    };

    const handleStart = async () => {
        // 簡単な入力チェック
        if (!company || !selected || selected.length === 0) { // 空配列のチェックも追加しておくと安全です
            alert("すべての項目を入力・選択してください．");
            return;
        }

        setIsLoading(true);

        //　保存したトークンを呼び出し
        const token = localStorage.getItem('token');

        // FastAPIに送るデータをFormDataに詰める
        const formData = new FormData();
        formData.append("company_info", company);
        formData.append("phase", selected[0].name);

        try {
            // FastAPIのAPIエンドポイントへPOSTリクエストを送信
            //個人開発なのでローカルホスト，ホスティングするならここを変更
            const response = await fetch("http://127.0.0.1:8000/api/process-prompt", {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}` 
                },
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
            setIsLoading(false);
            setInterviewTrainingState("training");
            
        } catch (error) {
            console.error("エラー:", error);
            setIsLoading(false);
            alert("バックエンドとの通信に失敗しました．");
        }
    };

    if(isLoading){
        return(<InterviewTrainingLoading></InterviewTrainingLoading>)
    }

    return(
        <section className="training">
            <div className="select_area">
                <div className="select_items">
                    <ul>
                        {selectOptions.map((opt) => (
                            <li className="select_item" key={opt.id}>
                                {opt.name} <button type="button" className="add_button" onClick={() => handleAdd(opt)}>追加</button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="select_screen">
                    <ul className="select_list">
                        {selected.map((item, idx) => (
                            <li key={item.id} className="selected_item">
                                {item.name}
                                <div className="count-controls">
                                    {/* 変更点: 無効化の判定を <= 1 に変更 */}
                                    <button type="button" onClick={() => handleDecrement(item.id)} disabled={(item.count ?? 1) <= 1}>-</button>
                                    {/* 変更点: 表示のフォールバックを1に変更 */}
                                    <span className="count-value">{item.count ?? 1}</span>
                                    <button type="button" onClick={() => handleIncrement(item.id)} disabled={(item.count ?? 1) >= count_max}>+</button>
                                </div>
                                <button type="button" className="delete_button" onClick={() => handleRemove(item.id)}>削除</button>
                                <button type="button" className="up_button" onClick={() => handleMoveUp(item.id)} disabled={idx === 0}>^</button>
                                <button type="button" className="down_button" onClick={() => handleMoveDown(item.id)} disabled={idx === selected.length - 1}>v</button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <form onSubmit={(e) => e.preventDefault()}>
                <div className="input-group">
                    <input 
                    type="text" 
                    placeholder="ここに会社名やURLを入力してください" 
                    value={company} 
                    onChange={(e) => setCompany(e.target.value)}
                    />
                </div>
                <input type="button" value="対策を開始する" onClick={handleStart}/>
            </form>
        </section>
    )
}

export default InterviewTrainingStart;