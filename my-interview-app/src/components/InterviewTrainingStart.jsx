import { useState } from "react";
import "./InterviewTraining.css";
import "./InterviewTrainingStart.css"
import InterviewTrainingLoading from "./InterviewTriningLoading";

// 1. dnd-kitの必要なモジュールをインポート
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// 2. ドラッグ可能なリストアイテム用のラッパーコンポーネントを作成
function SortableItem(props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor:'grab',
    userSelect: 'none'
  };

  return (
    <li ref={setNodeRef} style={style} className={props.className}
        {...attributes} 
        {...listeners} 
        >
      {/* ドラッグ操作用のハンドル */}
      {props.children}
    </li>
  );
}

const InterviewTrainingStart = ({setInterviewTrainingState, setCurrentQuestion, setSessionID, selected, setSelected, company, setCompany}) => {

    const count_max = 5; // 各フェーズの最大練習回数
    const selectOptions = [
        { id: "pr", name: "自己PR" },
        { id: "gakutika", name: "ガクチカ" },
        { id: "tech", name: "技術面接" },
        { id: "motivation", name: "志望動機" },
        { id: "ice", name: "アイスブレイク" },
        { id: "research", name: "研究内容" },
        { id: "portfolio", name: "制作物" },
        { id: "intern", name: "インターン・アルバイト" },
        { id: "teamwork", name: "チームワーク" },
        { id: "solution", name: "問題解決経験" },
        { id: "character", name: "性格・価値観調査" },
        { id: "career", name: "キャリアビジョン" },
        { id: "understanding", name: "企業理解確認" },
        { id: "case", name: "ケース面接" },
        { id: "english", name: "英語面接" },
    ];
    const [isLoading, setIsLoading] = useState(false);

    // --- dnd-kit用の設定 ---
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;

        // ドロップ先が存在し，かつ元の場所と異なる場合のみ並び替えを実行
        if (over && active.id !== over.id) {
            setSelected((prev) => {
                const oldIndex = prev.findIndex((item) => item.id === active.id);
                const newIndex = prev.findIndex((item) => item.id === over.id);
                return arrayMove(prev, oldIndex, newIndex);
            });
        }
    };
    // ----------------------

    const handleAdd = (item) => {
        setSelected((prev) => {
            if (prev.find((p) => p.id === item.id)) return prev;
            return [...prev, { ...item, count: 1 }]; 
        });
    };

    const handleRemove = (id) => {
        setSelected((prev) => prev.filter(p => p.id !== id));
    };

    const handleIncrement = (id) => {
        setSelected((prev) => prev.map((p) => {
            if (p.id !== id) return p;
            const current = p.count || 1; 
            if (current >= count_max) return p;
            return { ...p, count: current + 1 };
        }));
    };

    const handleDecrement = (id) => {
        setSelected((prev) => prev.map((p) => {
            if (p.id !== id) return p;
            const current = p.count || 1; 
            return { ...p, count: Math.max(1, current - 1) }; 
        }));
    };

    const handleStart = async () => {
        if (!company || !selected || selected.length === 0) { 
            alert("すべての項目を入力・選択してください．");
            return;
        }

        setIsLoading(true);

        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append("company_info", company);
        formData.append("phase", selected[0].name);

        try {
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
        
            setCurrentQuestion(data.response); 
            setSessionID(data.session_id);
            
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
                    {/* DndContextとSortableContextでリスト全体を囲む */}
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={selected}
                            strategy={verticalListSortingStrategy}
                        >
                            <ul className="select_list">
                                {selected.map((item, idx) => (
                                    <SortableItem key={item.id} id={item.id} className="selected_item">
                                        <span style={{ flexGrow: 1 }}>{item.name}</span>
                                        <div className="count-controls">
                                            <button 
                                                type="button" 
                                                onClick={() => handleDecrement(item.id)} 
                                                onPointerDown={(e) => e.stopPropagation()} // ドラッグ処理の伝播を止める
                                                disabled={(item.count ?? 1) <= 1}
                                            >
                                                -
                                            </button>
                                            <span className="count-value">{item.count ?? 1}</span>
                                            <button 
                                                type="button" 
                                                onClick={() => handleIncrement(item.id)} 
                                                onPointerDown={(e) => e.stopPropagation()} // 追加
                                                disabled={(item.count ?? 1) >= count_max}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button 
                                            type="button" 
                                            className="delete_button" 
                                            onClick={() => handleRemove(item.id)}
                                            onPointerDown={(e) => e.stopPropagation()} // 追加
                                        >
                                            削除
                                        </button>
                                        </SortableItem>
                                ))}
                            </ul>
                        </SortableContext>
                    </DndContext>
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