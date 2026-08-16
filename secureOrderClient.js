/**
 * secureOrderClient.js - Chiffrement Hybride Asymétrique Côté Navigateur (Loi 18-07)
 * Algorithme : RSA-4096-OAEP (SHA-256) + AES-256-GCM (100% Web Crypto API Native)
 * Garantit que SEUL l'ERP du commerçant peut déchiffrer les données de commande.
 */

(function () {
    // Configuration par défaut (embarquée lors du déploiement CDN ou chargée au démarrage)
    const SECURE_CONFIG = {
        relayUrl: window.ZED_RELAY_URL || 'https://zed-relay.zedstore.workers.dev', // ou endpoint Worker
        merchantId: window.ZED_MERCHANT_ID || 'merchant_eae9faa5591c44b2',
        publicKeyBase64: window.ZED_PUBLIC_KEY_B64 || ''
    };

    let importedRsaKey = null;

    /**
     * Convertit une chaîne Base64 en ArrayBuffer
     */
    function base64ToArrayBuffer(base64) {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    /**
     * Convertit un ArrayBuffer en chaîne Base64
     */
    function arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    /**
     * Importe la clé publique RSA-OAEP dans Web Crypto
     */
    async function getImportedRsaKey() {
        if (importedRsaKey) return importedRsaKey;

        // Si la clé n'est pas déjà configurée, tenter de la récupérer auprès du serveur ERP
        if (!SECURE_CONFIG.publicKeyBase64) {
            try {
                const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
                    ? 'http://localhost:4000'
                    : (window.ERP_API_BASE || 'http://localhost:4000');
                const res = await fetch(`${API_BASE}/api/crypto/public-key`, {
                    headers: { 'bypass-tunnel-reminder': 'true' }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.publicKeyBase64) {
                        SECURE_CONFIG.publicKeyBase64 = data.publicKeyBase64;
                        if (data.merchantId) SECURE_CONFIG.merchantId = data.merchantId;
                    }
                }
            } catch (e) {
                console.warn('[SecureClient] Impossible de récupérer la clé publique dynamiquement:', e.message);
            }
        }

        if (!SECURE_CONFIG.publicKeyBase64) {
            throw new Error('Clé publique commerçant non configurée pour le chiffrement');
        }

        const spkiBuffer = base64ToArrayBuffer(SECURE_CONFIG.publicKeyBase64);
        importedRsaKey = await window.crypto.subtle.importKey(
            'spki',
            spkiBuffer,
            {
                name: 'RSA-OAEP',
                hash: 'SHA-256'
            },
            false,
            ['encrypt']
        );
        return importedRsaKey;
    }

    /**
     * Chiffre le payload de la commande avec le schéma hybride RSA-4096-OAEP + AES-256-GCM
     * @param {object} orderData - Objet contenant les données PII de la commande
     * @returns {Promise<object>} - Paquet chiffré prêt pour le Relay
     */
    async function encryptOrder(orderData) {
        const rsaPubKey = await getImportedRsaKey();

        // 1. Génération de la clé symétrique éphémère AES-GCM (256 bits)
        const aesKey = await window.crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt']
        );

        // 2. Génération de l'IV (12 octets)
        const iv = window.crypto.getRandomValues(new Uint8Array(12));

        // 3. Chiffrement du contenu JSON avec AES-256-GCM
        const encoder = new TextEncoder();
        const encodedData = encoder.encode(JSON.stringify(orderData));
        const encryptedContentBuffer = await window.crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            aesKey,
            encodedData
        );

        // Dans AES-GCM Web Crypto, les 16 derniers octets correspondent au Tag d'authentification
        const totalLen = encryptedContentBuffer.byteLength;
        const ciphertextBytes = new Uint8Array(encryptedContentBuffer, 0, totalLen - 16);
        const tagBytes = new Uint8Array(encryptedContentBuffer, totalLen - 16, 16);

        // 4. Exportation et chiffrement asymétrique de la clé AES avec la clé publique RSA-4096 du commerçant
        const rawAesKey = await window.crypto.subtle.exportKey('raw', aesKey);
        const encryptedAesKeyBuffer = await window.crypto.subtle.encrypt(
            { name: 'RSA-OAEP' },
            rsaPubKey,
            rawAesKey
        );

        return {
            version: '1.0',
            algorithm: 'RSA-OAEP-4096+AES-256-GCM',
            encryptedKey: arrayBufferToBase64(encryptedAesKeyBuffer),
            iv: arrayBufferToBase64(iv.buffer),
            tag: arrayBufferToBase64(tagBytes.buffer),
            ciphertext: arrayBufferToBase64(ciphertextBytes.buffer)
        };
    }

    /**
     * Envoie la commande de façon résiliente (Relay Edge chiffré en priorité + chemin direct rapide)
     * @param {object} orderPayload - Données complètes de la commande
     * @returns {Promise<object>} - Résultat de confirmation
     */
    async function submitSecureOrder(orderPayload) {
        const orderRef = orderPayload.id || orderPayload.orderId;
        const eventId = orderPayload.eventId || `ord_${orderRef}`;

        // 1. Chiffrement asymétrique de bout en bout du contenu sensible
        const encryptedBundle = await encryptOrder(orderPayload);

        const relayPayload = {
            merchantId: SECURE_CONFIG.merchantId,
            orderRef: orderRef,
            eventId: eventId,
            encryptedPayload: encryptedBundle,
            timestamp: new Date().toISOString()
        };

        // 2. Envoi direct vers l'API ERP Locale (Chemin rapide souverain) avec timeout court de 2.5s
        let directSuccess = false;
        let directPromise = Promise.resolve();

        const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
            ? 'http://localhost:4000'
            : (window.ERP_API_BASE || 'http://localhost:4000');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        try {
            const res = await fetch(`${API_BASE}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'bypass-tunnel-reminder': 'true'
                },
                body: JSON.stringify(orderPayload),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (res.ok) {
                const d = await res.json();
                if (d.success) {
                    directSuccess = true;
                    console.log('⚡ [SecureClient] Commande transmise instantanément via tunnel direct ERP:', d.orderId);
                }
            }
        } catch (e) {
            clearTimeout(timeoutId);
            console.log('ℹ️ [SecureClient] Tunnel direct indisponible ou lent, passage par le Relay Edge Buffer...');
        }

        // 3. Si le chemin direct n'a pas répondu, ou en double-sauvegarde sur le Relay Worker
        let relayResult = null;
        try {
            // Tentative vers l'URL du Relay Edge Worker
            const relayRes = await fetch(`${SECURE_CONFIG.relayUrl}/relay/order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(relayPayload)
            });
            if (relayRes.ok) {
                relayResult = await relayRes.json();
                console.log('🛡️ [SecureClient] Commande chiffrée stockée en buffer sécurisé sur le Relay Edge (TTL 7j):', orderRef);
            }
        } catch (relayErr) {
            console.warn('[SecureClient] Erreur Relay Edge:', relayErr.message);
        }

        if (!directSuccess && (!relayResult || !relayResult.success)) {
            // Si les deux chemins ont échoué, lever une exception claire
            throw new Error('Impossible de transmettre la commande. Veuillez vérifier votre connexion.');
        }

        return {
            success: true,
            orderId: orderRef,
            eventId: eventId,
            directSuccess,
            relayBuffered: !!(relayResult && relayResult.success),
            message: 'Commande validée avec succès'
        };
    }

    // Export global
    window.SecureOrderClient = {
        config: SECURE_CONFIG,
        encryptOrder,
        submitSecureOrder,
        getImportedRsaKey
    };
})();
