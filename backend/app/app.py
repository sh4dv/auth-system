
import secrets

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware

from db import get_connection, init_db

app = FastAPI(title="Auth System API", version="0.1.0")

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



@app.on_event("startup")
def on_startup() -> None:
	init_db()


@app.get("/", tags=["root"])
async def read_root():
	return {"message": "Welcome to the Auth System API"}


@app.get("/health", tags=["health"])
async def health():
	return {"status": "ok"}


@app.get("/users", response_model=List[User], tags=["users"])
async def list_users():
	with get_connection() as conn:
		rows = conn.execute(
			"SELECT id, username FROM users ORDER BY id"
		).fetchall()
	return [User(**dict(row)) for row in rows]


@app.post("/auth/login", tags=["auth"])
async def login(req: LoginRequest):
	with get_connection() as conn:
		row = conn.execute(
			"SELECT username, password FROM users WHERE username = ?",
			(req.username,),
		).fetchone()

	if row and secrets.compare_digest(row["password"], req.password):
		return {"access_token": f"fake-token-for-{req.username}", "token_type": "bearer"}

	raise HTTPException(status_code=401, detail="Invalid credentials")


if __name__ == "__main__":
	# Allows running `python app.py` directly for local development.
	import uvicorn

	uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)

