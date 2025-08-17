from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy import Integer
from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.orm import Mapped
from database import Base
class users(Base):
    __tablename__ = "users"
    id: Mapped[int] = Column(Integer, primary_key=True)
    name: Mapped[str] = Column(String, nullable=False)
class chatgroups(Base):
    __tablename__ = "chatgroups"
    id: Mapped[int] = Column(Integer, primary_key=True)
    name: Mapped[str] = Column(String, nullable=False)
    user_id: Mapped[int] = Column(Integer, nullable=False)
class chats(Base):
    __tablename__ = "chats"
    id: Mapped[int] = Column(Integer, primary_key=True)
    user_id: Mapped[int] = Column(Integer, nullable=False)
    chatgroup_id: Mapped[int] = Column(Integer, nullable=False)
    question: Mapped[str] = Column(String, nullable=False)
    answer: Mapped[str] = Column(String, nullable=False)