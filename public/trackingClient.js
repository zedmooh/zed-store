/**
 * trackingClient.js - Moteur de Tracking Client Multi-Pixel Dynamique
 * Gère l'injection conditionnelle des pixels et la génération des event_id uniques pour la déduplication CAPI
 */
(function() {
    window.ZedTracker = {
        config: null,
        initialized: false,

        /**
         * Initialise les pixels configurés côté commerçant
         * @param {object} trackingConfig - Objet tracking issu de /api/config
         */
        init: function(trackingConfig) {
            if (!trackingConfig || this.initialized) return;
            this.config = trackingConfig;
            this.initialized = true;

            // 1. Meta Pixel
            if (this.config.meta && this.config.meta.enabled && this.config.meta.pixelId) {
                this._initMeta(this.config.meta.pixelId);
            }

            // 2. TikTok Pixel
            if (this.config.tiktok && this.config.tiktok.enabled && this.config.tiktok.pixelId) {
                this._initTikTok(this.config.tiktok.pixelId);
            }

            // 3. Google GA4 / GTM
            if (this.config.google && this.config.google.enabled) {
                if (this.config.google.ga4MeasurementId) {
                    this._initGoogle(this.config.google.ga4MeasurementId);
                }
                if (this.config.google.gtmContainerId) {
                    this._initGTM(this.config.google.gtmContainerId);
                }
            }

            // 4. Snapchat Pixel
            if (this.config.snapchat && this.config.snapchat.enabled && this.config.snapchat.pixelId) {
                this._initSnapchat(this.config.snapchat.pixelId);
            }

            // 5. Pinterest Tag
            if (this.config.pinterest && this.config.pinterest.enabled && this.config.pinterest.tagId) {
                this._initPinterest(this.config.pinterest.tagId);
            }

            // Track automatique du PageView initial avec déduplication
            this.track('PageView', { page_title: document.title, page_location: window.location.href });
        },

        /**
         * Génère un identifiant d'événement unique partagé pour la déduplication CAPI
         */
        generateEventId: function(prefix) {
            return (prefix || 'evt') + '_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        },

        /**
         * Déclenche un événement sur l'ensemble des pixels activés
         * @param {string} eventName - 'PageView' | 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'Purchase'
         * @param {object} data - Données associées (value, currency, content_name, etc.)
         * @param {string} customEventId - Optionnel, identifiant de déduplication
         * @returns {string} - L'eventId utilisé
         */
        track: function(eventName, data, customEventId) {
            const eventId = customEventId || this.generateEventId(eventName.toLowerCase());
            const params = data || {};
            params.currency = params.currency || 'DZD';

            // Meta Pixel (fbq)
            if (window.fbq && this.config?.meta?.enabled) {
                try {
                    window.fbq('track', eventName, params, { eventID: eventId });
                } catch (e) {
                    console.warn('[ZedTracker] Meta track error:', e);
                }
            }

            // TikTok Pixel (ttq)
            if (window.ttq && this.config?.tiktok?.enabled) {
                try {
                    const ttMap = {
                        'Purchase': 'CompletePayment',
                        'InitiateCheckout': 'InitiateCheckout',
                        'AddToCart': 'AddToCart',
                        'ViewContent': 'ViewContent',
                        'PageView': 'Pageview'
                    };
                    const ttEvt = ttMap[eventName] || eventName;
                    window.ttq.track(ttEvt, {
                        content_name: params.content_name || params.productTitle,
                        value: params.value || params.totalPrice,
                        currency: params.currency
                    }, { event_id: eventId });
                } catch (e) {
                    console.warn('[ZedTracker] TikTok track error:', e);
                }
            }

            // Google GA4 (gtag)
            if (window.gtag && this.config?.google?.enabled) {
                try {
                    const gMap = {
                        'Purchase': 'purchase',
                        'InitiateCheckout': 'begin_checkout',
                        'AddToCart': 'add_to_cart',
                        'ViewContent': 'view_item',
                        'PageView': 'page_view'
                    };
                    const gEvt = gMap[eventName] || eventName.toLowerCase();
                    window.gtag('event', gEvt, {
                        transaction_id: eventId,
                        value: params.value || params.totalPrice,
                        currency: params.currency,
                        items: params.items || []
                    });
                } catch (e) {
                    console.warn('[ZedTracker] GA4 track error:', e);
                }
            }

            // Snapchat Pixel (snaptr)
            if (window.snaptr && this.config?.snapchat?.enabled) {
                try {
                    const sMap = {
                        'Purchase': 'PURCHASE',
                        'InitiateCheckout': 'START_CHECKOUT',
                        'AddToCart': 'ADD_CART',
                        'ViewContent': 'VIEW_CONTENT',
                        'PageView': 'PAGE_VIEW'
                    };
                    window.snaptr('track', sMap[eventName] || 'CUSTOM_EVENT', {
                        price: params.value || params.totalPrice,
                        currency: params.currency,
                        event_tag: eventId
                    });
                } catch (e) {
                    console.warn('[ZedTracker] Snapchat track error:', e);
                }
            }

            // Pinterest Tag (pintrk)
            if (window.pintrk && this.config?.pinterest?.enabled) {
                try {
                    const pMap = {
                        'Purchase': 'checkout',
                        'InitiateCheckout': 'lead',
                        'AddToCart': 'add_to_cart',
                        'ViewContent': 'page_visit',
                        'PageView': 'page_visit'
                    };
                    window.pintrk('track', pMap[eventName] || 'custom', {
                        value: params.value || params.totalPrice,
                        currency: params.currency,
                        event_id: eventId
                    });
                } catch (e) {
                    console.warn('[ZedTracker] Pinterest track error:', e);
                }
            }

            return eventId;
        },

        // --- Injection dynamique des scripts SDK des plateformes ---

        _initMeta: function(pixelId) {
            if (window.fbq) return;
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            window.fbq('init', pixelId);
        },

        _initTikTok: function(pixelId) {
            if (window.ttq) return;
            !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
                var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var a=d.createElement("script");a.type="text/javascript",a.async=!0,a.src=r+"?sdkid="+e+"&lib="+t;var c=d.getElementsByTagName("script")[0];c.parentNode.insertBefore(a,c)};
                ttq.load(pixelId);
                ttq.page();
            }(window, document, 'ttq');
        },

        _initGoogle: function(measurementId) {
            if (window.gtag) return;
            const script = document.createElement('script');
            script.async = true;
            script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
            document.head.appendChild(script);

            window.dataLayer = window.dataLayer || [];
            function gtag(){ window.dataLayer.push(arguments); }
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', measurementId, { send_page_view: false });
        },

        _initGTM: function(containerId) {
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer',containerId);
        },

        _initSnapchat: function(pixelId) {
            if (window.snaptr) return;
            (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
            {a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
            a.queue=[];var s='script';var r=t.createElement(s);r.async=!0;
            r.src=n;var u=t.getElementsByTagName(s)[0];
            u.parentNode.insertBefore(r,u);})(window,document,
            'https://sc-static.net/scevent.min.js');
            window.snaptr('init', pixelId);
        },

        _initPinterest: function(tagId) {
            if (window.pintrk) return;
            !function(e){if(!window.pintrk){window.pintrk = function () {
            window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var
            n=window.pintrk;n.queue=[],n.version="3.0";var
            t=document.createElement("script");t.async=!0,t.src=e;var
            r=document.getElementsByTagName("script")[0];
            r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
            window.pintrk('load', tagId);
            window.pintrk('page');
        }
    };

    // Auto-initialisation au chargement de la page si config présente
    document.addEventListener('DOMContentLoaded', function() {
        // Tente de récupérer la config via l'API ERP locale ou globale
        const API_BASE = window.location.origin.includes(':') ? window.location.origin : 'http://localhost:4000';
        fetch(API_BASE + '/api/config')
            .then(res => res.json())
            .then(cfg => {
                if (cfg && cfg.tracking) {
                    window.ZedTracker.init(cfg.tracking);
                }
            })
            .catch(function() {});
    });
})();
