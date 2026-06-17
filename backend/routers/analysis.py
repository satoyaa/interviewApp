from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy import desc
from sqlalchemy.orm import Session
import json
from datetime import datetime
from db.database import get_db
from db.models import InterviewEntry, Feedback, User
from services.llm import call_llm_api_for_analyze
from core.auth import get_current_user
from core.limiter import limiter

router = APIRouter()

##分析用の関数
##面接対策終了時と再分析要求があったときに走る
@router.post("/api/process-db-data/{session_id}")
@limiter.limit("5/minute")
async def process_db_data(request: Request, 
                          session_id: str, 
                          current_user: User = Depends(get_current_user), 
                          db: Session = Depends(get_db)):
    request.state.user = current_user.auth_provider_id

    records = db.query(InterviewEntry).filter(
        InterviewEntry.session_id == session_id,
        InterviewEntry.user_id == current_user.id
    ).order_by(InterviewEntry.id).all()
    if not records:
        raise HTTPException(status_code=404, detail="指定されたセッションのデータが見つかりません．")

    history_text = ""
    for i, r in enumerate(records):
        history_text += f"【ターン{i+1}】\n"
        history_text += f"応募者: {r.answer_text}\n"
        history_text += f"面接官: {r.question_text}\n\n"

    # API request count check and increment
    if current_user.api_requests >= 12:
        raise HTTPException(status_code=429, detail="本日のAPI呼び出し上限（12回）に達しました。")
    
    current_user.api_requests += 1
    db.commit()

    analysis_result = await call_llm_api_for_analyze(history_text)

    generated_title = analysis_result.get("title", "無題の面接対策")
    feedback_list = analysis_result.get("feedback", [])

    # store analysis_text as the serialized analysis_result (if any) and scores_data as JSON
    new_record = Feedback(
        session_id=session_id,
        user_id=current_user.id,
        title=generated_title,
        analysis_text=json.dumps(analysis_result, ensure_ascii=False),
        scores_data=feedback_list,
        created_at=datetime.now()
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)

    return {"status": "success", "session_id": session_id, "title": generated_title}


## 再分析（既存のFeedbackを更新する）
@router.put("/api/process-db-data/{session_id}/update")
@limiter.limit("5/minute")
async def update_process_db_data(request: Request,
                                 session_id: str,
                                 current_user: User = Depends(get_current_user),
                                 db: Session = Depends(get_db)):
    request.state.user = current_user.auth_provider_id

    records = db.query(InterviewEntry).filter(
        InterviewEntry.session_id == session_id,
        InterviewEntry.user_id == current_user.id
    ).order_by(InterviewEntry.id).all()
    if not records:
        raise HTTPException(status_code=404, detail="指定されたセッションのデータが見つかりません．")

    history_text = ""
    for i, r in enumerate(records):
        history_text += f"【ターン{i+1}】\n"
        history_text += f"応募者: {r.answer_text}\n"
        history_text += f"面接官: {r.question_text}\n\n"

    # API request count check and increment
    if current_user.api_requests >= 12:
        raise HTTPException(status_code=429, detail="本日のAPI呼び出し上限（12回）に達しました。")
    
    current_user.api_requests += 1
    db.commit()

    analysis_result = await call_llm_api_for_analyze(history_text)

    generated_title = analysis_result.get("title", "無題の面接対策")
    feedback_list = analysis_result.get("feedback", [])

    # 既存のFeedbackがあれば更新、なければ新規作成
    existing = db.query(Feedback).filter(
        Feedback.session_id == session_id,
        Feedback.user_id == current_user.id
    ).first()
    if existing:
        existing.title = generated_title
        existing.created_at = datetime.now()
        existing.analysis_text = json.dumps(analysis_result, ensure_ascii=False)
        existing.scores_data = feedback_list
        db.commit()
        db.refresh(existing)
        return {"status": "updated", "session_id": session_id, "title": generated_title}
    else:
        new_record = Feedback(
            session_id=session_id,
            user_id=current_user.id,
            title=generated_title,
            analysis_text=json.dumps(analysis_result, ensure_ascii=False),
            scores_data=feedback_list,
            created_at=datetime.now()
        )
        db.add(new_record)
        db.commit()
        db.refresh(new_record)
        return {"status": "created", "session_id": session_id, "title": generated_title}


##結果を表示するためにタイトル，分析データ，チャットを返す関数．
@router.get("/api/feedback/{session_id}")
@limiter.limit("10/minute")
def get_feedback(request: Request, session_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # set user on request so limiter key_func can use it
    request.state.user = current_user.auth_provider_id

    rec = db.query(Feedback).filter(
        Feedback.session_id == session_id,
        Feedback.user_id == current_user.id
    ).first()
    if not rec:
        raise HTTPException(status_code=404, detail="指定されたフィードバックが見つかりません．")
    # scores_data is stored as JSON/JSONB; when using SQLite it may be a string
    try:
        if isinstance(rec.scores_data, str):
            parsed = json.loads(rec.scores_data)
        else:
            parsed = rec.scores_data
    except Exception:
        parsed = []

    # collect chat data (content and llm_response) from InterviewEntry for this session
    entries = db.query(InterviewEntry).filter(
        InterviewEntry.session_id == session_id,
        InterviewEntry.user_id == current_user.id
    ).order_by(InterviewEntry.id).all()
    chat_data = [{"content": e.answer_text, "llm_response": e.question_text} for e in entries]
    print(chat_data)

    return {
        "session_id": rec.session_id,
        "title": rec.title,
        "created_at": rec.created_at.isoformat(),
        "analysis_text": rec.analysis_text,
        "feedback": parsed,
        "chat_data": chat_data
    }

##ページ読み込み時に履歴一覧をナビゲーションバーに表示するための関数
@router.get("/api/history")
@limiter.limit("5/minute")
def get_history(request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # ensure request.state.user is set for limiter
    request.state.user = current_user.auth_provider_id

    results = db.query(Feedback.session_id, Feedback.title, Feedback.created_at).filter(
        Feedback.user_id == current_user.id
    ).order_by(desc(Feedback.created_at)).all()
    history_data = [
        {"id": r.session_id, "title": r.title, "date": r.created_at.strftime("%Y/%m/%d %H:%M")} for r in results
    ]
    return {"history_data": history_data}
