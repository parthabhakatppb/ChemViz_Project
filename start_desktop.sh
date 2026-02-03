#!/bin/bash
cd desktop
# Ensure backend venv libraries are available or install globally
# This assumes the user has python installed
python3 -m pip install PyQt5 requests matplotlib
python3 desktop_app.py
