from pydantic import BaseModel
from datetime import date

class DocumentData(BaseModel):
    doc_category: str
    expiry_date: date