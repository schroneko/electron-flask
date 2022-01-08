# from . import home
# from .calc_zscore import calc_zscore

import os
import pathlib
import sys

from flask import (
    Flask,
    flash,
    redirect,
    render_template,
    request,
    send_from_directory,
    url_for,
)

from . import home
from .calc_zscore import calc_zscore

sys.dont_write_bytecode = True

UPLOAD_FOLDER = os.path.join(os.getcwd(), "out")
ALLOWED_EXTENSIONS = set(["m00", "edf"])

app = Flask(__name__)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# @app.route("/", methods=["GET", "POST"])
@home.route("/", methods=["GET", "POST"])
def uploads_file():
    if request.method == "POST":
        if "file" not in request.files:
            flash("File is not found.")
            return redirect(request.url)
        file = request.files["file"]
        input_name = request.form["text"]

        if file.filename == "":
            flash("File is not found.")
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = file.filename
            # For Windows Installer
            # file.save(os.path.join(os.chdir(".."), "out", filename))
            file.save(os.path.join(os.getcwd(), "out", filename))
            calc_zscore(filename, input_name)

            # return redirect(url_for("uploaded_file", filename=filename))
            return redirect(url_for("home.uploaded_file", filename=filename))
    # return render_template("index.html")
    return render_template("page/home/index.html", title="Welcome")


# @app.route("/out/<filename>")
@home.route("/out/<filename>")
def uploaded_file(filename):
    extension = pathlib.PurePath(filename).suffix
    return send_from_directory(
        UPLOAD_FOLDER,
        # filename.replace(".m00", ".docx"),
        filename.replace(extension, ".docx"),
        as_attachment=True,
    )


if __name__ == "__main__":
    app.run(host="localhost", port=5000)
