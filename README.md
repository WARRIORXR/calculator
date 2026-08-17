# 🧮 CalcSuite

> **A premium, all-in-one calculator suite — Standard, Scientific & Programmer Calculators + 14-category Unit Converter**

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-Vercel-6c63ff?style=for-the-badge)](https://calculator-alpha-two-64.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-f857a6?style=for-the-badge)](LICENSE)
[![HTML](https://img.shields.io/badge/HTML5-43e97b?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS](https://img.shields.io/badge/CSS3-4facfe?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-fdcb6e?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

## ✨ Features

### 🔢 Standard Calculator
- Full arithmetic operations: `+` `−` `×` `÷`
- Advanced functions: `√`, `x²`, `%`, `sin`, `cos`, `tan`
- **Keyboard support** — type numbers and operators naturally
- Live expression preview with calculation history
- Flash animation on result, smooth micro-animations
- Error handling for invalid inputs

### 🔬 Scientific Calculator
- **Angle mode toggle** — DEG / RAD
- **Trigonometry** — sin, cos, tan + inverse (sin⁻¹, cos⁻¹, tan⁻¹)
- **Hyperbolic functions** — sinh, cosh, tanh
- **Logarithms** — log (base 10), ln, log₂
- **Exponentials** — eˣ, 10ˣ
- **Powers & roots** — √x, ∛x, x², x³, xʸ
- **Constants** — π (Pi), e (Euler's number), φ (Golden Ratio)
- **Factorial** — n! (up to 170!)
- **Other functions** — |x| (absolute), 1/x (reciprocal), +/− (negate), % (percent)
- **Memory** — M+, M−, MR, MC with visual indicator
- **Parentheses** — full `(` `)` support with nesting
- **Scientific notation** — EXP input for very large/small numbers

### 💻 Programmer Calculator
- **Multi-base display** — HEX, DEC, OCT, BIN all live-updating simultaneously
- **Click to switch base** — tap any base row to make it the active input mode
- **Word size selector** — 8-bit (BYTE), 16-bit (WORD), 32-bit (DWORD), 64-bit (QWORD)
- **Interactive bit grid** — visual bit-level representation; click any bit to toggle it
- **Bitwise operations** — AND, OR, XOR, NOT
- **Shift operations** — LSH (left shift), RSH (right shift)
- **Arithmetic** — MOD, negate (+/−), FLIP (byte-reverse / endian swap)
- **Hex digit buttons** — A–F (enabled only when in HEX mode)
- Full 64-bit integer support via BigInt

### 🔄 Unit Converter
**14 categories** with 100+ units:

| Category | Units |
|----------|-------|
| 📏 Length | Meter, Kilometer, Mile, Foot, Inch, Light Year & more |
| ⚖️ Weight | Kilogram, Pound, Ounce, Stone, Metric Ton & more |
| 🌡️ Temperature | Celsius, Fahrenheit, Kelvin |
| 📐 Area | Square Meter, Hectare, Acre, Square Mile & more |
| 🧪 Volume | Liter, Gallon, Fluid Ounce, Cubic Meter & more |
| ⚡ Speed | m/s, km/h, mph, Knot, Mach & more |
| ⏱️ Time | Second, Minute, Hour, Day, Week, Year, Decade & more |
| 💨 Pressure | Pascal, Bar, PSI, Atmosphere, Torr & more |
| ⚡ Energy | Joule, Calorie, BTU, Watt-hour & more |
| 🔌 Power | Watt, Kilowatt, Horsepower & more |
| 💾 Data | Bit, Byte, KB, MB, GB, TB, PB |
| 📐 Angle | Degree, Radian, Gradian, Arcminute & more |
| 〰️ Frequency | Hz, kHz, MHz, GHz, RPM |
| ⛽ Fuel Economy | km/L, L/100km, mpg (US/UK) |

### 🎨 Design
- **Glassmorphism UI** with animated background orbs
- **Dark mode** by default with vibrant gradient accents
- **Smooth animations** and hover micro-effects
- **Fully responsive** — works great on mobile & desktop
- Inter font for premium typography
- **4-tab navigation** — seamless switching between all modes

---

## 🚀 Live Demo

**[👉 Open CalcSuite](https://calculator-alpha-two-64.vercel.app/)**

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **HTML5** | Semantic structure & accessibility |
| **CSS3** | Glassmorphism, animations, responsive layout |
| **JavaScript (ES6+)** | Calculator logic, BigInt for 64-bit programmer mode |
| **Font Awesome 6** | UI icons |
| **Google Fonts (Inter)** | Premium typography |

> **Zero dependencies. No build step.** Just open `index.html` in any modern browser.

---

## 📁 Project Structure

```
calculator/
├── index.html      # Main HTML — all 4 tabs (Standard, Scientific, Programmer, Converter)
├── style.css       # All styles — glassmorphism, animations, responsive layout
├── script.js       # Calculator logic (Standard + Scientific + Programmer) + Unit converter
├── README.md       # This file
├── LICENSE         # MIT License
└── .gitignore      # Git ignore rules
```

---

## 🛠️ Getting Started

No build tools needed! Just open `index.html` in any modern browser.

```bash
# Clone the repo
git clone https://github.com/WARRIORXR/calculator.git

# Open in browser
cd calculator
start index.html   # Windows
open index.html    # macOS
```

---

## ⌨️ Keyboard Shortcuts (Standard Calculator)

| Key | Action |
|-----|--------|
| `0-9` | Input digit |
| `+` `-` `*` `/` | Arithmetic operators |
| `.` | Decimal point |
| `Enter` or `=` | Calculate result |
| `Backspace` | Delete last digit |
| `Escape` | Clear all (AC) |
| `%` | Percent |

---

## 🔬 Scientific Calculator — Quick Reference

| Button | Function |
|--------|----------|
| DEG / RAD | Toggle angle mode |
| sin, cos, tan | Trigonometric functions |
| sin⁻¹, cos⁻¹, tan⁻¹ | Inverse trig |
| sinh, cosh, tanh | Hyperbolic functions |
| log, ln, log₂ | Logarithms (base 10, natural, base 2) |
| eˣ, 10ˣ | Exponential functions |
| √x, ∛x | Square root, cube root |
| x², x³, xʸ | Powers |
| n! | Factorial |
| \|x\| | Absolute value |
| 1/x | Reciprocal |
| π, e, φ | Math constants |
| M+, M−, MR, MC | Memory operations |
| ( ) | Parentheses |
| EXP | Scientific notation input |

---

## 💻 Programmer Calculator — Quick Reference

| Button | Function |
|--------|----------|
| HEX / DEC / OCT / BIN | Switch number base |
| 64-bit / 32-bit / 16-bit / 8-bit | Set word size |
| AND, OR, XOR, NOT | Bitwise operations |
| LSH, RSH | Left / right bit shift |
| MOD | Modulo (remainder) |
| FLIP | Byte-reverse (endian swap) |
| A–F | Hex digits (HEX mode only) |
| Bit grid | Click individual bits to toggle |

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/WARRIORXR">WARRIORXR</a></p>
  <p>⭐ Star this repo if you find it useful!</p>
</div>
