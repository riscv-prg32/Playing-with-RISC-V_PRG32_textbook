#!/usr/bin/env bash
git clone https://github.com/riscv-prg32/PRG32-Construction-Kit.git
cd PRG32-Construction-Kit
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
python app.py            # then open http://127.0.0.1:5090/
