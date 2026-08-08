/* ============================================================
   CalcSuite — script.js
   Standard Calculator + Unit Converter logic
   ============================================================ */

/* ===== TAB SWITCHING ===== */
function switchTab(tab) {
  document.querySelectorAll('.app-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
  document.getElementById('tab-' + tab).classList.add('active');
  document.getElementById('panel-' + tab).classList.remove('hidden');
}

/* ===== STANDARD CALCULATOR ===== */
let calcState = {
  expression: '',   // full expression string (e.g. "12+3*")
  display: '0',     // what's shown large on screen
  justEvaled: false // did we just press =?
};

function calcInput(val) {
  const s = calcState;
  const ops = ['+', '-', '*', '/'];

  if (s.justEvaled) {
    // If user types a number after =, start fresh; if operator, chain
    if (!ops.includes(val)) {
      s.expression = '';
      s.display = '0';
    }
    s.justEvaled = false;
  }

  if (ops.includes(val)) {
    // Replace trailing operator if any
    if (s.expression && ops.includes(s.expression.slice(-1))) {
      s.expression = s.expression.slice(0, -1);
    }
    // Append current display to expression if needed
    if (!s.expression || ops.includes(s.expression.slice(-1))) {
      s.expression += (s.display === '0' ? '0' : s.display);
    }
    s.expression += val;
    s.display = '0';
  } else if (val === '.') {
    if (!s.display.includes('.')) s.display += '.';
  } else {
    // digit
    if (s.display === '0') s.display = val;
    else s.display += val;
  }

  renderCalc();
}

function calcFn(fn) {
  const s = calcState;
  let num = parseFloat(s.display);

  if (fn === 'clear') {
    s.expression = '';
    s.display = '0';
    s.justEvaled = false;
    document.getElementById('calcHistory').textContent = '';
    renderCalc();
    return;
  }
  if (fn === 'backspace') {
    if (s.justEvaled) { s.expression = ''; s.display = '0'; s.justEvaled = false; }
    else if (s.display.length > 1) s.display = s.display.slice(0, -1);
    else s.display = '0';
    renderCalc();
    return;
  }
  if (fn === 'percent') {
    s.display = String(parseFloat((num / 100).toPrecision(12)));
    renderCalc();
    return;
  }
  if (fn === 'sqrt') {
    if (num < 0) { s.display = 'Error'; renderCalc(); return; }
    const res = Math.sqrt(num);
    document.getElementById('calcHistory').textContent = `√(${num}) = ${formatCalcNum(res)}`;
    s.expression = '';
    s.display = String(parseFloat(res.toPrecision(12)));
    s.justEvaled = true;
    renderCalc();
    return;
  }
  if (fn === 'square') {
    const res = num * num;
    document.getElementById('calcHistory').textContent = `(${num})² = ${formatCalcNum(res)}`;
    s.expression = '';
    s.display = String(parseFloat(res.toPrecision(12)));
    s.justEvaled = true;
    renderCalc();
    return;
  }
  if (fn === 'sin') { evalTrig('sin', num); return; }
  if (fn === 'cos') { evalTrig('cos', num); return; }
  if (fn === 'tan') { evalTrig('tan', num); return; }
  if (fn === 'equals') {
    // Build full expression
    let ops = ['+', '-', '*', '/'];
    let expr = s.expression;
    if (!ops.includes(expr.slice(-1))) {
      // expression already complete or empty
      expr += (s.display !== '0' || !s.expression) ? (s.expression ? '' : s.display) : '';
    } else {
      expr += s.display;
    }
    if (!expr) { expr = s.display; }
    try {
      // safe eval using Function
      const raw = new Function('return ' + expr)();
      const result = parseFloat(raw.toPrecision(12));
      document.getElementById('calcHistory').textContent = `${expr} = ${formatCalcNum(result)}`;
      s.expression = '';
      s.display = isFinite(result) ? String(result) : 'Error';
      s.justEvaled = true;
    } catch {
      s.display = 'Error';
    }
    renderCalc();
  }
}

function evalTrig(fn, deg) {
  const s = calcState;
  const rad = deg * Math.PI / 180;
  const map = { sin: Math.sin, cos: Math.cos, tan: Math.tan };
  let res = map[fn](rad);
  // Round near-zero
  if (Math.abs(res) < 1e-10) res = 0;
  res = parseFloat(res.toPrecision(10));
  document.getElementById('calcHistory').textContent = `${fn}(${deg}°) = ${formatCalcNum(res)}`;
  s.expression = '';
  s.display = String(res);
  s.justEvaled = true;
  renderCalc();
}

function formatCalcNum(n) {
  if (!isFinite(n)) return 'Error';
  if (Math.abs(n) >= 1e12 || (Math.abs(n) < 1e-6 && n !== 0)) return n.toExponential(4);
  return n.toLocaleString('en-US', { maximumFractionDigits: 10 });
}

function renderCalc() {
  const s = calcState;
  const exprEl = document.getElementById('calcExpression');
  const resEl  = document.getElementById('calcResult');

  // Build readable expression preview
  const ops = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  const prettyExpr = s.expression.replace(/[+\-*/]/g, m => ` ${ops[m] || m} `);
  exprEl.textContent = prettyExpr || '\u00a0';

  resEl.textContent = s.display === 'Error' ? 'Error' : formatCalcNum(parseFloat(s.display)) || s.display;
  resEl.className = 'calc-result' + (s.display.length > 10 ? ' small' : '');
  if (s.justEvaled) {
    resEl.classList.add('flash');
    setTimeout(() => resEl.classList.remove('flash'), 300);
  }
}

// Keyboard support for calculator
document.addEventListener('keydown', e => {
  const panel = document.getElementById('panel-calc');
  if (panel.classList.contains('hidden')) return;
  if ('0123456789'.includes(e.key)) { calcInput(e.key); return; }
  if (['+', '-', '*', '/'].includes(e.key)) { calcInput(e.key); return; }
  if (e.key === '.') { calcInput('.'); return; }
  if (e.key === 'Enter' || e.key === '=') { calcFn('equals'); return; }
  if (e.key === 'Backspace') { calcFn('backspace'); return; }
  if (e.key === 'Escape') { calcFn('clear'); return; }
  if (e.key === '%') { calcFn('percent'); return; }
});

/* ===== UNIT CONVERTER ===== */
const units = {
  Length: {
    icon: "fa-ruler", color: "#6c63ff",
    units: {
      Meter: 1, Kilometer: 1000, Centimeter: 0.01, Millimeter: 0.001,
      Mile: 1609.344, Yard: 0.9144, Foot: 0.3048, Inch: 0.0254,
      Nautical_Mile: 1852, Micrometer: 1e-6, Nanometer: 1e-9, Light_Year: 9.461e15
    }
  },
  Weight: {
    icon: "fa-weight-hanging", color: "#f857a6",
    units: {
      Kilogram: 1, Gram: 0.001, Milligram: 1e-6, Metric_Ton: 1000,
      Pound: 0.453592, Ounce: 0.0283495, Stone: 6.35029,
      US_Ton: 907.185, Imperial_Ton: 1016.05, Microgram: 1e-9
    }
  },
  Temperature: {
    icon: "fa-temperature-half", color: "#ff6b6b",
    units: { Celsius: "C", Fahrenheit: "F", Kelvin: "K" }
  },
  Area: {
    icon: "fa-vector-square", color: "#43e97b",
    units: {
      Square_Meter: 1, Square_Kilometer: 1e6, Square_Mile: 2589988.11,
      Square_Yard: 0.836127, Square_Foot: 0.092903, Square_Inch: 0.00064516,
      Hectare: 10000, Acre: 4046.86, Square_Centimeter: 0.0001
    }
  },
  Volume: {
    icon: "fa-flask", color: "#4facfe",
    units: {
      Liter: 1, Milliliter: 0.001, Cubic_Meter: 1000, Cubic_Foot: 28.3168,
      Cubic_Inch: 0.0163871, US_Gallon: 3.78541, US_Quart: 0.946353,
      US_Pint: 0.473176, US_Cup: 0.24, US_Fluid_Ounce: 0.0295735,
      Imperial_Gallon: 4.54609, Imperial_Pint: 0.568261
    }
  },
  Speed: {
    icon: "fa-gauge-high", color: "#f9ca24",
    units: {
      "m/s": 1, "km/h": 0.277778, "mph": 0.44704,
      Knot: 0.514444, "ft/s": 0.3048, "Mach": 340.29
    }
  },
  Time: {
    icon: "fa-clock", color: "#a29bfe",
    units: {
      Second: 1, Millisecond: 0.001, Microsecond: 1e-6, Nanosecond: 1e-9,
      Minute: 60, Hour: 3600, Day: 86400, Week: 604800,
      Month: 2629800, Year: 31557600, Decade: 315576000
    }
  },
  Pressure: {
    icon: "fa-compress", color: "#fd79a8",
    units: {
      Pascal: 1, Kilopascal: 1000, Megapascal: 1e6, Bar: 100000,
      PSI: 6894.76, Atmosphere: 101325, Torr: 133.322, mmHg: 133.322
    }
  },
  Energy: {
    icon: "fa-bolt", color: "#fdcb6e",
    units: {
      Joule: 1, Kilojoule: 1000, Calorie: 4.184, Kilocalorie: 4184,
      "Watt-hour": 3600, "Kilowatt-hour": 3600000, BTU: 1055.06,
      Electronvolt: 1.60218e-19, Megajoule: 1e6
    }
  },
  Power: {
    icon: "fa-plug-circle-bolt", color: "#00cec9",
    units: {
      Watt: 1, Kilowatt: 1000, Megawatt: 1e6, Gigawatt: 1e9,
      Horsepower: 745.7, BTU_per_hour: 0.293071, Milliwatt: 0.001
    }
  },
  Data: {
    icon: "fa-hard-drive", color: "#74b9ff",
    units: {
      Bit: 0.125, Byte: 1, Kilobyte: 1024, Megabyte: 1048576,
      Gigabyte: 1073741824, Terabyte: 1099511627776,
      Petabyte: 1.126e15, Kibibyte: 1024, Mebibyte: 1048576, Gibibyte: 1073741824
    }
  },
  Angle: {
    icon: "fa-drafting-compass", color: "#e17055",
    units: {
      Degree: 1, Radian: 57.2958, Gradian: 0.9,
      Arcminute: 1/60, Arcsecond: 1/3600, Turn: 360
    }
  },
  Frequency: {
    icon: "fa-wave-square", color: "#55efc4",
    units: {
      Hertz: 1, Kilohertz: 1000, Megahertz: 1e6,
      Gigahertz: 1e9, Terahertz: 1e12, RPM: 1/60
    }
  },
  Fuel_Economy: {
    icon: "fa-gas-pump", color: "#fab1a0",
    units: { "km/L": 1, "L/100km": "special", "mpg(US)": 0.425144, "mpg(UK)": 0.354006 }
  }
};

let activeCategory = "Length";

function convertTemp(value, from, to) {
  let c;
  if (from === "Celsius") c = value;
  else if (from === "Fahrenheit") c = (value - 32) * 5/9;
  else c = value - 273.15;
  if (to === "Celsius") return c;
  if (to === "Fahrenheit") return c * 9/5 + 32;
  return c + 273.15;
}

function convertFuel(value, from, to) {
  let kmL;
  if (from === "km/L") kmL = value;
  else if (from === "L/100km") kmL = 100 / value;
  else if (from === "mpg(US)") kmL = value * 0.425144;
  else kmL = value * 0.354006;
  if (to === "km/L") return kmL;
  if (to === "L/100km") return 100 / kmL;
  if (to === "mpg(US)") return kmL / 0.425144;
  return kmL / 0.354006;
}

function formatNum(n) {
  if (n === null || isNaN(n)) return "—";
  if (Math.abs(n) >= 1e9 || (Math.abs(n) < 1e-4 && n !== 0)) return n.toExponential(4);
  return parseFloat(n.toPrecision(8)).toLocaleString("en-US", { maximumFractionDigits: 8 });
}

function convert() {
  const cat = activeCategory;
  const from = document.getElementById("fromUnit").value;
  const to = document.getElementById("toUnit").value;
  const val = parseFloat(document.getElementById("inputValue").value);
  const outEl = document.getElementById("outputValue");
  const eqEl = document.getElementById("resultEq");
  const fmEl = document.getElementById("resultFormula");

  if (isNaN(val)) {
    outEl.textContent = "—";
    eqEl.textContent = "Enter a value to convert";
    fmEl.textContent = "";
    updateQuickRef(from, to, null);
    return;
  }

  let result;
  if (cat === "Temperature") result = convertTemp(val, from, to);
  else if (cat === "Fuel_Economy") result = convertFuel(val, from, to);
  else result = (val * units[cat].units[from]) / units[cat].units[to];

  const fmtVal = formatNum(val);
  const fmtRes = formatNum(result);
  const fromLabel = from.replace(/_/g, " ");
  const toLabel = to.replace(/_/g, " ");

  outEl.textContent = fmtRes;
  eqEl.innerHTML = `<span style="color:#c4b5fd">${fmtVal} ${fromLabel}</span> = <span style="color:#6ee7b7">${fmtRes} ${toLabel}</span>`;
  fmEl.textContent = from === to ? "Same unit — no conversion needed" : `Converting ${fromLabel} → ${toLabel}`;
  updateQuickRef(from, to, val);
}

function updateQuickRef(from, to, val) {
  const cat = activeCategory;
  const qr = document.getElementById("quickRef");
  const allUnits = Object.keys(units[cat].units);
  if (!val || isNaN(val) || allUnits.length <= 2) { qr.innerHTML = ""; return; }

  const refs = allUnits.filter(u => u !== from).slice(0, 6);
  qr.innerHTML = refs.map(u => {
    let res;
    if (cat === "Temperature") res = convertTemp(val, from, u);
    else if (cat === "Fuel_Economy") res = convertFuel(val, from, u);
    else res = (val * units[cat].units[from]) / units[cat].units[u];
    return `<div class="qr-item">${u.replace(/_/g," ")}<span>${formatNum(res)}</span></div>`;
  }).join("");
}

function swapUnits() {
  const f = document.getElementById("fromUnit");
  const t = document.getElementById("toUnit");
  const outVal = document.getElementById("outputValue").textContent;
  [f.value, t.value] = [t.value, f.value];
  if (outVal !== "—") document.getElementById("inputValue").value = parseFloat(outVal.replace(/,/g,"")) || "";
  convert();
}

function setCategory(cat) {
  activeCategory = cat;
  document.querySelectorAll(".pill").forEach(p => p.classList.toggle("active", p.dataset.cat === cat));

  const data = units[cat];
  document.getElementById("catIcon").innerHTML = `<i class="fa-solid ${data.icon}" style="color:${data.color}"></i>`;
  document.getElementById("catLabel").textContent = cat.replace(/_/g, " ");

  const keys = Object.keys(data.units);
  const fromSel = document.getElementById("fromUnit");
  const toSel = document.getElementById("toUnit");
  fromSel.innerHTML = keys.map(k => `<option value="${k}">${k.replace(/_/g," ")}</option>`).join("");
  toSel.innerHTML = keys.map((k,i) => `<option value="${k}" ${i===1?"selected":""}>${k.replace(/_/g," ")}</option>`).join("");
  document.getElementById("inputValue").value = "";
  document.getElementById("outputValue").textContent = "—";
  document.getElementById("resultEq").textContent = "Enter a value to convert";
  document.getElementById("resultFormula").textContent = "";
  document.getElementById("quickRef").innerHTML = "";
}

// Build pills
const pillsContainer = document.getElementById("categoryPills");
Object.entries(units).forEach(([cat, data]) => {
  const btn = document.createElement("button");
  btn.className = "pill" + (cat === activeCategory ? " active" : "");
  btn.dataset.cat = cat;
  btn.innerHTML = `<i class="fa-solid ${data.icon}"></i> ${cat.replace(/_/g," ")}`;
  btn.onclick = () => { setCategory(cat); scrollActivePillIntoView(); };
  pillsContainer.appendChild(btn);
});

function scrollPills(dir) {
  const scroller = document.getElementById("categoryScroll");
  scroller.scrollBy({ left: dir * 160, behavior: "smooth" });
  setTimeout(updateArrows, 320);
}

function updateArrows() {
  const scroller = document.getElementById("categoryScroll");
  const leftBtn = document.getElementById("scrollLeft");
  const rightBtn = document.getElementById("scrollRight");
  leftBtn.disabled = scroller.scrollLeft <= 4;
  rightBtn.disabled = scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 4;
}

function scrollActivePillIntoView() {
  const active = document.querySelector(".pill.active");
  if (active) active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  setTimeout(updateArrows, 320);
}

document.getElementById("categoryScroll").addEventListener("scroll", updateArrows);
setCategory(activeCategory);
setTimeout(updateArrows, 100);
