from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy import desc
from sqlalchemy.orm import Session
import json
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime
from database import get_db
from models import InterviewEntry, Feedback
from services.llm import call_llm_api_for_analyze
from dotenv import load_dotenv
import os
import jwt
from core.limiter import limiter

router = APIRouter()

load_dotenv()

SECRET_KEY = os.environ.get("SECRET_KEY")
ALGORITHM = os.environ.get("ALGORITHM")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    try:
        # トークンを解読（検証）する
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # /auth/google で設定した "sub" (メールアドレス) を取り出す
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="無効なトークンです")
        return email
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="トークンの検証に失敗しました")
    
##分析用の関数
##面接対策終了時と再分析要求があったときに走る
@router.post("/api/process-db-data/{session_id}")
@limiter.limit("5/minute")
async def process_db_data(request: Request, 
                          session_id: str, 
                          current_user: str = Depends(get_current_user), 
                          db: Session = Depends(get_db)):
    request.state.user = current_user
    records = db.query(InterviewEntry).filter(InterviewEntry.session_id == session_id).order_by(InterviewEntry.id).all()
    if not records:
        raise HTTPException(status_code=404, detail="指定されたセッションのデータが見つかりません．")

    history_text = ""
    for i, r in enumerate(records):
        history_text += f"【ターン{i+1}】\n"
        history_text += f"応募者: {r.content}\n"
        history_text += f"面接官: {r.llm_response}\n\n"

    analysis_result = await call_llm_api_for_analyze(history_text)

    generated_title = analysis_result.get("title", "無題の面接対策")
    feedback_list = analysis_result.get("feedback", [])

    new_record = Feedback(
        session_id=session_id,
        title=generated_title,
        created_at=datetime.now(),
        source_data=history_text,
        llm_response="",
        feedback=json.dumps(feedback_list, ensure_ascii=False)
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)

    return {"status": "success", "session_id": session_id, "title": generated_title}


##結果を表示するためにタイトル，分析データ，チャットを返す関数．
@router.get("/api/feedback/{session_id}")
def get_feedback(session_id: str, db: Session = Depends(get_db)):
    rec = db.query(Feedback).filter(Feedback.session_id == session_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="指定されたフィードバックが見つかりません．")
    try:
        parsed = json.loads(rec.feedback)
    except Exception:
        parsed = []

    # collect chat data (content and llm_response) from InterviewEntry for this session
    entries = db.query(InterviewEntry).filter(InterviewEntry.session_id == session_id).order_by(InterviewEntry.id).all()
    chat_data = [{"content": e.content, "llm_response": e.llm_response} for e in entries]
    print(chat_data)

    return {
        "session_id": rec.session_id,
        "title": rec.title,
        "created_at": rec.created_at.isoformat(),
        "source_data": rec.source_data,
        "llm_response": rec.llm_response,
        "feedback": parsed,
        "chat_data": chat_data
    }

##ページ読み込み時に履歴一覧をナビゲーションバーに表示するための関数
@router.get("/api/history")
def get_history(db: Session = Depends(get_db)):
    results = db.query(Feedback.session_id, Feedback.title, Feedback.created_at).order_by(desc(Feedback.created_at)).all()
    history_data = [
        {"id": r.session_id, "title": r.title, "date": r.created_at.strftime("%Y/%m/%d %H:%M")} for r in results
    ]
    return {"history_data": history_data}
