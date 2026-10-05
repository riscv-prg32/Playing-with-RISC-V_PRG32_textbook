#!/usr/bin/env bash
# Editors only: list the queue, then verify or reject submission 7.
AUTH="Authorization: Bearer $PRG32_EDITOR_TOKEN"
curl -H "$AUTH" "$PRG32_STORE_URL/api/submissions"
curl -X POST "$PRG32_STORE_URL/api/submissions/7/verify" \
  -H "$AUTH" -H 'Content-Type: application/json' \
  -d '{"metadata":{"tags":["class-3b","arcade"]}}'
# or: curl -X POST "$PRG32_STORE_URL/api/submissions/7/reject" -H "$AUTH"
