from sqlalchemy import Column, Integer, BigInteger, String, Text, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base
import uuid


# Users table (新規)
class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    auth_provider_id = Column(String(255), unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# Interview sessions (親テーブル)
class InterviewSession(Base):
    __tablename__ = "interview_sessions"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    company_name = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship('User', backref='interview_sessions')


# Interview entries (Q&A) — テーブル名は従来と同じにしているが構造を変更
class InterviewEntry(Base):
    __tablename__ = "interview_entries"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    session_id = Column(String(36), ForeignKey('interview_sessions.id', ondelete='CASCADE'), nullable=False, index=True)
    question_text = Column(Text, nullable=False)
    answer_text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship('InterviewSession', backref='entries')


# Interview feedbacks (旧 feedbacks -> interview_feedbacks)
class Feedback(Base):
    __tablename__ = "interview_feedbacks"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    session_id = Column(String(36), ForeignKey('interview_sessions.id', ondelete='CASCADE'), nullable=False, unique=True, index=True)
    title = Column(String(255), nullable=False)
    analysis_text = Column(Text, nullable=False)
    scores_data = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship('InterviewSession', backref='feedback')


# Self analysis table (構造をJSONベースに変更)
class SelfAnalysis(Base):
    __tablename__ = "self_analyses"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    session_id = Column(String(36), ForeignKey('interview_sessions.id', ondelete='CASCADE'), nullable=False, unique=True, index=True)
    episode_summary = Column(Text, nullable=False)
    think_list = Column(JSON, nullable=True)
    gain_list = Column(JSON, nullable=True)
    learn_list = Column(JSON, nullable=True)
    why_list = Column(JSON, nullable=True)
    appeal_list = Column(JSON, nullable=True)
    contribution_list = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    session = relationship('InterviewSession', backref='self_analysis')
