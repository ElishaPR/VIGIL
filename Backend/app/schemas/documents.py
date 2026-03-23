from pydantic import BaseModel


class DocumentResponse(BaseModel):

    doc_uuid: str
    category: str
    mime_type: str
    notes: str | None = None

    class Config:
        from_attributes = True