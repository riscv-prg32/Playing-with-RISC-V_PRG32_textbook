#!/usr/bin/env bash
# Administrators: a cold backup of everything the Store holds.
docker compose down
tar -czf "cartridge-store-$(date +%F).tgz" data
docker compose up -d
