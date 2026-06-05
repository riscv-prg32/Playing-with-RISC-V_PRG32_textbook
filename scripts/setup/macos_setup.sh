brew install git cmake ninja dfu-util ccache libusb python
cd $HOME
git clone -b v5.3 --recursive https://github.com/espressif/esp-idf.git
cd esp-idf
./install.sh esp32c3,esp32c6
. ./export.sh
