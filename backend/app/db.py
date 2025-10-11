from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Iterable, Tuple


BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "data.db"


def get_connection() -> sqlite3.Connection:
	"""Return a SQLite connection with row factory configured for dict-like rows."""
	conn = sqlite3.connect(DB_PATH)
	conn.row_factory = sqlite3.Row
	return conn


def _seed_users(cursor: sqlite3.Cursor) -> None:
	"""Populate the users table with a couple of demo accounts if it's empty."""
	cursor.executemany(
		"""
		INSERT INTO users (username, password)
		VALUES (?, ?)
		"""
	,
		_demo_users(),
	)


def _demo_users() -> Iterable[Tuple[str]]:
	return (
		("alice", "password123"),
		("bob", "bob_destroyer"),
	)

def clear_db() -> None:
	"""Removes user and license tables."""
	if DB_PATH.exists():
		DB_PATH.unlink()

def init_db() -> None:
	"""Delete old tables and create new ones."""
	clear_db()
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
