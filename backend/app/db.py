from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Iterable, Tuple


BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "data.db"


def get_connection() -> sqlite3.Connection:
	"""Return a SQLite connection with row factory configured for dict-like rows."""
	conn = sqlite3.connect(DB_PATH, timeout=10.0)  # Add timeout to prevent indefinite locks
	conn.row_factory = sqlite3.Row
	return conn


def _seed_users(cursor: sqlite3.Cursor) -> None:
	"""Populate the users table with a couple of demo accounts if it's empty."""
	import secrets
	cursor.executemany(
		"""
		INSERT INTO users (username, password, secret_token)
		VALUES (?, ?, ?)
		"""
	,
		_demo_users(),
	)


def _demo_users() -> Iterable[Tuple[str]]:
	import secrets
	return (
		("alice", "password123", secrets.token_hex(16)),
		("bob", "bob_destroyer", secrets.token_hex(16)),
		("steve", "abcd1234", secrets.token_hex(16)),
		("eve", "eve_hacker", secrets.token_hex(16)),
	)

def clear_db() -> None:
	"""Removes user and license tables."""
	if DB_PATH.exists():
		DB_PATH.unlink()

def init_db() -> None:
	"""Delete old tables and create new ones."""
	clear_db()  # Uncommented to reset DB with new schema
	DB_PATH.parent.mkdir(parents=True, exist_ok=True)
	with get_connection() as conn:
		cursor = conn.cursor()
		cursor.execute(
			"""
			CREATE TABLE IF NOT EXISTS users (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				username TEXT UNIQUE NOT NULL,
				password TEXT NOT NULL,
				is_premium BOOLEAN NOT NULL DEFAULT 0,
				secret_token TEXT UNIQUE NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			)
			"""
		)
		cursor.execute(
			"""
			CREATE TABLE IF NOT EXISTS licenses (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				user_id INTEGER NOT NULL,
				license_key TEXT UNIQUE NOT NULL,
				uses INTEGER NOT NULL DEFAULT 1,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY (user_id) REFERENCES users (id)
			)
			"""
		)
		cursor.execute(
			"""
			CREATE TABLE IF NOT EXISTS global_stats (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				total_users INTEGER NOT NULL DEFAULT 0,
				total_licenses_created INTEGER NOT NULL DEFAULT 0,
				total_licenses_active INTEGER NOT NULL DEFAULT 0,
				total_licenses_deleted INTEGER NOT NULL DEFAULT 0,
				total_license_validations INTEGER NOT NULL DEFAULT 0,
				last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			)
			"""
		)
		cursor.execute(
			"""
			CREATE TABLE IF NOT EXISTS account_history (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				user_id INTEGER NOT NULL,
				action_type TEXT NOT NULL,
				action_details TEXT,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
			)
			"""
		)
		cursor.execute(
			"""
			CREATE INDEX IF NOT EXISTS idx_account_history_user_id ON account_history(user_id)
			"""
		)
		cursor.execute(
			"""
			CREATE INDEX IF NOT EXISTS idx_account_history_created_at ON account_history(created_at)
			"""
		)
		# Initialize global_stats if empty
		cursor.execute("SELECT COUNT(*) as count FROM global_stats")
		if cursor.fetchone()["count"] == 0:
			cursor.execute(
				"""
				INSERT INTO global_stats (total_users, total_licenses_created, total_licenses_active, total_licenses_deleted, total_license_validations)
				VALUES (0, 0, 0, 0, 0)
				"""
			)
		conn.commit()
