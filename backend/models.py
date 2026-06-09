from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from datetime import datetime
from database import Base


class InterviewEntry(Base):
    __tablename__ = "interview_entries"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True)
    enterprise = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    llm_response = Column(Text, nullable=False)


class Feedback(Base):
    __tablename__ = "feedbacks"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True)
    title = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    source_data = Column(Text, nullable=False)
    llm_response = Column(Text, nullable=False)
    feedback = Column(Text, nullable=False)
    
class SelfAnalysis(Base):
    __tablename__ = "self_analyses"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True)
    
    # センターノード（親）のエピソード概要
    episode_summary = Column(Text, nullable=False)
    
    # 孫ノード生成のための各項目のリスト（JSON形式で保存）
    think_list = Column(JSON, nullable=False, default=list)        # 何を考えたか
    gain_list = Column(JSON, nullable=False, default=list)         # 何を得たか
    learn_list = Column(JSON, nullable=False, default=list)        # 何を学んだか
    why_list = Column(JSON, nullable=False, default=list)          # なぜそれをやったのか
    appeal_list = Column(JSON, nullable=False, default=list)       # どんな能力がアピールできるか
    contribution_list = Column(JSON, nullable=False, default=list) # どう活かせるか
