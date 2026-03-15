from pydantic import BaseModel
from datetime import date


class DashboardReminder(BaseModel):

    id: int
    title: str
    category: str
    expiryDate: date
    priority: str
    status: str

    class Config:
        from_attributes = True