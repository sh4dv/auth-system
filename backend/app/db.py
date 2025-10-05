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
		INSERT INTO users (username,)
		VALUES (?)
		"""
	,
		_demo_users(),
	)


def _demo_users() -> Iterable[Tuple[str]]:
	return (
		("alice",),
		("bob",),
	)


def init_db() -> None:
	"""Create tables"""
	DB_PATH.parent.mkdir(parents=True, exist_ok=True)
	with get_connection() as conn:
		cursor = conn.cursor()
		cursor.execute(
			"""
			CREATE TABLE IF NOT EXISTS users (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				username TEXT UNIQUE NOT NULL
			)
			"""
		)
		cursor.execute(
			"""
			CREATE TABLE IF NOT EXISTS licenses (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				user_id INTEGER NOT NULL,
				license_key TEXT UNIQUE NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY (user_id) REFERENCES users (id)
			)
			"""
		)
		conn.commit()
