"""Load bundled plotting fonts before frozen macOS system-font discovery."""
import atexit
import os
import pathlib
import shutil
import sys
import tempfile

os.environ.setdefault("MPLBACKEND", "Agg")
cache = pathlib.Path(tempfile.mkdtemp(prefix="eeg-matplotlib-"))
atexit.register(shutil.rmtree, cache, ignore_errors=True)
os.environ["MPLCONFIGDIR"] = str(cache)
for seed in (pathlib.Path(sys._MEIPASS) / "font-cache").glob("fontlist-v*.json"):
    shutil.copyfile(seed, cache / seed.name)
# The cache uses relative paths to Matplotlib's bundled fonts and survives relocation.
from matplotlib import font_manager  # noqa: E402,F401
