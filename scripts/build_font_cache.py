"""Create a relocatable cache for the fonts shipped with Matplotlib."""
import copy
import pathlib
import sys
import matplotlib
from matplotlib import font_manager

output = pathlib.Path(sys.argv[1])
output.mkdir(parents=True, exist_ok=True)
font_root = pathlib.Path(matplotlib.get_data_path()).resolve()
manager = copy.copy(font_manager.fontManager)
for name in ("ttflist", "afmlist"):
    setattr(manager, name, [font for font in getattr(manager, name)
                          if pathlib.Path(font.fname).resolve().is_relative_to(font_root)])
font_manager.json_dump(manager, output / f"fontlist-v{manager.__version__}.json")
