from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import jwt
import os
from dotenv import load_dotenv
from db.database import get_db
from db.models import User
from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo

load_dotenv()

SECRET_KEY = os.environ.get("SECRET_KEY")
ALGORITHM = os.environ.get("ALGORITHM")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    try:
        # トークンを解読（検証）する
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # /auth/google で設定した "sub" (メールアドレス) を取り出す
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="無効なトークンです"
            )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="トークンの検証に失敗しました"
        )
    
    # ユーザーをDBから取得
    user = db.query(User).filter(User.auth_provider_id == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ユーザーが見つかりません"
        )

    # --- APIリクエストの一日一回リセットロジック（JST基準） ---
    JST = ZoneInfo("Asia/Tokyo")
    now_jst = datetime.now(JST)

    should_reset = False
    if user.last_api_reset_date is None:
        should_reset = True
    else:
        # DBに保存されている時刻をJSTに変換して比較
        last_reset_jst = user.last_api_reset_date.astimezone(JST)
        if last_reset_jst.date() < now_jst.date():
            should_reset = True

    if should_reset:
        user.api_requests = 0
        user.last_api_reset_date = datetime.now(timezone.utc)
        db.commit()

    # --- 自己分析クールタイムの自動解除ロジック ---
    if user.self_analysis_cooltime == 1 and user.self_analysis_date:
        # 72時間（3日）経過しているかチェック
        diff = datetime.now(timezone.utc) - user.self_analysis_date.astimezone(timezone.utc)
        if diff >= timedelta(days=3):
            user.self_analysis_cooltime = 0
            db.commit()

    return user
