// ============================================================
// Tory's Encryption Playground — Crypto Engine
// Pure encryption/decryption functions with step tracking
// ============================================================

const CryptoEngine = (() => {

    // ── Caesar Cipher ──────────────────────────────────────────

    function caesarEncrypt(text, shift) {
        shift = ((shift % 26) + 26) % 26;
        const steps = [];
        let result = '';

        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            if (/[a-zA-Z]/.test(ch)) {
                const base = ch === ch.toUpperCase() ? 65 : 97;
                const original = ch.charCodeAt(0) - base;
                const shifted = (original + shift) % 26;
                const newChar = String.fromCharCode(shifted + base);
                steps.push({
                    index: i,
                    original: ch,
                    transformed: newChar,
                    detail: `'${ch}' (${original}) + ${shift} = '${newChar}' (${shifted})`
                });
                result += newChar;
            } else {
                steps.push({ index: i, original: ch, transformed: ch, detail: `'${ch}' → unchanged` });
                result += ch;
            }
        }
        return { result, steps };
    }

    function caesarDecrypt(text, shift) {
        return caesarEncrypt(text, 26 - (((shift % 26) + 26) % 26));
    }

    // ── Vigenère Cipher ────────────────────────────────────────

    function vigenereEncrypt(text, key) {
        if (!key) return { result: text, steps: [] };
        key = key.toUpperCase().replace(/[^A-Z]/g, '');
        if (!key.length) return { result: text, steps: [] };

        const steps = [];
        let result = '';
        let ki = 0;

        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            if (/[a-zA-Z]/.test(ch)) {
                const base = ch === ch.toUpperCase() ? 65 : 97;
                const original = ch.charCodeAt(0) - base;
                const keyChar = key[ki % key.length];
                const keyShift = keyChar.charCodeAt(0) - 65;
                const shifted = (original + keyShift) % 26;
                const newChar = String.fromCharCode(shifted + base);
                steps.push({
                    index: i,
                    original: ch,
                    transformed: newChar,
                    keyChar,
                    detail: `'${ch}' + key '${keyChar}' (shift ${keyShift}) = '${newChar}'`
                });
                result += newChar;
                ki++;
            } else {
                steps.push({ index: i, original: ch, transformed: ch, detail: `'${ch}' → unchanged` });
                result += ch;
            }
        }
        return { result, steps };
    }

    function vigenereDecrypt(text, key) {
        if (!key) return { result: text, steps: [] };
        key = key.toUpperCase().replace(/[^A-Z]/g, '');
        if (!key.length) return { result: text, steps: [] };

        const steps = [];
        let result = '';
        let ki = 0;

        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            if (/[a-zA-Z]/.test(ch)) {
                const base = ch === ch.toUpperCase() ? 65 : 97;
                const original = ch.charCodeAt(0) - base;
                const keyChar = key[ki % key.length];
                const keyShift = keyChar.charCodeAt(0) - 65;
                const shifted = ((original - keyShift) + 26) % 26;
                const newChar = String.fromCharCode(shifted + base);
                steps.push({
                    index: i,
                    original: ch,
                    transformed: newChar,
                    keyChar,
                    detail: `'${ch}' - key '${keyChar}' (shift ${keyShift}) = '${newChar}'`
                });
                result += newChar;
                ki++;
            } else {
                steps.push({ index: i, original: ch, transformed: ch, detail: `'${ch}' → unchanged` });
                result += ch;
            }
        }
        return { result, steps };
    }

    // ── ROT13 ──────────────────────────────────────────────────

    function rot13(text) {
        return caesarEncrypt(text, 13);
    }

    // ── Base64 ─────────────────────────────────────────────────

    function base64Encode(text) {
        const steps = [];
        const bytes = new TextEncoder().encode(text);
        const byteStr = Array.from(bytes).map(b => b.toString(2).padStart(8, '0')).join('');

        steps.push({
            detail: `Convert text to bytes: [${Array.from(bytes).join(', ')}]`
        });
        steps.push({
            detail: `Binary: ${byteStr.match(/.{1,8}/g)?.join(' ') || ''}`
        });

        const result = btoa(unescape(encodeURIComponent(text)));

        const chunks = byteStr.match(/.{1,6}/g) || [];
        steps.push({
            detail: `Split into 6-bit groups: ${chunks.join(' ')}`
        });
        steps.push({
            detail: `Encoded: ${result}`
        });

        return { result, steps };
    }

    function base64Decode(text) {
        const steps = [];
        try {
            const result = decodeURIComponent(escape(atob(text)));
            steps.push({ detail: `Decode Base64 → "${result}"` });
            return { result, steps };
        } catch (e) {
            return { result: '⚠ Invalid Base64 input', steps: [{ detail: 'Error: Invalid Base64 string' }] };
        }
    }

    // ── AES-256-GCM (Web Crypto API) ──────────────────────────

    async function deriveKey(password) {
        const enc = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']
        );
        const salt = enc.encode('torys-playground-salt');
        return crypto.subtle.deriveKey(
            { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }

    async function aesEncrypt(text, password) {
        const steps = [];
        if (!password) return { result: '⚠ Password required', steps: [] };

        try {
            steps.push({ detail: 'Deriving 256-bit key via PBKDF2 (100k iterations, SHA-256)' });
            const key = await deriveKey(password);

            const iv = crypto.getRandomValues(new Uint8Array(12));
            steps.push({ detail: `Generated random IV: ${Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('')}` });

            const enc = new TextEncoder();
            const encrypted = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv },
                key,
                enc.encode(text)
            );

            steps.push({ detail: `AES-GCM encryption produced ${encrypted.byteLength} bytes` });

            const combined = new Uint8Array(iv.length + encrypted.byteLength);
            combined.set(iv);
            combined.set(new Uint8Array(encrypted), iv.length);

            const result = btoa(String.fromCharCode(...combined));
            steps.push({ detail: `Result encoded as Base64 (IV prepended)` });

            return { result, steps };
        } catch (e) {
            return { result: '⚠ Encryption failed', steps: [{ detail: `Error: ${e.message}` }] };
        }
    }

    async function aesDecrypt(ciphertext, password) {
        const steps = [];
        if (!password) return { result: '⚠ Password required', steps: [] };

        try {
            steps.push({ detail: 'Decoding Base64 ciphertext' });
            const raw = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));

            const iv = raw.slice(0, 12);
            const data = raw.slice(12);
            steps.push({ detail: `Extracted IV: ${Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('')}` });

            steps.push({ detail: 'Deriving key via PBKDF2 (100k iterations, SHA-256)' });
            const key = await deriveKey(password);

            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv },
                key,
                data
            );

            const result = new TextDecoder().decode(decrypted);
            steps.push({ detail: `Decrypted ${decrypted.byteLength} bytes → plaintext` });

            return { result, steps };
        } catch (e) {
            return { result: '⚠ Decryption failed (wrong password or corrupted data)', steps: [{ detail: `Error: ${e.message}` }] };
        }
    }

    // ── SHA-256 Hash ───────────────────────────────────────────

    async function sha256Hash(text) {
        const steps = [];
        const enc = new TextEncoder();
        const data = enc.encode(text);

        steps.push({ detail: `Input: ${data.length} bytes` });
        steps.push({ detail: 'Processing through SHA-256 (64 rounds of compression)' });

        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const result = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        steps.push({ detail: `Output: 256-bit (32-byte) digest` });
        steps.push({ detail: `Hex: ${result}` });

        return { result, steps };
    }

    // ── Public API ─────────────────────────────────────────────

    return {
        caesarEncrypt, caesarDecrypt,
        vigenereEncrypt, vigenereDecrypt,
        rot13,
        base64Encode, base64Decode,
        aesEncrypt, aesDecrypt,
        sha256Hash
    };

})();
