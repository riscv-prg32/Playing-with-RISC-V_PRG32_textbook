python3 -m venv .venv
. .venv/bin/activate
python3 -m pip install -r tools/prg32_metrics_server/requirements.txt
python3 tools/prg32_metrics_server/app.py --host 0.0.0.0 --port 8080
