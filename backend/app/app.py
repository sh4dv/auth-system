
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
FREE_LICENSES_LIMIT = 3 # Maximum free licenses per user


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
	is_premium: int = 0
	created_at: str = None


class LoginRequest(BaseModel):
	username: str
	password: str


class PasswordChangeRequest(BaseModel):
	current_password: str
	new_password: str
	confirm_password: str


class UsernameChangeRequest(BaseModel):
	new_username: str


class AccountDeletionRequest(BaseModel):
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


@app.get("/users/count", tags=["users"])
async def get_users_count():
	"""Get total number of registered users (public endpoint)."""
	with get_connection() as conn:
		row = conn.execute("SELECT COUNT(*) as count FROM users").fetchone()
	return {"count": row["count"]}


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
			"SELECT id, username, is_premium, created_at FROM users WHERE username = ?",
			(username,),
		).fetchone()
	if not row:
		raise HTTPException(status_code=401, detail="User not found")
	return User(**dict(row))


@app.post("/licenses/generate", tags=["licenses"])
async def generate_license(current: User = Depends(get_current_user), license_key: str = None, length: int = 16, uses: int = 1, amount: int = 1):
	"""Generate a new license key, replace * with random chars."""
	# Check user limits
	with get_connection() as conn:
		row = conn.execute(
			"SELECT COUNT(*) as count FROM licenses WHERE user_id = ?",
			(current.id,),
		).fetchone()
		license_count = row["count"]
		row = conn.execute(
			"SELECT is_premium FROM users WHERE id = ?",
			(current.id,),
		).fetchone()
		is_premium = row["is_premium"]
	license_count += amount

	# Check license limits
	if not is_premium and license_count > FREE_LICENSES_LIMIT:
		raise HTTPException(status_code=403, detail="Free license limit reached. Upgrade to premium for more.")
	if amount > 1 and not is_premium:
		raise HTTPException(status_code=403, detail="Only premium users can generate multiple licenses at once.")
	if amount > 1000:
		raise HTTPException(status_code=400, detail="Can only generate up to 1000 licenses at once.")
	
	# Validate inputs
	if amount < 1:
		raise HTTPException(status_code=400, detail="Invalid licenses amount")
	if length < 4 or length > 64:
		raise HTTPException(status_code=400, detail="Invalid license key length")
	if amount < 1 or amount > 100:
		raise HTTPException(status_code=400, detail="Invalid amount, must be 1-100")
	if uses == 0:
		uses = 999999 # Unlimited uses

	# Generate or process license key
	if not license_key:
		# Generate random key
		random_part = secrets.token_hex(length)
		if not is_premium:
			license_key = f"auth.cc-{random_part}"
		else:
			license_key = random_part
	elif "*" in license_key:
		# Replace each * with a random hex character
		random_hex = secrets.token_hex(license_key.count("*"))  # Generate enough random chars
		result = []
		hex_index = 0
		for char in license_key:
			if char == "*":
				result.append(random_hex[hex_index])
				hex_index += 1
			else:
				result.append(char)
		license_key = "".join(result)
		
		# For free users, ensure the prefix is present
		if not is_premium and not license_key.startswith("auth.cc-"):
			license_key = f"auth.cc-{license_key}"
	else:
		# Custom key without wildcards
		if not is_premium and not license_key.startswith("auth.cc-"):
			license_key = f"auth.cc-{license_key}"
	
	with get_connection() as conn:
		# Ensure unique license key
		row = conn.execute(
			"SELECT id FROM licenses WHERE license_key = ?",
			(license_key,),
		).fetchone()
		if row:
			raise HTTPException(status_code=400, detail="License key already exists")
		# Insert new license with x uses
		conn.execute(
			"INSERT INTO licenses (user_id, license_key, uses) VALUES (?, ?, ?)",
			(current.id, license_key, uses),
		)
		# Update global stats
		conn.execute(
			"UPDATE global_stats SET total_licenses_created = total_licenses_created + 1, total_licenses_active = total_licenses_active + 1"
		)
	return {"license_key": license_key}

@app.get("/licenses/list", tags=["licenses"])
async def list_licenses(current: User = Depends(get_current_user)):
	"""List all licenses owned by the current user."""
	with get_connection() as conn:
		rows = conn.execute(
			"SELECT license_key, uses, created_at FROM licenses WHERE user_id = ? ORDER BY created_at DESC",
			(current.id,),
		).fetchall()
	return [{"license_key": row["license_key"], "uses": row["uses"], "created_at": row["created_at"]} for row in rows]

