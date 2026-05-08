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
    focus_area: str = Form(None),
    scale: str = Form(None),
    text_prompt: str = Form(None),
    audio_file: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    user_input = ""
    if text_prompt:
        user_input = text_prompt
    elif audio_file:
        user_input = f"音声ファイル({audio_file.filename})から抽出したテキスト"

    if not user_input and not company_info and not focus_area:
        raise HTTPException(status_code=400, detail="面接設定，または回答データを送信してください．")
    if not session_id:
        session_id = str(uuid.uuid4())

    prompt_content = "あなたはプロの面接官です．以下の条件を踏まえて，応募者に面接の質問を行ってください．\n"
    if company_info:
        prompt_content += f"【志望企業/URL】: {company_info}\n"
    if focus_area:
        prompt_content += f"【重点対策項目】: {focus_area}\n"

    if user_input:
        prompt_content += f"\n【応募者の回答】: {user_input}\n"
        prompt_content += "上記の回答を踏まえ，内容を深掘りする鋭い質問や，次の観点に移る質問を1つだけ提示してください．"
        save_content = user_input
    else:
        prompt_content += "\n上記の条件に基づいて，最初の面接の質問を1つだけ提示してください．"
        save_content = f"【面接開始】企業:{company_info}, 項目:{focus_area}"

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
