"use strict";

// const {
//   app,
//   BrowserWindow,
//   session
// } = require("electron");

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
// const session = electron.session

// (function () {
//   let childProcess = require("child_process");
//   let oldSpawn = childProcess.spawn;

//   function mySpawn() {
//     console.log('spawn called');
//     console.log("arguments", arguments);
//     let result = oldSpawn.apply(this, arguments);
//     console.log('spawn ended');
//     return result;
//   }
//   childProcess.spawn = mySpawn;
// })();

const path = require("path");
const {
  exec,
  spawn
} = require('child_process');



process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';

process.traceProcessWarnings = true;


// Keep a global reference of the mainWindowdow object, if you don't, the mainWindowdow will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;
let subpy = null;

const PY_DIST_FOLDER = "dist-python"; // python distributable folder
const PY_SRC_FOLDER = "web_app"; // path to the python source
const PY_MODULE = "run_app.py"; // the name of the main module

const getPythonScriptPath = () => {
  if (app.isPackaged) {
    const executable = process.platform === "win32" ? "run_app.exe" : "run_app";
    return path.join(process.resourcesPath, "app", PY_DIST_FOLDER, executable);
  }
  return path.join(__dirname, PY_SRC_FOLDER, PY_MODULE);
};

const startPythonSubprocess = () => {
  const script = getPythonScriptPath();
  subpy = app.isPackaged
    ? spawn(script, [], { cwd: __dirname })
    : spawn("python", [script], { cwd: __dirname });
  subpy.on("error", (error) => {
    console.error("Failed to start the Python backend:", error.message);
    app.quit();
  });
};

const killPythonSubprocesses = (main_pid) => {
  const python_script_name = path.basename(getPythonScriptPath());
  let cleanup_completed = false;
  const psTree = require("ps-tree");
  psTree(main_pid, function (err, children) {
    let python_pids = children
      .filter(function (el) {
        return el.COMMAND == python_script_name;
      })
      .map(function (p) {
        return p.PID;
      });
    // kill all the spawned python processes
    python_pids.forEach(function (pid) {
      process.kill(pid);
    });
    subpy = null;
    cleanup_completed = true;
  });
  return new Promise(function (resolve, reject) {
    (function waitForSubProcessCleanup() {
      if (cleanup_completed) return resolve();
      setTimeout(waitForSubProcessCleanup, 30);
    })();
  });
};

const createMainWindow = () => {
  // Create the browser mainWindow
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    // transparent: true, // transparent header bar
    icon: __dirname + "/icon.png",
    // fullscreen: true,
    // opacity:0.8,
    // darkTheme: true,
    // frame: false,
    resizeable: true,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webSecurity: false,
      allowRunningInsecureContent: true
    }
  });
  // console.log('piyo') -> Problem Nothing

  // Load the index page
  // console.log(mainWindow.loadURL("http://localhost:4040/"))
  mainWindow.loadURL("http://localhost:4040/");

  // console.log("piyo") -> Problem Nothing
  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  // Emitted when the mainWindow is closed.
  mainWindow.on("closed", function () {
    // electron.session.defaultSession.clearCache(() => {})
    // session.defaultSession.clearCache(() => {})
    // Dereference the mainWindow object
    mainWindow = null;
    if (subpy) subpy.kill('SIGINT');
    console.log("closed")
  });
};

// process.on('uncaughtException', function (err) {
//   // app.quit();
//   console.log("uncaughtException:", err);
// });

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on("ready", function () {
app.on("ready", function () {
  // start the backend server
  startPythonSubprocess();
  console.log('ready');

  // console.log("piyo") -> Problem Nothing

  const rq = require('request-promise');
  const startUp = function () {
    rq("http://localhost:4040/")
      .then(function (htmlString) {
        // console.log('server started');
        createMainWindow();
      })
      .catch(function (err) {
        // tmp_error = err;
        // if (err == tmp_error) {
        // console.log('server error: ' + err);
        // }
        setTimeout(startUp, 200);
      });
  };

  startUp();
});

// disable menu
app.on("browser-window-created", function (e, window) {
  window.setMenu(null);
  console.log("browser-window-created")
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // console.log("process.platform", process.platform)
  if (process.platform !== "darwin") {
    let main_process_pid = process.pid;
    killPythonSubprocesses(main_process_pid).then(() => {
      app.quit();
    });
  }
  app.quit();
  console.log('window-all-closed')
});

// app.on("activate", () => {
//   // On macOS it's common to re-create a window in the app when the
//   // dock icon is clicked and there are no other windows open.
//   if (subpy == null) {
//     startPythonSubprocess();
//     console.log('in activate subpy null:')
//   }
//   console.log('in activate subpy not null:')
//   // if (win === null) {
//   //   createMainWindow();
//   // }
//   // startPythonSubprocess();
//   console.log("activate")
// });

app.on("quit", function () {
  // do some additional cleanup
  console.log('quit')
});