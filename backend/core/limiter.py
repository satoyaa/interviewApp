from slowapi import Limiter
from fastapi import Request

def get_user_identifier(request: Request) -> str:
    if hasattr(request.state, "user"):
        return request.state.user
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0]
    return request.client.host

# アプリ全体で使い回すLimiterインスタンス
limiter = Limiter(key_func=get_user_identifier)