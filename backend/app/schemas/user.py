from enum import Enum

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator


class UserRole(str, Enum):
    ORGANIZER = "ORGANIZER"
    VOLUNTEER = "VOLUNTEER"
    ADMIN = "ADMIN"


class RegistrationRole(str, Enum):
    ORGANIZER = UserRole.ORGANIZER.value
    VOLUNTEER = UserRole.VOLUNTEER.value


class RegistrationRoleInput(BaseModel):
    role: RegistrationRole

    @field_validator("role", mode="before")
    @classmethod
    def normalize_role(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip().upper()
        return value


class UserCreate(RegistrationRoleInput): #This represents data coming from React Native → Backend.
    name: str
    email: EmailStr
    password: str


class EmailVerificationRequest(BaseModel):
    email: EmailStr
    otp: str

    @field_validator("otp")
    @classmethod
    def validate_otp(cls, value: str) -> str:
        if len(value) != 6 or not value.isdigit():
            raise ValueError("OTP must be a 6-digit code") #create 6 digit otp#
        return value


class EmailRequest(BaseModel):
    email: EmailStr


class UserResponse(BaseModel):#going to recatnative
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    role: str
    is_approved: bool


UserRoleUpdate = RegistrationRoleInput


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str


class GoogleLoginRequest(BaseModel):
    credential: str
    role: RegistrationRole = RegistrationRole.VOLUNTEER
