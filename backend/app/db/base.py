from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

print("Kết nối với db: ",settings.url)
engine = create_engine(settings.url)
localSession = sessionmaker(autoflush= False, autocommit= False, bind= engine)
def get_db():
    db = localSession()
    try:
        yield db
    finally:
        db.close()
