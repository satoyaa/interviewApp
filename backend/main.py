from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import database and models so SQLAlchemy knows about table definitions
import database
import models

from routers.interview import router as interview_router
from routers.analysis import router as analysis_router


app = FastAPI(title="LLM Backend API")

# CORS 設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# テーブル作成（models をインポートした後に実行）
database.Base.metadata.create_all(bind=database.engine)

# ルーターを登録
app.include_router(interview_router)
app.include_router(analysis_router)