@app.delete("/licenses/delete", tags=["licenses"])
async def delete_license(license_key: str, current: User = Depends(get_current_user)):
	with get_connection() as conn:
		# Check if license exists
		row = conn.execute(
			"SELECT id FROM licenses WHERE license_key = ? AND user_id = ?",
			(license_key, current.id),
		).fetchone()
		if not row:
			raise HTTPException(status_code=404, detail="License not found")

		# Delete the license, if user is the owner
		conn.execute(
			"DELETE FROM licenses WHERE id = ? AND user_id = ?",
			(row["id"], current.id),
		)
		# Update global stats
		conn.execute(
			"UPDATE global_stats SET total_licenses_deleted = total_licenses_deleted + 1, total_licenses_active = total_licenses_active - 1"
		)
		return {"detail": "License deleted"}

@app.get("/licenses/validate", tags=["licenses"])
async def validate_license(license_key: str):
	"""Validate a license key publicly (no authentication required)."""
	with get_connection() as conn:
		row = conn.execute(
			"SELECT id, uses FROM licenses WHERE license_key = ?",
			(license_key,),
		).fetchone()
		if not row:
			raise HTTPException(status_code=404, detail="License not found")
		
		uses = row["uses"]
		if uses == 0:
			raise HTTPException(status_code=403, detail="License has no uses remaining")
		
		# Update global stats
		conn.execute(
			"UPDATE global_stats SET total_license_validations = total_license_validations + 1"
		)
		
		return {
			"detail": "License is valid",
			"uses": uses if uses != 999999 else "unlimited"
		}

