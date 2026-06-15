from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import declared_attr
from sqlalchemy.orm import as_declarative

@as_declarative()
class Base:
    __abstract__ = True
    __name__: str

    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower()

class BaseModel(Base):
    __abstract__ = True
    id: str = Column(String(10), primary_key=True)
