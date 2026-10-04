const path = require("path");
const { spawn } = require("child_process");

const build = spawn("pyinstaller", [
  process.platform === "win32" ? "--windowed" : "--console",
  "--onefile",
  "--add-data", `web_app/app/templates${path.delimiter}templates`,
  "--add-data", `web_app/app/static${path.delimiter}static`,
  "--collect-data", "mne",
  "--distpath", "dist-python",
  "web_app/run_app.py",
], { stdio: "inherit" });

build.on("error", (error) => {
  console.error("Python packaging failed:", error.message);
  process.exitCode = 1;
});
build.on("exit", (code) => {
  process.exitCode = code === null ? 1 : code;
});
