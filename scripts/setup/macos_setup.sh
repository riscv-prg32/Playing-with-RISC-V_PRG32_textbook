brew install git cmake ninja dfu-util ccache libusb python curl zip portaudio
cd $HOME
git clone -b v5.4 --recursive https://github.com/espressif/esp-idf.git
cd esp-idf
./install.sh esp32c3,esp32c6
. ./export.sh
pip install pyaudio zeroconf   # inside the ESP-IDF environment
