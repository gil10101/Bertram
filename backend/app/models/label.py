from pydantic import BaseModel


class Label(BaseModel):
    id: str
    name: str
    color: str = "#6B7280"
    is_system: bool = False


class LabelCreate(BaseModel):
    name: str
    color: str = "#6B7280"


class LabelUpdate(BaseModel):
    name: str | None = None
    color: str | None = None
