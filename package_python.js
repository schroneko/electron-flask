const path = require("path");
const { spawn, spawnSync } = require("child_process");

const fontCache = path.join(__dirname, "build", "font-cache");
const cacheBuild = spawnSync("python", [path.join(__dirname, "scripts", "build_font_cache.py"), fontCache], { stdio: "inherit" });
if (cacheBuild.error || cacheBuild.status !== 0) {
  console.error("Bundled plotting-font cache generation failed.", cacheBuild.error || "");
  process.exit(1);
}

const build = spawn("pyinstaller", [
  process.platform === "win32" ? "--windowed" : "--console",
  "--onefile",
  "--runtime-hook", path.join(__dirname, "scripts", "packaged_matplotlib.py"),
  "--add-data", `${fontCache}${path.delimiter}font-cache`,
  "--add-data", `web_app/app/templates${path.delimiter}templates`,
  "--add-data", `web_app/app/static${path.delimiter}static`,
  "--collect-all", "mne",
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
