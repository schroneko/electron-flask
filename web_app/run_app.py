import multiprocessing

# PyInstaller workers must exit before importing or starting the Flask app.
if __name__ == "__main__":
    multiprocessing.freeze_support()

# NOTE: Explicitly import configuration so that PyInstaller is able to find and bundle it
import config
from app import create_app

application = create_app(config.DevelopmentConfig)

if __name__ == "__main__":
    application.run(host="127.0.0.1", port=4040, debug=False, use_reloader=False)
