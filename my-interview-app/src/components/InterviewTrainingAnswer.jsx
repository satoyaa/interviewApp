import { useState, useEffect, useRef } from "react";
import { AiFillAudio } from "react-icons/ai";
import { AiOutlineBorder } from "react-icons/ai";
import { AiOutlineSend } from "react-icons/ai";
import InterviewTrainingLoading from "./InterviewTriningLoading";

const InterviewTrainingAnswer = ({setQuestionAnswerState, countAnswer, setCountAnswer, setCurrentQuestion, sessionID, setInterviewTrainingState, interviewPhase, setInterviewPhase, selected, company, setIsLoading, handleFinishTraining}) => {
    // 確定済みの回答テキスト
    const [answer, setAnswer] = useState("");
    // 音声認識の途中経過テキスト
    const [interimAnswer, setInterimAnswer] = useState("");
    // 録音中かどうかの判定用
    const [isRecording, setIsRecording] = useState(false);
    // テキストが入力されているかどうかを判別
    const isInput = answer.trim() !== "";
    
    // 音声認識インスタンスを保持するRef
    const recognitionRef = useRef(null);

    // 音声認識の初期設定
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true; // 途中経過を有効化
            recognitionRef.current.lang = 'ja-JP';

            recognitionRef.current.onresult = (event) => {
                let currentInterim = '';
                let currentFinal = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        currentFinal += event.results[i][0].transcript;
                    } else {
                        currentInterim += event.results[i][0].transcript;
                    }
                }

                if (currentFinal) {
                    setAnswer((prev) => prev + currentFinal);
                }
                setInterimAnswer(currentInterim);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('音声認識エラー:', event.error);
                setIsRecording(false);
                setInterimAnswer('');
            };

            recognitionRef.current.onend = () => {
                setIsRecording(false);
                setInterimAnswer('');
            };
        } else {
            console.warn('このブラウザはWeb Speech APIをサポートしていません．');
        }
    }, []);

    // 録音の開始/停止を切り替える関数
    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
            setIsRecording(true);
        }
    };

    // キーボード入力時の処理
    const handleTextareaChange = (e) => {
        setAnswer(e.target.value);
        setInterimAnswer(''); // キー入力時は途中経過をリセットして競合を防ぐ
    };

    const handleAnswer = async () => {
        // 送信時はマイク入力を強制的に停止する
        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
        }

        // 喋っている最中に送信ボタンを押した場合を考慮し，途中経過も含めて送信テキストにする
        const finalSubmitText = answer + interimAnswer;

        if (!finalSubmitText) {
            alert("回答を入力してください");
            return;
        }

        // 途中経過のステートはクリアしておく
        setInterimAnswer('');

        setIsLoading(true);
        const nextCount = countAnswer + 1;
        
        //　保存したトークンを呼び出し
        const token = localStorage.getItem('token');

        // FastAPIに送るデータをFormDataに詰める
        const formData = new FormData();
        formData.append("text_prompt", finalSubmitText);
        formData.append("session_id", sessionID);
        formData.append("company_info", company)
        setCountAnswer(nextCount)
        
        if(nextCount > selected[interviewPhase].count){
            if(!selected[interviewPhase+1]){
                handleFinishTraining();
            }
            setCountAnswer(1);
            formData.append("phase", selected[interviewPhase+1].name);
            setInterviewPhase(prev => prev+1);
            formData.append("reset", true);
            
        }else{
            formData.append("phase", selected[interviewPhase].name);
            formData.append("reset", false);
        }
        
        try {
            // FastAPIのAPIエンドポイントへPOSTリクエストを送信
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
            setCurrentQuestion(data.response); 
            
            // 次の質問のためにテキストエリアをクリアする
            setAnswer(""); 
                        
            setIsLoading(false);
            setQuestionAnswerState("question");
            setInterviewTrainingState("training");           
        } catch (error) {
            setIsLoading(false);
            console.error("エラー:", error);
            alert("バックエンドとの通信に失敗しました．");
        }
    } 

    return (
        <>
        <form onSubmit={(e) => e.preventDefault()}>
            <textarea 
                name="Answer" 
                value={answer + interimAnswer} 
                onChange={handleTextareaChange} 
                rows={4} 
                maxLength={2000} 
                placeholder="ここに回答を入力してください（Enterで改行）" 
                style={{ width: '100%', boxSizing: 'border-box' }}
            />
            {isInput && !isRecording ? 
            <button
                type="button" 
                onClick={handleAnswer} 
                className="circle_button submit_button"
            ><AiOutlineSend /></button>
            :
            <div style={{ marginBottom: '10px' }}>
                <button 
                    type="button" 
                    onClick={toggleRecording} 
                    className={isRecording ? "circle_button stop_button" : "circle_button"}
                >
                    {isRecording ? <AiOutlineBorder /> : <AiFillAudio />}
                </button>
            </div>
            }
        </form>
        </>
    )
}

export default InterviewTrainingAnswer;