from pydantic import BaseModel


class DocumentResponse(BaseModel):

    doc_uuid: str
    category: str
    mime_type: str

    class Config:
        from_attributes = True