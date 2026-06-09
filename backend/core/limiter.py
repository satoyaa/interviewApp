from slowapi import Limiter
from fastapi import Request
from dotenv import load_dotenv
import os
import jwt

load_dotenv()
SECRET_KEY = os.environ.get("SECRET_KEY")
ALGORITHM = os.environ.get("ALGORITHM")

def get_user_identifier(request: Request) -> str:
    # まず Authorization ヘッダの Bearer トークンからユーザー識別子を取り出す
    auth = request.headers.get("authorization") or request.headers.get("Authorization")
    if auth and auth.startswith("Bearer "):
        token = auth.split(" ", 1)[1]
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            email = payload.get("sub")
            if email:
                return email
        except Exception:
            # トークンが不正な場合はフォールバックする
            pass

    # request.state.user が事前にセットされていればそれを使う
    if hasattr(request.state, "user") and request.state.user:
        return request.state.user

    # X-Forwarded-For ヘッダを試す
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0]

    # 最終フォールバックはクライアントIP
    return request.client.host

# アプリ全体で使い回す Limiter インスタンス
limiter = Limiter(key_func=get_user_identifier)