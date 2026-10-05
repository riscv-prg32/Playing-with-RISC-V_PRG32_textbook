#!/usr/bin/env bash
cd PRG32-Construction-Kit
docker compose up --build -d     # data persists in ./data
# Pupils open http://<teacher-laptop-ip>:5090/ from their browsers.
