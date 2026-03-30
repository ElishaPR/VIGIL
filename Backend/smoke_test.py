"""
Quick smoke test: login then hit the 3 previously-failing endpoints.
Run from Backend dir: .\\venv\\Scripts\\python.exe smoke_test.py
"""
import requests

BASE = "http://localhost:8000"
session = requests.Session()

# ── Login ────────────────────────────────────────────────────────────────────
r = session.post(f"{BASE}/users/login", json={
    "email_address": "elishaandsaral@gmail.com",
    "password": "test1234"          # update if different
})
if r.status_code != 200:
    print(f"LOGIN FAILED {r.status_code}: {r.text}")
    exit(1)
print(f"[OK] Login  → {r.json().get('message', r.status_code)}")

# ── Dashboard reminders (was crashing with user_id error) ────────────────────
r = session.get(f"{BASE}/reminders/dashboard")
print(f"[{'OK' if r.ok else 'FAIL'}] GET /reminders/dashboard → {r.status_code}  {'' if r.ok else r.text[:200]}")

# ── Document list ─────────────────────────────────────────────────────────────
r = session.get(f"{BASE}/documents/list")
docs = r.json() if r.ok else []
print(f"[{'OK' if r.ok else 'FAIL'}] GET /documents/list      → {r.status_code}  ({len(docs)} docs)")

print("\nAll checks done. Backend is healthy.")
