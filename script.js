/* ============================================================
   CalcSuite — script.js
   Standard + Scientific + Programmer Calculators + Unit Converter
   ============================================================ */

/* ===== TAB SWITCHING ===== */
function switchTab(tab) {
  document.querySelectorAll('.app-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
  document.getElementById('tab-' + tab).classList.add('active');
  document.getElementById('panel-' + tab).classList.remove('hidden');
  if (tab === 'prog') renderProgCalc();
}

/* ============================================================
   STANDARD CALCULATOR
   ============================================================ */
let calcState = {
  expression: '',
  display: '0',
  justEvaled: false
};

function calcInput(val) {
  const s = calcState;
  const ops = ['+', '-', '*', '/'];
  if (s.justEvaled) {
    if (!ops.includes(val)) { s.expression = ''; s.display = '0'; }
    s.justEvaled = false;
  }
  if (ops.includes(val)) {
    if (s.expression && ops.includes(s.expression.slice(-1))) s.expression = s.expression.slice(0, -1);
    if (!s.expression || ops.includes(s.expression.slice(-1))) s.expression += (s.display === '0' ? '0' : s.display);
    s.expression += val;
    s.display = '0';
  } else if (val === '.') {
    if (!s.display.includes('.')) s.display += '.';
  } else {
    if (s.display === '0') s.display = val;
    else s.display += val;
  }
  renderCalc();
}

function calcFn(fn) {
  const s = calcState;
  let num = parseFloat(s.display);
  if (fn === 'clear') {
    s.expression = ''; s.display = '0'; s.justEvaled = false;
    document.getElementById('calcHistory').textContent = '';
    renderCalc(); return;
  }
  if (fn === 'backspace') {
    if (s.justEvaled) { s.expression = ''; s.display = '0'; s.justEvaled = false; }
    else if (s.display.length > 1) s.display = s.display.slice(0, -1);
    else s.display = '0';
    renderCalc(); return;
  }
  if (fn === 'percent') { s.display = String(parseFloat((num / 100).toPrecision(12))); renderCalc(); return; }
  if (fn === 'sqrt') {
    if (num < 0) { s.display = 'Error'; renderCalc(); return; }
    const res = Math.sqrt(num);
    document.getElementById('calcHistory').textContent = `\u221a(${num}) = ${formatCalcNum(res)}`;
    s.expression = ''; s.display = String(parseFloat(res.toPrecision(12))); s.justEvaled = true;
    renderCalc(); return;
  }
  if (fn === 'square') {
    const res = num * num;
    document.getElementById('calcHistory').textContent = `(${num})\u00b2 = ${formatCalcNum(res)}`;
    s.expression = ''; s.display = String(parseFloat(res.toPrecision(12))); s.justEvaled = true;
    renderCalc(); return;
  }
  if (fn === 'sin') { calcTrig('sin', num); return; }
  if (fn === 'cos') { calcTrig('cos', num); return; }
  if (fn === 'tan') { calcTrig('tan', num); return; }
  if (fn === 'equals') {
    const ops = ['+', '-', '*', '/'];
    let expr = s.expression;
    if (!ops.includes(expr.slice(-1))) {
      expr += (s.display !== '0' || !s.expression) ? (s.expression ? '' : s.display) : '';
    } else { expr += s.display; }
    if (!expr) expr = s.display;
    try {
      const raw = new Function('return ' + expr)();
      const result = parseFloat(raw.toPrecision(12));
      document.getElementById('calcHistory').textContent = `${expr} = ${formatCalcNum(result)}`;
      s.expression = '';
      s.display = isFinite(result) ? String(result) : 'Error';
      s.justEvaled = true;
    } catch { s.display = 'Error'; }
    renderCalc();
  }
}

function calcTrig(fn, deg) {
  const s = calcState;
  const rad = deg * Math.PI / 180;
  const map = { sin: Math.sin, cos: Math.cos, tan: Math.tan };
  let res = map[fn](rad);
  if (Math.abs(res) < 1e-10) res = 0;
  res = parseFloat(res.toPrecision(10));
  document.getElementById('calcHistory').textContent = `${fn}(${deg}\u00b0) = ${formatCalcNum(res)}`;
  s.expression = ''; s.display = String(res); s.justEvaled = true;
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
  const ops = { '+': '+', '-': '\u2212', '*': '\u00d7', '/': '\u00f7' };
  const prettyExpr = s.expression.replace(/[+\-*/]/g, m => ` ${ops[m] || m} `);
  exprEl.textContent = prettyExpr || '\u00a0';
  resEl.textContent = s.display === 'Error' ? 'Error' : formatCalcNum(parseFloat(s.display)) || s.display;
  resEl.className = 'calc-result' + (s.display.length > 10 ? ' small' : '');
  if (s.justEvaled) {
    resEl.classList.add('flash');
    setTimeout(() => resEl.classList.remove('flash'), 300);
  }
}

// Keyboard for standard calc
document.addEventListener('keydown', e => {
  const activeTab = document.querySelector('.app-tab.active')?.id;
  if (activeTab === 'tab-calc') {
    if ('0123456789'.includes(e.key)) { calcInput(e.key); return; }
    if (['+', '-', '*', '/'].includes(e.key)) { calcInput(e.key); return; }
    if (e.key === '.') { calcInput('.'); return; }
    if (e.key === 'Enter' || e.key === '=') { calcFn('equals'); return; }
    if (e.key === 'Backspace') { calcFn('backspace'); return; }
    if (e.key === 'Escape') { calcFn('clear'); return; }
    if (e.key === '%') { calcFn('percent'); return; }
  }
});

/* ============================================================
   SCIENTIFIC CALCULATOR
   ============================================================ */
let sciState = {
  expression: '',    // raw expression string
  display: '0',
  justEvaled: false,
  angleMode: 'deg', // 'deg' or 'rad'
  memory: 0,
  hasMemory: false,
  openParens: 0
};

function setAngleMode(mode) {
  sciState.angleMode = mode;
  document.getElementById('degBtn').classList.toggle('active', mode === 'deg');
  document.getElementById('radBtn').classList.toggle('active', mode === 'rad');
}

function sciMemory(action) {
  const s = sciState;
  const val = parseFloat(s.display) || 0;
  if (action === 'mc') { s.memory = 0; s.hasMemory = false; }
  else if (action === 'mr') {
    s.display = String(s.memory); s.justEvaled = true;
  }
  else if (action === 'mplus') { s.memory += val; s.hasMemory = true; }
  else if (action === 'mminus') { s.memory -= val; s.hasMemory = true; }
  const ind = document.getElementById('memIndicator');
  ind.style.display = s.hasMemory ? 'inline-block' : 'none';
  renderSci();
}

function sciInput(val) {
  const s = sciState;
  const ops = ['+', '-', '*', '/', '^'];

  if (s.justEvaled) {
    if (!ops.includes(val) && val !== '(' && val !== ')') { s.expression = ''; s.display = '0'; }
    else if (ops.includes(val)) { s.expression = s.display; s.display = '0'; }
    s.justEvaled = false;
  }

  if (val === '(') {
    s.expression += '(';
    s.openParens++;
    s.display = '0';
  } else if (val === ')') {
    if (s.openParens > 0) {
      if (!ops.includes(s.expression.slice(-1))) s.expression += s.display;
      s.expression += ')';
      s.openParens--;
      s.display = '0';
    }
  } else if (val === '^') {
    if (!ops.includes(s.expression.slice(-1))) s.expression += s.display;
    s.expression += '**';
    s.display = '0';
  } else if (ops.includes(val)) {
    const lastIsOp = s.expression && ops.map(o => o === '^' ? '**' : o).some(o => s.expression.endsWith(o));
    if (!lastIsOp) s.expression += s.display;
    else s.expression = s.expression.slice(0, -1);
    s.expression += val;
    s.display = '0';
  } else if (val === 'E') {
    // Scientific notation input
    if (!s.display.includes('e')) s.display += 'e+';
  } else if (val === '.') {
    if (!s.display.includes('.')) s.display += '.';
  } else {
    if (s.display === '0') s.display = val;
    else s.display += val;
  }
  renderSci();
}

function sciFn(fn) {
  const s = sciState;
  const num = parseFloat(s.display);
  const toRad = (x) => s.angleMode === 'deg' ? x * Math.PI / 180 : x;
  const fromRad = (x) => s.angleMode === 'deg' ? x * 180 / Math.PI : x;

  const pushHistory = (label, result) => {
    document.getElementById('sciHistory').textContent = `${label} = ${formatSciNum(result)}`;
    s.expression = ''; s.display = isFinite(result) ? String(parseFloat(result.toPrecision(12))) : 'Error';
    s.justEvaled = true; renderSci();
  };

  if (fn === 'clear') {
    s.expression = ''; s.display = '0'; s.justEvaled = false; s.openParens = 0;
    document.getElementById('sciHistory').textContent = '';
    renderSci(); return;
  }
  if (fn === 'backspace') {
    if (s.justEvaled) { s.expression = ''; s.display = '0'; s.justEvaled = false; }
    else if (s.display.length > 1) s.display = s.display.slice(0, -1);
    else s.display = '0';
    renderSci(); return;
  }
  if (fn === 'negate') { s.display = String(-num); renderSci(); return; }
  if (fn === 'percent') { s.display = String(parseFloat((num / 100).toPrecision(12))); renderSci(); return; }

  // Constants
  if (fn === 'pi') { s.display = String(Math.PI); s.justEvaled = true; renderSci(); return; }
  if (fn === 'e_const') { s.display = String(Math.E); s.justEvaled = true; renderSci(); return; }
  if (fn === 'phi') { s.display = String((1 + Math.sqrt(5)) / 2); s.justEvaled = true; renderSci(); return; }

  // Single-arg functions
  if (fn === 'sqrt') { if (num < 0) { s.display = 'Error'; renderSci(); return; } pushHistory(`\u221a(${num})`, Math.sqrt(num)); return; }
  if (fn === 'cbrt') { pushHistory(`\u221b(${num})`, Math.cbrt(num)); return; }
  if (fn === 'square') { pushHistory(`(${num})\u00b2`, num * num); return; }
  if (fn === 'cube') { pushHistory(`(${num})\u00b3`, num ** 3); return; }
  if (fn === 'reciprocal') { if (num === 0) { s.display = 'Error'; renderSci(); return; } pushHistory(`1/(${num})`, 1 / num); return; }
  if (fn === 'log') { if (num <= 0) { s.display = 'Error'; renderSci(); return; } pushHistory(`log(${num})`, Math.log10(num)); return; }
  if (fn === 'ln') { if (num <= 0) { s.display = 'Error'; renderSci(); return; } pushHistory(`ln(${num})`, Math.log(num)); return; }
  if (fn === 'log2') { if (num <= 0) { s.display = 'Error'; renderSci(); return; } pushHistory(`log\u2082(${num})`, Math.log2(num)); return; }
  if (fn === 'exp') { pushHistory(`e^(${num})`, Math.exp(num)); return; }
  if (fn === 'pow10') { pushHistory(`10^(${num})`, Math.pow(10, num)); return; }
  if (fn === 'abs') { pushHistory(`|${num}|`, Math.abs(num)); return; }
  if (fn === 'factorial') {
    if (num < 0 || !Number.isInteger(num) || num > 170) { s.display = 'Error'; renderSci(); return; }
    let result = 1;
    for (let i = 2; i <= num; i++) result *= i;
    pushHistory(`${num}!`, result); return;
  }

  // Trig
  if (fn === 'sin') { let r = Math.sin(toRad(num)); if (Math.abs(r) < 1e-10) r = 0; pushHistory(`sin(${num}${s.angleMode === 'deg' ? '\u00b0' : 'rad'})`, r); return; }
  if (fn === 'cos') { let r = Math.cos(toRad(num)); if (Math.abs(r) < 1e-10) r = 0; pushHistory(`cos(${num}${s.angleMode === 'deg' ? '\u00b0' : 'rad'})`, r); return; }
  if (fn === 'tan') {
    const a = toRad(num) % Math.PI;
    if (Math.abs(a - Math.PI / 2) < 1e-10) { s.display = 'Error'; renderSci(); return; }
    let r = Math.tan(toRad(num)); if (Math.abs(r) < 1e-10) r = 0;
    pushHistory(`tan(${num}${s.angleMode === 'deg' ? '\u00b0' : 'rad'})`, r); return;
  }
  if (fn === 'asin') { if (num < -1 || num > 1) { s.display = 'Error'; renderSci(); return; } pushHistory(`sin\u207b\u00b9(${num})`, fromRad(Math.asin(num))); return; }
  if (fn === 'acos') { if (num < -1 || num > 1) { s.display = 'Error'; renderSci(); return; } pushHistory(`cos\u207b\u00b9(${num})`, fromRad(Math.acos(num))); return; }
  if (fn === 'atan') { pushHistory(`tan\u207b\u00b9(${num})`, fromRad(Math.atan(num))); return; }

  // Hyperbolic
  if (fn === 'sinh') { pushHistory(`sinh(${num})`, Math.sinh(num)); return; }
  if (fn === 'cosh') { pushHistory(`cosh(${num})`, Math.cosh(num)); return; }
  if (fn === 'tanh') { pushHistory(`tanh(${num})`, Math.tanh(num)); return; }

  if (fn === 'equals') {
    let expr = s.expression;
    // Close any open parens
    for (let i = 0; i < s.openParens; i++) expr += ')';
    const lastIsOp = expr && ['+', '-', '*', '/', '**'].some(o => expr.endsWith(o));
    if (!lastIsOp) expr += s.display;
    if (!expr) expr = s.display;
    try {
      const result = new Function('return ' + expr)();
      const final = parseFloat(Number(result).toPrecision(12));
      document.getElementById('sciHistory').textContent = `${expr} = ${formatSciNum(final)}`;
      s.expression = ''; s.openParens = 0;
      s.display = isFinite(final) ? String(final) : 'Error';
      s.justEvaled = true;
    } catch { s.display = 'Error'; }
    renderSci();
  }
}

function formatSciNum(n) {
  if (!isFinite(n)) return 'Error';
  if (Math.abs(n) >= 1e15 || (Math.abs(n) < 1e-9 && n !== 0)) return n.toExponential(6);
  return parseFloat(n.toPrecision(12)).toLocaleString('en-US', { maximumFractionDigits: 12 });
}

function renderSci() {
  const s = sciState;
  const exprEl = document.getElementById('sciExpression');
  const resEl  = document.getElementById('sciResult');
  const ops = { '+': '+', '-': '\u2212', '*': '\u00d7', '/': '\u00f7', '**': '^' };
  let prettyExpr = s.expression
    .replace(/\*\*/g, '^')
    .replace(/[+\-*/]/g, m => ` ${ops[m] || m} `);
  exprEl.textContent = prettyExpr || '\u00a0';
  const numVal = parseFloat(s.display);
  resEl.textContent = s.display === 'Error' ? 'Error' : (isNaN(numVal) ? s.display : formatSciNum(numVal));
  resEl.className = 'calc-result' + (s.display.length > 12 ? ' small' : '');
  if (s.justEvaled) {
    resEl.classList.add('flash');
    setTimeout(() => resEl.classList.remove('flash'), 300);
  }
}

/* ============================================================
   PROGRAMMER CALCULATOR
   ============================================================ */
let progState = {
  currentBase: 'DEC',
  bitWidth: 'QWORD',   // BYTE=8, WORD=16, DWORD=32, QWORD=64
  value: 0n,           // BigInt
  expression: '',
  pendingOp: null,
  firstOperand: null,
  justEvaled: false,
  startNew: false,     // true after operator is set — next digit starts fresh
  openParens: 0
};

const BIT_WIDTHS = { BYTE: 8, WORD: 16, DWORD: 32, QWORD: 64 };
const BIT_MASKS = {
  BYTE: (1n << 8n) - 1n,
  WORD: (1n << 16n) - 1n,
  DWORD: (1n << 32n) - 1n,
  QWORD: (1n << 64n) - 1n
};

function setProgBase(base) {
  progState.currentBase = base;
  document.querySelectorAll('.base-row').forEach(r => r.classList.remove('active'));
  document.getElementById('base-row-' + base).classList.add('active');
  updateHexButtons();
  renderProgCalc();
}

function setBitWidth(width) {
  progState.bitWidth = width;
  progState.value &= BIT_MASKS[width];
  document.querySelectorAll('.bit-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('bw-' + width).classList.add('active');
  renderProgCalc();
}

function updateHexButtons() {
  const base = progState.currentBase;
  const hexDigits = ['A', 'B', 'C', 'D', 'E', 'F'];
  hexDigits.forEach(d => {
    const btn = document.getElementById('prog-' + d);
    if (btn) btn.disabled = (base !== 'HEX');
  });
  // 8 and 9 only valid in DEC and OCT
  const dotBtn = document.getElementById('prog-dot');
  if (dotBtn) dotBtn.disabled = (base !== 'DEC');
}

function clampBigInt(val, width) {
  const mask = BIT_MASKS[width];
  return ((val % (mask + 1n)) + (mask + 1n)) % (mask + 1n);
}

function progInput(val) {
  const s = progState;
  const base = s.currentBase;
  const baseMap = { HEX: 16, DEC: 10, OCT: 8, BIN: 2 };

  // Validate digit for current base
  const validHex = '0123456789ABCDEF';
  const validMap = { HEX: validHex, DEC: '0123456789', OCT: '01234567', BIN: '01' };
  if (!'+-*/'.includes(val) && val !== '.' && !validMap[base].includes(val.toUpperCase())) return;

  if (val === '.' && base !== 'DEC') return;

  if (s.justEvaled) {
    s.value = 0n; s.expression = '';
    s.justEvaled = false; s.startNew = false;
  }

  if (!'+-*/'.includes(val)) {
    // digit input — build a string, then parse to BigInt
    let current;
    if (s.startNew) {
      // Fresh input after an operator
      current = val.toUpperCase();
      s.startNew = false;
    } else {
      current = s.value.toString(baseMap[base]).toUpperCase();
      if (current === '0') current = val.toUpperCase();
      else current += val.toUpperCase();
    }
    const parsed = parseInt(current, baseMap[base]);
    if (isNaN(parsed)) return;
    try { s.value = BigInt(parsed); } catch { return; }
  } else {
    if (s.pendingOp) progApplyOp();
    s.firstOperand = s.value;
    s.pendingOp = val;
    s.startNew = true;  // next digit input starts a new number
  }
  s.value = clampBigInt(s.value, s.bitWidth);
  renderProgCalc();
}

function progApplyOp() {
  const s = progState;
  if (s.pendingOp === null || s.firstOperand === null) return;
  try {
    switch (s.pendingOp) {
      case '+': s.value = s.firstOperand + s.value; break;
      case '-': s.value = s.firstOperand - s.value; break;
      case '*': s.value = s.firstOperand * s.value; break;
      case '/': s.value = s.value !== 0n ? s.firstOperand / s.value : 0n; break;
      case 'AND': s.value = s.firstOperand & s.value; break;
      case 'OR': s.value = s.firstOperand | s.value; break;
      case 'XOR': s.value = s.firstOperand ^ s.value; break;
      case 'LSHIFT': s.value = s.firstOperand << s.value; break;
      case 'RSHIFT': s.value = s.firstOperand >> s.value; break;
      case 'MOD': s.value = s.value !== 0n ? s.firstOperand % s.value : 0n; break;
    }
    s.value = clampBigInt(s.value, s.bitWidth);
  } catch { s.value = 0n; }
  s.pendingOp = null;
  s.firstOperand = null;
}

function progOp(op) {
  const s = progState;
  if (s.justEvaled) s.justEvaled = false;

  if (op === 'NOT') {
    const mask = BIT_MASKS[s.bitWidth];
    s.value = (~s.value) & mask;
    document.getElementById('progHistory').textContent = `NOT = ${s.value.toString()}`;
    renderProgCalc(); return;
  }
  if (s.pendingOp && !s.startNew) progApplyOp();
  s.firstOperand = s.value;
  s.pendingOp = op;
  s.startNew = true;  // next digit starts a new number
  renderProgCalc();
}

function progFn(fn) {
  const s = progState;
  if (fn === 'clear') {
    s.value = 0n; s.pendingOp = null; s.firstOperand = null;
    s.justEvaled = false; s.startNew = false; s.expression = '';
    document.getElementById('progHistory').textContent = '';
    renderProgCalc(); return;
  }
  if (fn === 'backspace') {
    if (s.justEvaled || s.startNew) { s.value = 0n; s.justEvaled = false; s.startNew = false; }
    else {
      const base = { HEX: 16, DEC: 10, OCT: 8, BIN: 2 }[s.currentBase];
      let str = s.value.toString(base).toUpperCase();
      str = str.slice(0, -1) || '0';
      try { s.value = BigInt(parseInt(str, base)); } catch { s.value = 0n; }
    }
    renderProgCalc(); return;
  }
  if (fn === 'negate') {
    s.value = clampBigInt(-s.value, s.bitWidth);
    renderProgCalc(); return;
  }
  if (fn === 'flip') {
    // Byte-reverse (endian flip)
    const width = BIT_WIDTHS[s.bitWidth];
    const bytes = [];
    let v = s.value;
    for (let i = 0; i < width / 8; i++) { bytes.push(v & 0xFFn); v >>= 8n; }
    bytes.reverse();
    s.value = bytes.reduce((acc, b) => (acc << 8n) | b, 0n);
    renderProgCalc(); return;
  }
  if (fn === 'paren') {
    // Toggle paren
    renderProgCalc(); return;
  }
  if (fn === 'equals') {
    if (s.pendingOp) {
      const opLabel = s.pendingOp;
      const firstVal = s.firstOperand;
      progApplyOp();
      document.getElementById('progHistory').textContent =
        `${firstVal} ${opLabel} ${s.value.toString()}`;
    }
    s.justEvaled = true; s.startNew = false;
    renderProgCalc();
  }
}

function toggleBit(index) {
  const s = progState;
  s.value ^= (1n << BigInt(index));
  s.value = clampBigInt(s.value, s.bitWidth);
  renderProgCalc();
}

function renderProgCalc() {
  const s = progState;
  const v = clampBigInt(s.value, s.bitWidth);

  // Multi-base display
  document.getElementById('hexValue').textContent = v.toString(16).toUpperCase() || '0';
  document.getElementById('decValue').textContent = v.toString(10);
  document.getElementById('octValue').textContent = v.toString(8);
  document.getElementById('binValue').textContent = v.toString(2);

  // Bit grid
  const grid = document.getElementById('bitGrid');
  const bits = BIT_WIDTHS[s.bitWidth];
  const binStr = v.toString(2).padStart(bits, '0');
  grid.innerHTML = '';
  grid.style.gridTemplateColumns = `repeat(${Math.min(bits, 16)}, 1fr)`;

  for (let i = bits - 1; i >= 0; i--) {
    const bitVal = binStr[bits - 1 - i] === '1';
    const cell = document.createElement('button');
    cell.className = 'bit-cell' + (bitVal ? ' bit-on' : '');
    cell.textContent = bitVal ? '1' : '0';
    cell.title = `Bit ${i}`;
    cell.onclick = () => toggleBit(i);
    grid.appendChild(cell);
  }

  // Disable unavailable buttons per base
  updateHexButtons();
  const base = s.currentBase;
  const prog8 = document.getElementById('prog-8');
  const prog9 = document.getElementById('prog-9');
  if (prog8) prog8.disabled = (base === 'BIN');
  if (prog9) prog9.disabled = (base === 'BIN' || base === 'OCT' ? base === 'BIN' : false);
}

/* ============================================================
   UNIT CONVERTER
   ============================================================ */
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
  if (n === null || isNaN(n)) return "\u2014";
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
    outEl.textContent = "\u2014";
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
  fmEl.textContent = from === to ? "Same unit \u2014 no conversion needed" : `Converting ${fromLabel} \u2192 ${toLabel}`;
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
  if (outVal !== "\u2014") document.getElementById("inputValue").value = parseFloat(outVal.replace(/,/g,"")) || "";
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
  document.getElementById("outputValue").textContent = "\u2014";
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

// Init programmer calculator
renderProgCalc();
updateHexButtons();
