sudo apt update
sudo apt install -y git wget flex bison gperf python3 python3-venv \
  python3-pip cmake ninja-build ccache libffi-dev libssl-dev \
  dfu-util libusb-1.0-0 python3-zeroconf curl zip portaudio19-dev
cd $HOME
git clone -b v5.4 --recursive https://github.com/espressif/esp-idf.git
cd esp-idf
./install.sh esp32c3,esp32c6
. ./export.sh
pip install pyaudio zeroconf   # inside the ESP-IDF environment
