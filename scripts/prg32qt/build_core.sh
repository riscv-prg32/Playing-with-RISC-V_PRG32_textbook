#!/usr/bin/env bash
# Build and test the portable, Qt-free runtime core.
git clone https://github.com/riscv-prg32/PRG32-QT.git
cd PRG32-QT
cmake -S . -B build-core -G Ninja -DPRG32QT_BUILD_APP=OFF
cmake --build build-core
ctest --test-dir build-core --output-on-failure
