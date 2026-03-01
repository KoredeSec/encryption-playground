// ============================================================
// Tory's Encryption Playground — Application Logic
// ============================================================

(() => {
    'use strict';

    // ── State ──────────────────────────────────────────────────

    const state = {
        algorithm: 'caesar',
        mode: 'encrypt', // 'encrypt' or 'decrypt'
    };

    // ── Algorithm Metadata ─────────────────────────────────────

    const algoMeta = {
        caesar: {
            name: 'Caesar Cipher',
            desc: 'One of the oldest known ciphers, used by Julius Caesar. Each letter is shifted by a fixed number of positions in the alphabet.',
            hasKey: false,
            hasShift: true,
            hashOnly: false,
        },
        vigenere: {
            name: 'Vigenère Cipher',
            desc: 'A polyalphabetic substitution cipher that uses a keyword to shift each letter by a different amount. Much stronger than Caesar.',
            hasKey: true,
            hasShift: false,
            hashOnly: false,
        },
        rot13: {
            name: 'ROT13',
            desc: 'A special case of the Caesar cipher with a fixed shift of 13. Since 13 is half of 26, encrypting and decrypting are the same operation.',
            hasKey: false,
            hasShift: false,
            hashOnly: false,
        },
        base64: {
            name: 'Base64 Encoding',
            desc: 'An encoding scheme that converts binary data into ASCII text using 64 characters. Commonly used for data transport, not true encryption.',
            hasKey: false,
            hasShift: false,
            hashOnly: false,
        },
        aes: {
            name: 'AES-256-GCM',
            desc: 'The Advanced Encryption Standard with 256-bit keys and Galois/Counter Mode. Military-grade encryption used worldwide.',
            hasKey: false,
            hasShift: false,
            hasPassword: true,
            hashOnly: false,
        },
        sha256: {
            name: 'SHA-256 Hash',
            desc: 'A one-way cryptographic hash function that produces a fixed 256-bit digest. Used for data integrity, passwords, and blockchain.',
            hasKey: false,
            hasShift: false,
            hashOnly: true,
        },
    };

    // ── DOM Elements ───────────────────────────────────────────

    const $ = id => document.getElementById(id);

    const inputText = $('inputText');
    const outputText = $('outputText');
    const vizContainer = $('vizContainer');
    const shiftSlider = $('shiftSlider');
    const shiftDisplay = $('shiftDisplay');
    const vigenereKey = $('vigenereKey');
    const aesPassword = $('aesPassword');
    const copyBtn = $('copyBtn');
    const copyLabel = $('copyLabel');
    const copyIcon = $('copyIcon');
    const btnEncrypt = $('btnEncrypt');
    const btnDecrypt = $('btnDecrypt');
    const algoInfoTitle = $('algoInfoTitle');
    const algoInfoDesc = $('algoInfoDesc');

    const caesarControls = $('caesarControls');
    const vigenereControls = $('vigenereControls');
    const aesControls = $('aesControls');

    // ── Algorithm Tab Selection ────────────────────────────────

    document.querySelectorAll('.algo-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.algo-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            state.algorithm = tab.dataset.algo;
            updateUI();
            process();
        });
    });

    // ── Mode Toggle ────────────────────────────────────────────

    btnEncrypt.addEventListener('click', () => {
        state.mode = 'encrypt';
        btnEncrypt.classList.add('active');
        btnDecrypt.classList.remove('active');
        btnEncrypt.classList.remove('hash-only');
        btnDecrypt.classList.remove('hash-only');
        process();
    });

    btnDecrypt.addEventListener('click', () => {
        if (algoMeta[state.algorithm].hashOnly) return;
        state.mode = 'decrypt';
        btnDecrypt.classList.add('active');
        btnEncrypt.classList.remove('active');
        process();
    });

    // ── Input Events ───────────────────────────────────────────

    let debounceTimer;
    function debounceProcess() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(process, 150);
    }

    inputText.addEventListener('input', debounceProcess);
    shiftSlider.addEventListener('input', () => {
        shiftDisplay.textContent = shiftSlider.value;
        debounceProcess();
    });
    vigenereKey.addEventListener('input', debounceProcess);
    aesPassword.addEventListener('input', debounceProcess);

    // ── Copy to Clipboard ─────────────────────────────────────

    copyBtn.addEventListener('click', async () => {
        const text = outputText.value;
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            copyIcon.textContent = '✅';
            copyLabel.textContent = 'Copied!';
            copyBtn.classList.add('copied');
            setTimeout(() => {
                copyIcon.textContent = '📋';
                copyLabel.textContent = 'Copy';
                copyBtn.classList.remove('copied');
            }, 2000);
        } catch (e) {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            copyLabel.textContent = 'Copied!';
            setTimeout(() => { copyLabel.textContent = 'Copy'; }, 2000);
        }
    });

    // ── UI Update ──────────────────────────────────────────────

    function updateUI() {
        const meta = algoMeta[state.algorithm];

        // Show/hide controls
        caesarControls.style.display = meta.hasShift ? '' : 'none';
        vigenereControls.style.display = meta.hasKey ? '' : 'none';
        aesControls.style.display = meta.hasPassword ? '' : 'none';

        // Handle hash-only mode
        if (meta.hashOnly) {
            state.mode = 'encrypt';
            btnEncrypt.classList.add('active');
            btnDecrypt.classList.remove('active');
            btnEncrypt.textContent = '🧬 Hash';
            btnDecrypt.classList.add('hash-only');
            btnDecrypt.textContent = '🚫 N/A';
        } else {
            btnEncrypt.textContent = '🔒 Encrypt';
            btnDecrypt.textContent = '🔓 Decrypt';
            btnDecrypt.classList.remove('hash-only');
            if (state.mode === 'encrypt') {
                btnEncrypt.classList.add('active');
                btnDecrypt.classList.remove('active');
            } else {
                btnDecrypt.classList.add('active');
                btnEncrypt.classList.remove('active');
            }
        }

        // Update info
        algoInfoTitle.textContent = meta.name;
        algoInfoDesc.textContent = meta.desc;

        // Update placeholders
        if (state.mode === 'decrypt') {
            inputText.placeholder = 'Paste ciphertext to decrypt...';
        } else {
            inputText.placeholder = 'Type or paste your text here...';
        }
    }

    // ── Process ────────────────────────────────────────────────

    async function process() {
        const text = inputText.value;

        if (!text) {
            outputText.value = '';
            renderViz([]);
            return;
        }

        let result;

        try {
            switch (state.algorithm) {
                case 'caesar': {
                    const shift = parseInt(shiftSlider.value);
                    result = state.mode === 'encrypt'
                        ? CryptoEngine.caesarEncrypt(text, shift)
                        : CryptoEngine.caesarDecrypt(text, shift);
                    break;
                }
                case 'vigenere': {
                    const key = vigenereKey.value;
                    result = state.mode === 'encrypt'
                        ? CryptoEngine.vigenereEncrypt(text, key)
                        : CryptoEngine.vigenereDecrypt(text, key);
                    break;
                }
                case 'rot13':
                    result = CryptoEngine.rot13(text);
                    break;
                case 'base64':
                    result = state.mode === 'encrypt'
                        ? CryptoEngine.base64Encode(text)
                        : CryptoEngine.base64Decode(text);
                    break;
                case 'aes': {
                    const pw = aesPassword.value;
                    result = state.mode === 'encrypt'
                        ? await CryptoEngine.aesEncrypt(text, pw)
                        : await CryptoEngine.aesDecrypt(text, pw);
                    break;
                }
                case 'sha256':
                    result = await CryptoEngine.sha256Hash(text);
                    break;
                default:
                    result = { result: text, steps: [] };
            }
        } catch (e) {
            result = { result: `⚠ Error: ${e.message}`, steps: [] };
        }

        outputText.value = result.result;
        renderViz(result.steps || []);
    }

    // ── Visualization Renderer ────────────────────────────────

    function renderViz(steps) {
        if (!steps || steps.length === 0) {
            vizContainer.innerHTML = '<div class="viz-empty">Type something to see how the algorithm transforms your data</div>';
            return;
        }

        // Limit displayed steps for performance
        const maxSteps = 100;
        const displaySteps = steps.slice(0, maxSteps);

        const hasCharData = displaySteps[0] && displaySteps[0].original !== undefined;

        let html = '<div class="viz-steps">';

        displaySteps.forEach((step, i) => {
            const delay = Math.min(i * 30, 1000);

            if (hasCharData && step.original !== undefined) {
                html += `
          <div class="viz-step" style="animation-delay: ${delay}ms">
            <span class="step-index">${i + 1}</span>
            <span class="step-chars">
              <span class="step-char original">${escapeHtml(step.original)}</span>
              <span class="step-arrow">→</span>
              <span class="step-char transformed">${escapeHtml(step.transformed)}</span>
            </span>
            <span class="step-detail">${escapeHtml(step.detail)}</span>
          </div>`;
            } else {
                html += `
          <div class="viz-step" style="animation-delay: ${delay}ms">
            <span class="step-index">${i + 1}</span>
            <span class="step-detail" style="flex:1">${escapeHtml(step.detail)}</span>
          </div>`;
            }
        });

        if (steps.length > maxSteps) {
            html += `<div class="viz-step"><span class="step-detail" style="color:var(--accent-orange)">… and ${steps.length - maxSteps} more steps</span></div>`;
        }

        html += '</div>';
        vizContainer.innerHTML = html;
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ── Init ───────────────────────────────────────────────────

    updateUI();

})();
