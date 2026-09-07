let lastContext = { cell: null, target: null, selectionText: "", clientX: 0 };

document.addEventListener("contextmenu", (event) => {
  lastContext = {
    cell: event.target.closest("td, th"),
    target: event.target,
    selectionText: window.getSelection()?.toString().trim() || "",
    clientX: event.clientX
  };
}, true);

browser.runtime.onMessage.addListener((message) => {
  if (message.type === "show-error") {
    window.alert(message.text);
    return null;
  }
  if (message.type !== "get-calendar-context") {
    return null;
  }
  const selectionText = message.selectionText || lastContext.selectionText;
  return calendarContext(lastContext.cell, lastContext.target, selectionText, lastContext.clientX);
});

function calendarContext(cell, target, selectionText, clientX) {
  const entry = (selectionText || "").trim() || clean(target?.innerText);
  const row = cell?.closest("tr");
  const dateText = dateFromTableColumn(cell?.closest("table"), cell?.cellIndex) || findDateInColumn(clientX, target?.getBoundingClientRect().top);
  const date = parseDateRange(`${dateText} 09:00`)?.start;
  return {
    entry,
    date: date ? date.toISOString().slice(0, 10) : "",
    category: clean(row?.cells[0]?.innerText),
    source: window.location.href
  };
}

function buildEvent(cell, target, selectionText, clientX) {
  const tableEvent = cell ? eventFromScheduleCell(cell, target, selectionText) : null;
  const layoutEvent = eventFromScheduleLayout(selectionText, target, clientX);
  return tableEvent || layoutEvent || eventFromText(selectionText);
}

function eventFromScheduleCell(cell, target, selectionText) {
  const row = cell.closest("tr");
  const table = cell.closest("table");
  const dateText = dateFromTableColumn(table, cell.cellIndex);
  const entry = clean(selectionText) || clickedEntryText(target, cell);
  if (!row || !dateText || !entry) {
    return null;
  }

  const category = clean(row.cells[0]?.innerText);
  return eventFromScheduleEntry(dateText, entry, category, row);
}

function eventFromScheduleLayout(selectionText, target, clientX) {
  const entry = clean(selectionText) || clean(target?.innerText);
  const dateText = findDateInColumn(clientX, target?.getBoundingClientRect().top);
  return dateText && entry ? eventFromScheduleEntry(dateText, entry, "", null) : null;
}

function eventFromScheduleEntry(dateText, entry, category, row) {
  const times = parseDateRange(`${dateText} ${entry}`);
  const subject = clean(entry.replace(/^[★⭐]\s*/, "").replace(/^\d{1,2}[:.]\d{2}\s*(?:-|–|bis)\s*\d{1,2}[:.]\d{2}\s*/, "").replace(/^\d{1,2}[:.]\d{2}\s*/, ""));
  const body = category ? `${entry}\n\nBereich: ${category}` : entry;
  return times ? createEvent(subject || "Termin", times, category, body, row) : null;
}

function dateFromTableColumn(table, columnIndex) {
  if (!table || !Number.isInteger(columnIndex)) {
    return "";
  }

  const datePattern = /\b\d{1,2}[.]\d{1,2}[.]?(?:\d{2,4})?\b/;
  for (const headerRow of table.querySelectorAll("thead tr")) {
    const header = headerRow.cells[columnIndex];
    const text = clean(header?.innerText || header?.textContent);
    if (datePattern.test(text)) {
      return text;
    }
  }
  return "";
}

function findDateInColumn(clientX, targetTop) {
  if (!Number.isFinite(clientX) || !Number.isFinite(targetTop)) {
    return "";
  }

  const datePattern = /\b(?:montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag)?\s*\d{1,2}[.]\d{1,2}[.]?(?:\d{2,4})?\b/i;
  for (let y = Math.max(0, Math.floor(targetTop) - 1); y >= 0; y -= 4) {
    let element = document.elementFromPoint(clientX, y);
    while (element) {
      const date = clean(element.innerText || element.textContent).match(datePattern)?.[0];
      if (date) {
        return date;
      }
      element = element.parentElement;
    }
  }
  return "";
}

function clickedEntryText(target, cell) {
  const entry = target.closest("a, p, li");
  if (entry && cell.contains(entry)) {
    return clean(entry.innerText);
  }
  const targetText = clean(target.innerText);
  return targetText && targetText !== clean(cell.innerText) ? targetText : "";
}

function eventFromText(text) {
  const cleaned = clean(text);
  const times = parseDateRange(cleaned);
  if (!times) {
    return null;
  }

  const firstDate = cleaned.search(/\b\d{1,2}[.\-/]\d{1,2}[.\-/]\d{2,4}\b/);
  const title = clean(firstDate > 0 ? cleaned.slice(0, firstDate) : cleaned.split(/\r?\n/)[0]) || "Termin";
  return createEvent(title, times, "", cleaned, null);
}

function createEvent(subject, times, eventLocation, body, row) {
  const source = row ? `\n\nQuelle: ${window.location.href}` : "";
  return {
    subject: subject.slice(0, 255),
    start: times.start,
    end: times.end,
    location: eventLocation.slice(0, 255),
    body: `${body}${source}`.trim()
  };
}

function parseDateRange(text) {
  const dateMatch = text.match(/\b(\d{1,2})[.\-/](\d{1,2})(?:[.\-/](\d{2,4}))?\.?/);
  if (!dateMatch) {
    return null;
  }

  const [, dayText, monthText, yearText] = dateMatch;
  const year = yearText ? (yearText.length === 2 ? 2000 + Number(yearText) : Number(yearText)) : new Date().getFullYear();
  const day = Number(dayText);
  const month = Number(monthText) - 1;
  const textWithoutDate = text.slice(0, dateMatch.index) + text.slice(dateMatch.index + dateMatch[0].length);
  const times = [...textWithoutDate.matchAll(/\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/g)];
  const startHour = times.length ? Number(times[0][1]) : 9;
  const startMinute = times.length ? Number(times[0][2]) : 0;
  const start = new Date(year, month, day, startHour, startMinute);
  if (start.getFullYear() !== year || start.getMonth() !== month || start.getDate() !== day) {
    return null;
  }

  const end = new Date(start);
  if (times.length > 1) {
    end.setHours(Number(times[1][1]), Number(times[1][2]), 0, 0);
    if (end <= start) {
      end.setDate(end.getDate() + 1);
    }
  } else {
    end.setHours(end.getHours() + 1);
  }
  return { start, end };
}

function clean(value) {
  return (value || "").replace(/\s+/g, " ").trim();
}
