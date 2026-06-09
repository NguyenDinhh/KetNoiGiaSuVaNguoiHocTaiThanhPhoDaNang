import os
from dotenv import load_dotenv
load_dotenv()

class Setting:
    url: str = os.getenv("sql")

settings = Setting()
