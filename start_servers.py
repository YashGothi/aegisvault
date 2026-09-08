#!/usr/bin/env python
"""
AegisVault Unified Development Launcher
Runs the Django REST API backend on port 8000 and the Vite React Frontend on port 3000 concurrently.
"""

import os
import sys
import subprocess
import time
import threading
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / 'backend'
FRONTEND_DIR = ROOT_DIR / 'frontend'

# Ensure Node.js is accessible in PATH
NODE_PATHS = [
    r"C:\Program Files\nodejs",
    r"C:\Program Files (x86)\nodejs",
    os.path.expandvars(r"%LOCALAPPDATA%\Programs\nodejs"),
    os.path.expandvars(r"%APPDATA%\npm"),
]

env = os.environ.copy()
for np in NODE_PATHS:
    if os.path.exists(np):
        env["PATH"] = np + os.pathsep + env.get("PATH", "")

# Find npm executable
NPM_CMD = "npm"
if sys.platform == "win32":
    for np in NODE_PATHS:
        candidate = os.path.join(np, "npm.cmd")
        if os.path.exists(candidate):
            NPM_CMD = candidate
            break

def run_backend():
    print("[Backend] Starting Django REST API on http://127.0.0.1:8000 ...")
    subprocess.run([sys.executable, 'manage.py', 'runserver', '127.0.0.1:8000'], cwd=BACKEND_DIR, env=env)

def run_frontend():
    print("[Frontend] Starting Vite React Dev Server on http://127.0.0.1:3000 ...")
    subprocess.run([NPM_CMD, 'run', 'dev'], cwd=FRONTEND_DIR, env=env, shell=True)

def main():
    print("=" * 65)
    print("  🛡️  AegisVault — Django REST API + React Password Manager")
    print("=" * 65)
    print(f"Backend Directory : {BACKEND_DIR}")
    print(f"Frontend Directory: {FRONTEND_DIR}")
    print("-" * 65)

    # 1. Run migrations first
    print("[Setup] Checking database migrations...")
    subprocess.run([sys.executable, 'manage.py', 'migrate'], cwd=BACKEND_DIR, env=env)

    # 2. Start Backend in background thread
    backend_thread = threading.Thread(target=run_backend, daemon=True)
    backend_thread.start()

    time.sleep(1.5)

    # 3. Start Frontend in background thread
    frontend_thread = threading.Thread(target=run_frontend, daemon=True)
    frontend_thread.start()

    time.sleep(2.0)
    print("-" * 65)
    print("  🚀 Backend API  : http://127.0.0.1:8000/api/")
    print("  ⚛️  React Frontend: http://127.0.0.1:3000/")
    print("=" * 65)
    print("Press Ctrl+C to stop all servers.")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down AegisVault servers. Goodbye!")

if __name__ == '__main__':
    main()
