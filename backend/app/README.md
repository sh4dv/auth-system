# Auth System - Backend (FastAPI)

This folder contains a small FastAPI example application used for local development and testing.

Requirements
- Python 3.10+
- See `requirements.txt` for Python dependencies.

Run locally

1. Create a virtual environment and activate it:

    python -m venv .venv
    source .venv/bin/activate

2. Install dependencies:

    pip install -r requirements.txt

3. Start the server (development):

    uvicorn app:app --reload --port 8000

API docs will be available at http://127.0.0.1:8000/docs
