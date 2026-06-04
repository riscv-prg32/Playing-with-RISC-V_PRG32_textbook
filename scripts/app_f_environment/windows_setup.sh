cd $HOME\Documents
git clone https://github.com/riscv-prg32/PRG32.git
cd PRG32
idf.py -B build-esp32c6 -D SDKCONFIG_DEFAULTS=sdkconfig.defaults set-target esp32c6
idf.py -B build-esp32c6 -D SDKCONFIG_DEFAULTS=sdkconfig.defaults build
