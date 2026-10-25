const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
function load(fetch) {
  const events = {},
    timers = [],
    windows = [];
  const app = {
    isPackaged: false,
    on: (n, f) => (events[n] = f),
    quit: () => {},
  };
  class BrowserWindow {
    constructor() {
      windows.push(this);
    }
    loadURL(url) {
      this.url = url;
    }
    on() {}
  }
  const child = { stderr: { on() {} }, on() {}, kill() {} };
  vm.runInNewContext(
    fs.readFileSync(path.join(__dirname, "../renderer.js"), "utf8"),
    {
      require: (n) =>
        n === "electron"
          ? { app, BrowserWindow }
          : n === "child_process"
          ? { spawn: () => child }
          : n === "path"
          ? path
          : require(n),
      __dirname: path.join(__dirname, ".."),
      process: { env: {}, platform: process.platform },
      console: { log() {}, error() {} },
      fetch,
      AbortSignal,
      setTimeout: (f) => timers.push(f),
    }
  );
  return { events, timers, windows };
}
const flush = () => new Promise((r) => setImmediate(r));
test("backend readiness opens window only after successful HTTP response", async () => {
  const seen = [];
  const x = load(async (url, options) => {
    seen.push(url);
    assert(options.signal instanceof AbortSignal);
    return { ok: true, text: async () => "<html>fixture</html>" };
  });
  x.events.ready();
  await flush();
  assert.equal(x.windows.length, 1);
  assert.equal(x.windows[0].url, "http://localhost:4040/");
  assert.deepEqual(seen, ["http://localhost:4040/"]);
  assert.equal(x.timers.length, 0);
});
test("non-success response and network error retain retry behavior", async () => {
  for (const fetch of [
    async () => ({ ok: false, status: 503 }),
    async () => {
      throw Error("not ready");
    },
  ]) {
    const x = load(fetch);
    x.events.ready();
    await flush();
    assert.equal(x.windows.length, 0);
    assert.equal(x.timers.length, 1);
  }
});
