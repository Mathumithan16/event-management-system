from pydantic import BaseModel, EmailStr
class UserCreate(BaseModel): #This represents data coming from React Native → Backend.
    name: str
    email: EmailStr
    password: str
    role: str


class UserResponse(BaseModel):#going to recatnative
    id: int
    name: str
    email: EmailStr
    role: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str