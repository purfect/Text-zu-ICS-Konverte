const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const handlers = {};
const context = {
  browser: { runtime: { onMessage: { addListener(listener) { handlers.message = listener; } } } },
  document: { addEventListener() {}, elementFromPoint() { return null; } },
  window: {
    getSelection() { return { toString() { return ""; } }; },
    location: { href: "https://example.invalid/page" },
    alert() {}
  },
  console
};
vm.createContext(context);
vm.runInContext(fs.readFileSync("content.js", "utf8"), context);

const ranged = context.parseDateRange("Release 10.09.2026 09:30 - 11:00");
assert.equal(ranged.start.getFullYear(), 2026);
assert.equal(ranged.start.getMonth(), 8);
assert.equal(ranged.start.getDate(), 10);
assert.equal(ranged.start.getHours(), 9);
assert.equal(ranged.start.getMinutes(), 30);
assert.equal(ranged.end.getHours(), 11);
assert.equal(ranged.end.getMinutes(), 0);

const defaultDuration = context.parseDateRange("10.09.2026 14:00");
assert.equal(defaultDuration.end - defaultDuration.start, 60 * 60 * 1000);

const headerDate = context.parseDateRange("Montag 07.09. 20:00 - 22:00 CMCC Release");
assert.equal(headerDate.start.getFullYear(), new Date().getFullYear());
assert.equal(headerDate.start.getMonth(), 8);
assert.equal(headerDate.start.getDate(), 7);
assert.equal(headerDate.start.getHours(), 20);
assert.equal(headerDate.end.getHours(), 22);

const invalid = context.parseDateRange("31.02.2026 10:00");
assert.equal(invalid, null);

const headers = [
  { cells: [{ innerText: "" }, { innerText: "Montag 07.09." }] },
  { cells: [{ textContent: "" }, { textContent: "Montag 07.09." }] }
];
const table = { querySelectorAll(selector) { return selector === "thead tr" ? headers : []; } };
assert.equal(context.dateFromTableColumn(table, 1), "Montag 07.09.");

console.log("content parser tests passed");
