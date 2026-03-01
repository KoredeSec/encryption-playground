# 🔐 Tory's Encryption Playground

An interactive, browser-based tool for exploring encryption algorithms with real-time, step-by-step visualization. No dependencies, no build tools — just pure HTML, CSS, and JavaScript powered by the Web Crypto API.

I built this out of boredom while studying — wanted a hands-on way to understand how different encryption algorithms actually work under the hood.

🌐 **[Live Demo → encryption-playground-ebon.vercel.app](https://encryption-playground-ebon.vercel.app/)**

---

## ✨ Features

- **6 Algorithms** — Caesar Cipher, Vigenère Cipher, ROT13, Base64, AES-256-GCM, and SHA-256
- **Real-Time Visualization** — Watch each character transform step-by-step as the algorithm runs
- **Encrypt & Decrypt** — Toggle between modes instantly (except SHA-256, which is one-way)
- **AES-256-GCM** — Military-grade encryption using the native Web Crypto API with PBKDF2 key derivation
- **Zero Dependencies** — Runs entirely in the browser with no frameworks or libraries
- **Responsive Design** — Dark neon glassmorphism theme that looks great on any screen size

---

## 🧬 Supported Algorithms

| Algorithm | Type | Key Required | Reversible |
|-----------|------|:------------:|:----------:|
| **Caesar Cipher** | Substitution | Shift (1–25) | ✅ |
| **Vigenère Cipher** | Polyalphabetic | Keyword | ✅ |
| **ROT13** | Substitution | None (fixed shift 13) | ✅ |
| **Base64** | Encoding | None | ✅ |
| **AES-256-GCM** | Symmetric Encryption | Password | ✅ |
| **SHA-256** | Cryptographic Hash | None | ❌ |

---

## 🚀 Getting Started

### Run Locally

No build step needed. Just open the file in your browser:

```bash
git clone https://github.com/KoredeSec/encryption-playground.git
cd encryption-playground
```

Then open `index.html` in your browser, or use a local server:

```bash
# Python
python3 -m http.server 8080

# Node.js (npx)
npx serve .
```

### Deploy to Vercel

The project is deployed on [Vercel](https://vercel.com) with Web Analytics enabled for traffic monitoring. Simply push to `main` and Vercel handles the rest.

---

## 📁 Project Structure

```
encryption-playground/
├── index.html      # App shell, layout, and Vercel Analytics script
├── style.css       # Full design system — dark neon glassmorphism theme
├── crypto.js       # CryptoEngine module — all encryption/decryption logic
├── app.js          # Application logic — UI state, events, visualization
├── LICENSE         # MIT License
└── .gitignore
```

---

## 🛠️ Tech Stack

- **HTML5 / CSS3 / Vanilla JavaScript** — Zero-dependency frontend
- **Web Crypto API** — Native browser crypto for AES-256-GCM and SHA-256
- **PBKDF2** — Key derivation with 100,000 iterations and SHA-256
- **Vercel** — Hosting and Web Analytics
- **Google Fonts** — Inter & JetBrains Mono

---

## 📄 License

MIT © [Ibrahim Yusuf](https://github.com/KoredeSec)
