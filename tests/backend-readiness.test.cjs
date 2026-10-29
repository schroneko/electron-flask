const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

test("opens the window after a successful backend response and retries failures", async () => {
  const handlers = {};
  const timers = [];
  const windows = [];
  const responses = [
    () => Promise.resolve({ ok: false, status: 503 }),
    () => Promise.reject(new Error("connection refused")),
    () => Promise.resolve({ ok: true, text: () => Promise.resolve("ready") })
  ];
  const app = { isPackaged: false, on: (event, callback) => { handlers[event] = callback; }, quit() {} };
  class BrowserWindow {
    constructor() { windows.push(this); }
    loadURL(url) { this.url = url; }
    on() {}
  }
  const child = { stderr: { on() {} }, on() {} };
  const context = {
    require(name) {
      if (name === "electron") return { app, BrowserWindow };
      if (name === "child_process") return { spawn: () => child };
      return require(name);
    },
    process: { env: {}, platform: "darwin" },
    __dirname: path.resolve(__dirname, ".."),
    console: { log() {}, error() {} },
    fetch(url) {
      assert.equal(url, "http://localhost:4040/");
      return responses.shift()();
    },
    setTimeout(callback, delay) { timers.push({ callback, delay }); }
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "renderer.js"), "utf8"), context);
  handlers.ready();
  const settle = () => new Promise((resolve) => setImmediate(resolve));
  await settle();
  assert.equal(windows.length, 0);
  assert.equal(timers[0].delay, 200);
  timers.shift().callback();
  await settle();
  assert.equal(windows.length, 0);
  assert.equal(timers[0].delay, 200);
  timers.shift().callback();
  await settle();
  assert.equal(windows.length, 1);
  assert.equal(windows[0].url, "http://localhost:4040/");
  assert.equal(timers.length, 0);
});
