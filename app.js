const SHIFT_RULES = {
  E: { label: "Evening", time: "2:30 PM – 10:30 PM", hours: 8 },
  N: { label: "Night", time: "10:30 PM – 6:30 AM", hours: 8 }
};

const state = {
  labels: [],
  shifts: []
};

const imageInput = document.getElementById("imageInput");
const startDateInput = document.getElementById("startDate");
const hourlyRateInput = document.getElementById("hourlyRate");
const ocrStatus = document.getElementById("ocrStatus");
const detectedLabels = document.getElementById("detectedLabels");
const scheduleBody = document.getElementById("scheduleBody");
const totalShifts = document.getElementById("totalShifts");
const totalHours = document.getElementById("totalHours");
const totalPay = document.getElementById("totalPay");

imageInput.addEventListener("change", handleImageUpload);
startDateInput.addEventListener("change", rebuildSchedule);
hourlyRateInput.addEventListener("input", rebuildSchedule);

async function handleImageUpload(event) {
  const [file] = event.target.files;

  if (!file) {
    return;
  }

  ocrStatus.textContent = "Reading image with OCR...";

  try {
    const result = await Tesseract.recognize(file, "eng");
    const text = result.data.text || "";
    state.labels = extractShiftLabels(text);
    detectedLabels.textContent = state.labels.length ? state.labels.join(" ") : "None";
    ocrStatus.textContent = state.labels.length
      ? `Detected ${state.labels.length} shift labels.`
      : "No E/N labels found. Try a clearer image.";
    rebuildSchedule();
  } catch (error) {
    console.error(error);
    ocrStatus.textContent = "OCR failed. Try another image.";
  }
}

function extractShiftLabels(text) {
  return text
    .toUpperCase()
    .replace(/[^A-Z\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token === "E" || token === "N");
}

function rebuildSchedule() {
  const startDateValue = startDateInput.value;
  const hourlyRate = Number(hourlyRateInput.value || 0);

  if (!startDateValue || !state.labels.length) {
    state.shifts = [];
    renderSchedule(hourlyRate);
    return;
  }

  const baseDate = new Date(`${startDateValue}T00:00:00`);

  state.shifts = state.labels.map((label, index) => {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + index);

    const shift = SHIFT_RULES[label];
    const pay = shift.hours * hourlyRate;

    return {
      date: date.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
      }),
      shiftType: shift.label,
      time: shift.time,
      hours: shift.hours,
      pay
    };
  });

  renderSchedule(hourlyRate);
}

function renderSchedule() {
  if (!state.shifts.length) {
    scheduleBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty">Upload an image with E/N labels and choose a start date.</td>
      </tr>
    `;
    updateTotals();
    return;
  }

  scheduleBody.innerHTML = state.shifts
    .map(
      (shift) => `
      <tr>
        <td>${shift.date}</td>
        <td>${shift.shiftType}</td>
        <td>${shift.time}</td>
        <td>${shift.hours}</td>
        <td>$${shift.pay.toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  updateTotals();
}

function updateTotals() {
  const shifts = state.shifts.length;
  const hours = state.shifts.reduce((sum, shift) => sum + shift.hours, 0);
  const pay = state.shifts.reduce((sum, shift) => sum + shift.pay, 0);

  totalShifts.textContent = String(shifts);
  totalHours.textContent = String(hours);
  totalPay.textContent = `$${pay.toFixed(2)}`;
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  });
}
