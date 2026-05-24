from fastapi import APIRouter, FastAPI, HTTPException, status
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta, timezone
import jwt

# ※ create_access_token 関数は前回の実装をそのまま使います

router = APIRouter()

load_dotenv()

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")
SECRET_KEY = os.environ.get("SECRET_KEY")
ALGORITHM = os.environ.get("ALGORITHM")

# ReactからJSON形式で受け取るデータの型定義
class GoogleTokenRequest(BaseModel):
    token: str
    
def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    # ペイロード（中身）と秘密鍵を指定してJWTを作成
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/auth/google")
async def verify_google_token(request_body: GoogleTokenRequest):
    try:
        # Googleの公開鍵を自動取得して，IDトークンを暗号学的に検証します
        idinfo = id_token.verify_oauth2_token(
            request_body.token, requests.Request(), GOOGLE_CLIENT_ID
        )

        # 検証に成功すると，idinfo辞書からユーザー情報を安全に取得できます
        user_email = idinfo.get("email")
        
        # --- ユーザー登録のロジック ---
        # 実際のアプリでは，ここでDBを検索し，存在しなければ新規登録する処理を書きます．
        # user = db.query(User).filter(User.email == user_email).first()
        # if not user:
        #     user = create_user(email=user_email)

        # アプリケーション独自のJWT（アクセストークン）を発行
        # （create_access_token関数は前回の回答で実装したものを流用します）
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": user_email}, # ユーザーの識別子としてメールアドレスを使用
            expires_delta=access_token_expires
        )

        return {"access_token": access_token, "token_type": "bearer"}

    except ValueError:
        # トークンの期限切れや，不正なトークンが送られてきた場合
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Googleトークンの検証に失敗しました．",
        )