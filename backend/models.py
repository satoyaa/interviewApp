from sqlalchemy import Column, Integer, String, Text, DateTime
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
