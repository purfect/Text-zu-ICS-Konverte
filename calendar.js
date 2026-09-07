const dateInput = document.querySelector("#date");
const subjectInput = document.querySelector("#subject");
const locationInput = document.querySelector("#location");
const startInput = document.querySelector("#start");
const endInput = document.querySelector("#end");
const bodyInput = document.querySelector("#body");
const errorElement = document.querySelector("#error");

const query = new URLSearchParams(location.search);
const entry = clean(query.get("entry"));
const times = [...entry.matchAll(/\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/g)];
dateInput.value = query.get("date") || localDateValue(new Date());
locationInput.value = clean(query.get("category"));
bodyInput.value = "";
subjectInput.value = entry || "Termin";
startInput.value = timeValue(times[0]) || "09:00";
endInput.value = timeValue(times[1]) || addOneHour(startInput.value);

document.querySelector("#export").addEventListener("click", async () => {
  const date = dateInput.value;
  if (!date || !startInput.value || !endInput.value || !subjectInput.value.trim()) {
    errorElement.textContent = "Bitte Betreff, Datum sowie Beginn und Ende angeben.";
    return;
  }

  const [year, month, day] = date.split("-").map(Number);
  const [startHour, startMinute] = startInput.value.split(":").map(Number);
  const [endHour, endMinute] = endInput.value.split(":").map(Number);
  const start = new Date(year, month - 1, day, startHour, startMinute);
  const end = new Date(year, month - 1, day, endHour, endMinute);
  if (end <= start) end.setDate(end.getDate() + 1);
  try {
    await browser.runtime.sendMessage({
      type: "download-ics",
      event: { subject: subjectInput.value.trim(), start: start.toISOString(), end: end.toISOString(), location: locationInput.value.trim(), body: bodyInput.value.trim() }
    });
    errorElement.textContent = "";
  } catch (error) {
    errorElement.textContent = `Export fehlgeschlagen: ${error.message}`;
  }
});

function clean(value) {
  return (value || "").replace(/\s+/g, " ").trim();
}

function timeValue(match) {
  return match ? `${match[1].padStart(2, "0")}:${match[2]}` : "";
}

function addOneHour(value) {
  const [hour, minute] = value.split(":").map(Number);
  return `${String((hour + 1) % 24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function localDateValue(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
