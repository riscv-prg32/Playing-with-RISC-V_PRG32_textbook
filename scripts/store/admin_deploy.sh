#!/usr/bin/env bash
# Administrators: first deployment of a classroom Store.
git clone https://github.com/riscv-prg32/CartridgeStore.git
cd CartridgeStore
export SECRET_KEY="$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')"
docker compose up --build -d
curl http://127.0.0.1:5080/.well-known/prg32-store.json   # health check
# Then log in as admin at /auth/login and change the default password.
