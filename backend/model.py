from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy import Integer
from sqlalchemy import Column, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql.expression import text
from sqlalchemy.sql.sqltypes import TIMESTAMP as TIME_STAMP
import datetime
from typing import Optional
from database import Base
class users(Base):
    __tablename__ = "users"
    id: Mapped[int] = Column(Integer, primary_key=True)
    name: Mapped[str] = Column(String, nullable=False)
class chatgroups(Base):
    __tablename__ = "chatgroups"
    id: Mapped[int] = Column(Integer, primary_key=True)
    name: Mapped[Optional[str]] = Column(String, nullable=False)
    user_id: Mapped[int] = Column(Integer, nullable=False)
    created_at: Mapped[datetime.date] = mapped_column(TIME_STAMP(timezone=True),nullable=False,server_default=text("now()"))
class chats(Base):
    __tablename__ = "chats"
    id: Mapped[int] = Column(Integer, primary_key=True)
    user_id: Mapped[int] = Column(Integer, nullable=False)
    chatgroup_id: Mapped[int] = Column(Integer, nullable=False)
    question: Mapped[str] = Column(String, nullable=False)
    answer: Mapped[str] = Column(String, nullable=False)