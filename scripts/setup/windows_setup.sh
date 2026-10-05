cd $HOME\Documents
git clone https://github.com/riscv-prg32/PRG32.git
cd PRG32
pip install pyaudio zeroconf
python -m prg32 doctor
python -m prg32 esp32c6 build
