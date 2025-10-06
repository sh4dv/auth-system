
import os
from datetime import datetime, timedelta
import secrets
import sqlite3
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from passlib.context import CryptContext

from db import get_connection, init_db

app = FastAPI(title="Auth System API", version="0.2.0")

# NOTE: In production, restrict origins to your frontend domain(s).
origins = ["*"]

app.add_middleware(
	CORSMiddleware,
	allow_origins=origins,
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


class User(BaseModel):
	id: int
	username: str


class LoginRequest(BaseModel):
	username: str
	password: str


class Token(BaseModel):
	access_token: str
	token_type: str = "bearer"
	expires_at: datetime

# Config (override via environment in production)
SECRET_KEY = os.getenv("SECRET_KEY", "_DEV_CHANGE_ME_")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")



@app.on_event("startup")
def on_startup() -> None:
	init_db()


@app.get("/", tags=["root"])
async def read_root():
	return {"message": "Welcome to the Auth System API"}


@app.get("/health", tags=["health"])
async def health():
	return {"status": "ok"}


def verify_password(plain: str, hashed: str) -> bool:
	"""Verify bcrypt hashed password."""
	return pwd_context.verify(plain, hashed)


def validate_password(password: str) -> tuple[bool, str]:
	"""Validate password meets requirements: 4+ chars, at least 1 number."""
	if len(password) < 4:
		return False, "Password must be at least 4 characters long"
	if not any(char.isdigit() for char in password):
		return False, "Password must contain at least one number"
	return True, ""


def create_access_token(sub: str, minutes: int) -> tuple[str, datetime]:
	expires_at = datetime.utcnow() + timedelta(minutes=minutes)
	payload = {"sub": sub, "exp": expires_at}
	token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
	return token, expires_at


def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
	"""Dependency that extracts and validates current user from JWT."""
	try:
		payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
		username: str = payload.get("sub")
		if not username:
			raise HTTPException(status_code=401, detail="Invalid token payload")
	except JWTError:
		raise HTTPException(status_code=401, detail="Invalid or expired token")

	with get_connection() as conn:
		row = conn.execute(
			"SELECT id, username FROM users WHERE username = ?",
			(username,),
		).fetchone()
	if not row:
		raise HTTPException(status_code=401, detail="User not found")
	return User(**dict(row))


@app.get("/users", response_model=List[User], tags=["users"])
async def list_users(current: User = Depends(get_current_user)):
	with get_connection() as conn:
		rows = conn.execute(
			"SELECT id, username FROM users ORDER BY id"
		).fetchall()
	return [User(**dict(row)) for row in rows]

@app.get("/auth/check-username/{username}", tags=["auth"])
async def check_username(username: str):
	"""Check if a username is available (not taken)."""
	if len(username) < 3:
		raise HTTPException(status_code=400, detail="Username too short")
	
	with get_connection() as conn:
		row = conn.execute(
			"SELECT id FROM users WHERE username = ?",
			(username,),
		).fetchone()
	
	return {
		"username": username,
		"available": row is None
	}

@app.post("/auth/login", response_model=Token, tags=["auth"])
async def login(req: LoginRequest):
    # Validate password requirements
    is_valid, error_msg = validate_password(req.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)
    
    # Validate username length
    if len(req.username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters long")
    
    with get_connection() as conn:
        row = conn.execute(
            "SELECT id, username, password FROM users WHERE username = ?",
            (req.username,),
        ).fetchone()

        if not row:
            # Auto-register new user
            hashed = pwd_context.hash(req.password)
            try:
                cur = conn.execute(
                    "INSERT INTO users (username, password) VALUES (?, ?)",
                    (req.username, hashed),
                )
                conn.commit()
                user_id = cur.lastrowid
            except sqlite3.IntegrityError:
                # In case multiple users try to register the same username at once
                row = conn.execute(
                    "SELECT id, username, password FROM users WHERE username = ?",
                    (req.username,),
                ).fetchone()
                if not row:
                    raise HTTPException(status_code=500, detail="Could not create user, please retry")
                user_id = row["id"]
        else:
            user_id = row["id"]
            if not verify_password(req.password, row["password"]):
                raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token, expires_at = create_access_token(
        sub=req.username,
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES,
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_at": expires_at,
    }

@app.get("/me", response_model=User, tags=["auth"])
async def me(current: User = Depends(get_current_user)):
	return current


if __name__ == "__main__":
	# Allows running `python app.py` directly for local development.
	import uvicorn

	uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)

