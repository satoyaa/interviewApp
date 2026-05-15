from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
import uuid
from database import get_db
from models import InterviewEntry
from services.llm import call_llm_api

router = APIRouter()


@router.post("/init-db")
def init_db(db: Session = Depends(get_db)):
    if not db.query(InterviewEntry).first():
        sample_data = InterviewEntry(content="これはデータベース1に保存されている初期データです．", enterprise="未指定", session_id=str(uuid.uuid4()), llm_response="")
        db.add(sample_data)
        db.commit()
    return {"message": "interview_entries に初期データを追加しました．"}


@router.get("/api/data1")
def get_data_from_db1(db: Session = Depends(get_db)):
    data = db.query(InterviewEntry).all()
    return {"data": [{"id": d.id, "content": d.content} for d in data]}


@router.post("/api/process-prompt")
async def process_prompt(
    session_id: str = Form(None),
    company_info: str = Form(None),
    text_prompt: str = Form(None),
    audio_file: UploadFile = File(None),
    db: Session = Depends(get_db),
    phase: str = Form(None),
    reset: bool = Form(None),
):
    user_input = ""
    if text_prompt:
        user_input = text_prompt
    elif audio_file:
        user_input = f"音声ファイル({audio_file.filename})から抽出したテキスト"

    if not user_input and not company_info and not phase:
        raise HTTPException(status_code=400, detail="面接設定，または回答データを送信してください．")
    if not session_id:
        session_id = str(uuid.uuid4())

    prompt_content = "あなたはプロの面接官です．以下の条件を踏まえて，応募者に面接の質問を行ってください．\n"
    if company_info:
        prompt_content += f"【志望企業/URL】: {company_info}\n"
        
    if phase:
        prompt_content += f"【面接フェーズ】: {phase}\n"

    if user_input:
        if(not reset):
            prompt_content += f"\n【応募者の回答】: {user_input}\n"  
        if(not reset):
            prompt_content += f"\nここからは {phase}フェーズです．\n"  
        
        prompt_content += '''
        Prompt for 面接官ロールによる追加質問生成

        Goal:
        応募者の回答内容を分析し、実際の採用面接の流れとして自然な追加質問を1つ生成する。
        Return Format:
        * 面接官としての質問文のみを出力
        * 日本語で簡潔かつ自然に記述
        * 出力は1問のみ
        * 箇条書き・見出し・補足説明は禁止
        
        Warnings:

        * 面接評価、フィードバック、要約、相槌は禁止
        * 「なるほど」「ありがとうございます」などの前置きは禁止
        * 同じ内容を言い換えただけの質問は禁止
        * 抽象的すぎる質問を避け、必要に応じて具体性を求める
        * 不自然な深掘りや唐突な話題転換を避ける
        
        * 質問の目的（いずれかを満たすこと）:
            * 回答内容の深掘り
            * 根拠・具体例・行動内容の確認
            * 思考過程や価値観の確認
            * 次の話題への自然な遷移
            
        Additional Notes:
        * 志望企業や重点対策項目に関連する観点を優先する
        * 実際の面接官が使う自然な会話トーンにする
        * 応募者の直前の発言との連続性を重視する
        '''
        save_content = user_input
    else:
        prompt_content += "\n上記の条件に基づいて，最初の面接の質問を1つだけ提示してください．"
        save_content = f"【面接開始】企業:{company_info}, 面接フェーズ:{phase}"

    llm_result = await call_llm_api(prompt_content)

    new_record = InterviewEntry(
        session_id=session_id,
        enterprise=company_info or "未指定",
        content=save_content,
        llm_response=llm_result
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)

    return {
        "status": "success",
        "saved_id": new_record.id,
        "session_id": session_id,
        "user_input": save_content,
        "response": llm_result
    }
