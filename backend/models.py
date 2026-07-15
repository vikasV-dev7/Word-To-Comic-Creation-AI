from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
import database

class Project(database.Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    language = Column(String, default="English")
    emotion = Column(String, nullable=True)
    pages = Column(Integer, default=10)
    status = Column(String, default="draft")
    data = Column(JSON, nullable=True) # Full project JSON payload

class Character(database.Base):
    __tablename__ = "characters"

    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("projects.id"))
    name = Column(String, index=True)
    gender = Column(String, nullable=True)
    age = Column(String, nullable=True)
    appearance = Column(Text, nullable=True)
    identity_embedding = Column(JSON, nullable=True) # E.g., for LoRA or face ID
    reference_image_url = Column(String, nullable=True)
