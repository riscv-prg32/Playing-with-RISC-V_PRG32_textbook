# Run from the PRG32 repository root after sourcing ESP-IDF.
python3 -m prg32 esp32c6 build-and-flash
# Optional: join the classroom Wi-Fi instead of the board's own network.
python3 -m prg32 wifi set --ssid "YourSSID" --password "YourPwd" --mode sta