@app.get("/users", response_model=List[User], tags=["users"])
async def list_users(current: User = Depends(get_current_user)):
	with get_connection() as conn:
		rows = conn.execute(
			"SELECT id, username, is_premium FROM users ORDER BY id"
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
                # Update global stats for new user
                conn.execute(
                    "UPDATE global_stats SET total_users = total_users + 1"
                )
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

@app.post("/subscribe", tags=["subscriptions"])
async def subscribe(current: User = Depends(get_current_user)):
	# Change user type to premium
	with get_connection() as conn:
		conn.execute(
			"UPDATE users SET is_premium = 1 WHERE id = ?",
			(current.id,),
		)
	# No payment gateway yet, just a placeholder
	return {"detail": "User upgraded to premium"}

@app.get("/me", response_model=User, tags=["auth"])
async def me(current: User = Depends(get_current_user)):
	return current


@app.post("/auth/change-password", tags=["auth"])
async def change_password(req: PasswordChangeRequest, current: User = Depends(get_current_user)):
	"""Change user password after validating current password."""
	# Validate new password
	is_valid, error_msg = validate_password(req.new_password)
	if not is_valid:
		raise HTTPException(status_code=400, detail=error_msg)
	
	# Check passwords match
	if req.new_password != req.confirm_password:
		raise HTTPException(status_code=400, detail="New passwords do not match")
	
	with get_connection() as conn:
		# Verify current password
		row = conn.execute(
			"SELECT password FROM users WHERE id = ?",
			(current.id,),
		).fetchone()
		
		if not verify_password(req.current_password, row["password"]):
			raise HTTPException(status_code=400, detail="Current password is incorrect")
		
		# Update password
		hashed = pwd_context.hash(req.new_password)
		conn.execute(
			"UPDATE users SET password = ? WHERE id = ?",
			(hashed, current.id),
		)
	
	return {"detail": "Password changed successfully"}


@app.post("/auth/change-username", tags=["auth"])
async def change_username(req: UsernameChangeRequest, current: User = Depends(get_current_user)):
	"""Change username after checking availability."""
	new_username = req.new_username.strip()
	
	# Validate username length
	if len(new_username) < 3:
		raise HTTPException(status_code=400, detail="Username must be at least 3 characters long")
	
	with get_connection() as conn:
		# Check if username is taken
		row = conn.execute(
			"SELECT id FROM users WHERE username = ?",
			(new_username,),
		).fetchone()
		
		if row:
			raise HTTPException(status_code=400, detail="Username already taken")
		
		# Update username
		try:
			conn.execute(
				"UPDATE users SET username = ? WHERE id = ?",
				(new_username, current.id),
			)
		except sqlite3.IntegrityError:
			raise HTTPException(status_code=400, detail="Username already taken")
	
	# Generate new token with new username
	access_token, expires_at = create_access_token(
		sub=new_username,
		minutes=ACCESS_TOKEN_EXPIRE_MINUTES,
	)
	
	return {
		"detail": "Username changed successfully",
		"access_token": access_token,
		"expires_at": expires_at,
	}


@app.delete("/auth/delete-account", tags=["auth"])
async def delete_account(req: AccountDeletionRequest, current: User = Depends(get_current_user)):
	"""Delete user account and all associated licenses after password verification."""
	with get_connection() as conn:
		# Verify password
		row = conn.execute(
			"SELECT password FROM users WHERE id = ?",
			(current.id,),
		).fetchone()
		
		if not verify_password(req.password, row["password"]):
			raise HTTPException(status_code=400, detail="Incorrect password")
		
		# Count licenses to be deleted
		license_count_row = conn.execute(
			"SELECT COUNT(*) as count FROM licenses WHERE user_id = ?",
			(current.id,),
		).fetchone()
		license_count = license_count_row["count"]
		
		# Delete all user licenses
		conn.execute(
			"DELETE FROM licenses WHERE user_id = ?",
			(current.id,),
		)
		
		# Delete user
		conn.execute(
			"DELETE FROM users WHERE id = ?",
			(current.id,),
		)
		
		# Update global stats
		conn.execute(
			"UPDATE global_stats SET total_licenses_deleted = total_licenses_deleted + ?, total_licenses_active = total_licenses_active - ?",
			(license_count, license_count),
		)
	
	return {"detail": "Account deleted successfully"}


@app.get("/stats/global", tags=["stats"])
async def get_global_stats():
	"""Get global statistics (updated daily)."""
	with get_connection() as conn:
		row = conn.execute(
			"SELECT total_users, total_licenses_created, total_licenses_active, total_licenses_deleted, total_license_validations, last_updated FROM global_stats ORDER BY id DESC LIMIT 1"
		).fetchone()
		
		if not row:
			# Initialize if not exists
			conn.execute(
				"INSERT INTO global_stats (total_users, total_licenses_created, total_licenses_active, total_licenses_deleted, total_license_validations) VALUES (0, 0, 0, 0, 0)"
			)
			row = conn.execute(
				"SELECT total_users, total_licenses_created, total_licenses_active, total_licenses_deleted, total_license_validations, last_updated FROM global_stats ORDER BY id DESC LIMIT 1"
			).fetchone()
	
	return {
		"total_users": row["total_users"],
		"total_licenses_created": row["total_licenses_created"],
		"total_licenses_active": row["total_licenses_active"],
		"total_licenses_deleted": row["total_licenses_deleted"],
		"total_license_validations": row["total_license_validations"],
		"last_updated": row["last_updated"],
	}


@app.post("/stats/update", tags=["stats"])
async def update_global_stats():
	"""Update global statistics (should be called daily via cron/scheduler)."""
	with get_connection() as conn:
		# Count total users
		user_count = conn.execute("SELECT COUNT(*) as count FROM users").fetchone()["count"]
		
		# Count total licenses created (all time)
		total_created = conn.execute("SELECT COUNT(*) as count FROM licenses").fetchone()["count"]
		
		# Count active licenses (current)
		active_licenses = conn.execute("SELECT COUNT(*) as count FROM licenses").fetchone()["count"]
		
		# Get current deleted count and validations (they increment, don't recalculate)
		current_stats = conn.execute(
			"SELECT total_licenses_deleted, total_license_validations FROM global_stats ORDER BY id DESC LIMIT 1"
		).fetchone()
		
		deleted_count = current_stats["total_licenses_deleted"] if current_stats else 0
		validation_count = current_stats["total_license_validations"] if current_stats else 0
		
		# Update stats
		conn.execute(
			"UPDATE global_stats SET total_users = ?, total_licenses_created = ?, total_licenses_active = ?, last_updated = CURRENT_TIMESTAMP",
			(user_count, total_created, active_licenses),
		)
	
	return {"detail": "Global stats updated successfully"}


if __name__ == "__main__":
	# Allows running `python app.py` directly for local development.
	import uvicorn

	uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)

