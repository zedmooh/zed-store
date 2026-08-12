/**
 * Script de gestion dynamique de la Landing Page "YouCan Style" (Algérie - COD)
 * Totalement piloté par JavaScript & produits.json (Aucune donnée produit en dur)
 */

// ====== CONFIGURATION FIREBASE (À REMPLIR) ======
const firebaseConfig = {
  apiKey: "AIzaSyBKVeL5dVEKMlkBZQSR9I17G-qOEVHb-zo",
  authDomain: "zed-store-c5d6c.firebaseapp.com",
  projectId: "zed-store-c5d6c",
  storageBucket: "zed-store-c5d6c.firebasestorage.app",
  messagingSenderId: "605776087819",
  appId: "1:605776087819:web:f4d320c4f9c8dc4825300e",
  measurementId: "G-3N5V8LCB0T"
};

const API_BASE = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ? 'http://localhost:4000'
  : 'https://cloudy-carrying-dist-petroleum.trycloudflare.com';

let db = null;
if (Object.keys(firebaseConfig).length > 0 && firebaseConfig.apiKey) {
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
}
// =================================================

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ====== FONCTIONS DE TRACKING (Pixels) ======
function trackViewContent(product) {
  if (typeof fbq === 'function') {
    fbq('track', 'ViewContent', { content_name: product.title, value: product.price, currency: product.currency || 'DZD' });
  }
  if (typeof ttq === 'function') {
    ttq.track('ViewContent', { contents: [{ content_name: product.title, price: product.price }], value: product.price, currency: product.currency || 'DZD' });
  }
}

function trackInitiateCheckout(product) {
  if (typeof fbq === 'function') {
    fbq('track', 'InitiateCheckout', { content_name: product.title, value: product.price, currency: product.currency || 'DZD' });
  }
  if (typeof ttq === 'function') {
    ttq.track('InitiateCheckout', { contents: [{ content_name: product.title, price: product.price }], value: product.price, currency: product.currency || 'DZD' });
  }
}

function trackPurchase(product, quantity, totalValue) {
  if (typeof fbq === 'function') {
    fbq('track', 'Purchase', { content_name: product.title, value: totalValue, currency: product.currency || 'DZD' });
  }
  if (typeof ttq === 'function') {
    ttq.track('CompletePayment', { contents: [{ content_name: product.title, price: product.price, quantity: quantity }], value: totalValue, currency: product.currency || 'DZD' });
  }
}
// ===========================================

// قائمة الولايات 58 في الجزائر مع أسعار التوصيل (المنزل / المكتب)
const WILAYAS_ALGERIE = [
  { code: '01', name: 'أدرار - Adrar', zone: 'far_south' },
  { code: '02', name: 'الشلف - Chlef', zone: 'north' },
  { code: '03', name: 'الأغواط - Laghouat', zone: 'south' },
  { code: '04', name: 'أم البواقي - Oum El Bouaghi', zone: 'north' },
  { code: '05', name: 'باتنة - Batna', zone: 'north' },
  { code: '06', name: 'بجاية - Béjaïa', zone: 'north' },
  { code: '07', name: 'بسكرة - Biskra', zone: 'south' },
  { code: '08', name: 'بشار - Béchar', zone: 'south' },
  { code: '09', name: 'البليدة - Blida', zone: 'north' },
  { code: '10', name: 'البويرة - Bouira', zone: 'north' },
  { code: '11', name: 'تمنراست - Tamanrasset', zone: 'far_south' },
  { code: '12', name: 'تبسة - Tébessa', zone: 'north' },
  { code: '13', name: 'تلمسان - Tlemcen', zone: 'north' },
  { code: '14', name: 'تيارت - Tiaret', zone: 'north' },
  { code: '15', name: 'تيزي وزو - Tizi Ouzou', zone: 'north' },
  { code: '16', name: 'الجزائر - Alger (العاصمة)', zone: 'capital' },
  { code: '17', name: 'الجلفة - Djelfa', zone: 'south' },
  { code: '18', name: 'جيجل - Jijel', zone: 'north' },
  { code: '19', name: 'سطيف - Sétif', zone: 'north' },
  { code: '20', name: 'سعيدة - Saïda', zone: 'north' },
  { code: '21', name: 'سكيكدة - Skikda', zone: 'north' },
  { code: '22', name: 'سيدي بلعباس - Sidi Bel Abbès', zone: 'north' },
  { code: '23', name: 'عنابة - Annaba', zone: 'north' },
  { code: '24', name: 'قالمة - Guelma', zone: 'north' },
  { code: '25', name: 'قسنطينة - Constantine', zone: 'north' },
  { code: '26', name: 'المدية - Médéa', zone: 'north' },
  { code: '27', name: 'مستغانم - Mostaganem', zone: 'north' },
  { code: '28', name: 'المسيلة - M\'Sila', zone: 'north' },
  { code: '29', name: 'معسكر - Mascara', zone: 'north' },
  { code: '30', name: 'ورقلة - Ouargla', zone: 'south' },
  { code: '31', name: 'وهران - Oran', zone: 'north' },
  { code: '32', name: 'البيض - El Bayadh', zone: 'south' },
  { code: '33', name: 'إليزي - Illizi', zone: 'far_south' },
  { code: '34', name: 'برج بوعريريج - Bordj Bou Arréridj', zone: 'north' },
  { code: '35', name: 'بومرداس - Boumerdès', zone: 'north' },
  { code: '36', name: 'الطارف - El Tarf', zone: 'north' },
  { code: '37', name: 'تندوف - Tindouf', zone: 'far_south' },
  { code: '38', name: 'تيسمسيلت - Tissemsilt', zone: 'north' },
  { code: '39', name: 'الوادي - El Oued', zone: 'south' },
  { code: '40', name: 'خنشلة - Khenchela', zone: 'north' },
  { code: '41', name: 'سوق أهراس - Souk Ahras', zone: 'north' },
  { code: '42', name: 'تيبازة - Tipaza', zone: 'north' },
  { code: '43', name: 'ميلة - Mila', zone: 'north' },
  { code: '44', name: 'عين الدفلى - Aïn Defla', zone: 'north' },
  { code: '45', name: 'النعامة - Naâma', zone: 'south' },
  { code: '46', name: 'عين تموشنت - Aïn Témouchent', zone: 'north' },
  { code: '47', name: 'غرداية - Ghardaïa', zone: 'south' },
  { code: '48', name: 'غليزان - Relizane', zone: 'north' },
  { code: '49', name: 'تيميمون - Timimoun', zone: 'far_south' },
  { code: '50', name: 'برج باجي مختار - Bordj Badji Mokhtar', zone: 'far_south' },
  { code: '51', name: 'أولاد جلال - Ouled Djellal', zone: 'south' },
  { code: '52', name: 'بني عباس - Béni Abbès', zone: 'far_south' },
  { code: '53', name: 'عين صالح - In Salah', zone: 'far_south' },
  { code: '54', name: 'عين قزام - In Guezzam', zone: 'far_south' },
  { code: '55', name: 'تقرت - Touggourt', zone: 'south' },
  { code: '56', name: 'جانت - Djanet', zone: 'far_south' },
  { code: '57', name: 'المغير - El M\'Ghair', zone: 'south' },
  { code: '58', name: 'المنيعة - El Meniaa', zone: 'south' }
];

// أسعار التوصيل حسب المنطقة بالدينار الجزائري (د.ج)
const SHIPPING_RATES = {
  capital: { home: 400, desk: 250 },
  north: { home: 600, desk: 400 },
  south: { home: 900, desk: 600 },
  far_south: { home: 1200, desk: 800 }
};

// متغيرات حالة التطبيق
let currentProduct = null;
let allProducts = [];
let selectedQuantity = 1;
let selectedVariant = null;
let selectedDeliveryType = 'home'; // 'home' | 'desk'

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

async function initApp() {
  try {
    // 1. Fetch des produits en direct depuis l'API backend Node.js (/api/products)
    let products = [];
    try {
      const res = await fetch(`${API_BASE}/api/products`, {
        headers: { 'bypass-tunnel-reminder': 'true' }
      });
      if (res.ok) products = await res.json();
    } catch (e) {
      try {
        const res = await fetch('./api/products');
        if (res.ok) products = await res.json();
      } catch (err) { }
    }

    // Fallback fichier static si serveur non disponible
    if (!products || !products.length) {
      try {
        const res = await fetch('./produits.json');
        if (res.ok) products = await res.json();
      } catch (e) {
        try {
          const resFallback = await fetch('produits.json');
          if (resFallback.ok) products = await resFallback.json();
        } catch (err) { }
      }
    }

    allProducts = products;

    if (!products || !products.length) {
      showError('تعذر تحميل قاعدة بيانات المنتجات (produits.json). يرجى التأكد من وجود الملف.');
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    let productId = urlParams.get('id');

    // Setup Store Grid
    renderStoreMenu(products);

    // Si aucun ID n'est fourni ou ID non trouvé
    if (!productId) {
      // Produit par défaut: collier-lune
      productId = 'collier-lune';
    }

    currentProduct = products.find(p => p.id === productId);

    if (!currentProduct) {
      showError(`المنتج المطلوب بالمعرف (id="${productId}") غير موجود في الملف produits.json`, products);
      return;
    }

    // Default selected variant
    if (currentProduct.variants && currentProduct.variants.length > 0) {
      selectedVariant = currentProduct.variants[0];
    }

    // 3. Injection dynamique dans el DOM
    renderProductPage(currentProduct);

    // 4. Initialisation du formulaire & calculs
    initWilayasSelect();
    initDeliveryOptions();
    initCountdownTimer();
    updatePriceSummary();

    // Event handlers
    document.getElementById('order-form').addEventListener('submit', handleOrderSubmit);
    document.getElementById('sticky-order-btn').addEventListener('click', () => {
      document.getElementById('order-section').scrollIntoView({ behavior: 'smooth' });
    });

    // Initialiser la validation en direct du numéro de téléphone algérien
    initPhoneValidation();

    // Tracking ViewContent
    trackViewContent(currentProduct);

    // Tracking InitiateCheckout sur le focus du formulaire
    const phoneInput = document.getElementById('customer-phone');
    if (phoneInput) {
      phoneInput.addEventListener('focus', function onFocus() {
        trackInitiateCheckout(currentProduct);
        phoneInput.removeEventListener('focus', onFocus); // Une seule fois
      });
    }

  } catch (err) {
    console.error('Error loading product data:', err);
    showError('حدث خطأ أثناء تحميل بيانات الصفحة: ' + err.message);
  }
}

/**
 * Renders the STORE grid inside the modal
 */
function renderStoreMenu(products) {
  const storeGrid = document.getElementById('store-grid');
  if (!storeGrid) return;

  storeGrid.innerHTML = products.map(p => {
    return `
      <a href="javascript:void(0)" onclick="loadProduct('${p.id}')" class="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-500 transition duration-300 group block">
        <div class="aspect-square rounded-xl overflow-hidden bg-slate-100 mb-3">
          <img src="${p.images && p.images.length > 0 ? p.images[0] : ''}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        </div>
        <h3 class="font-bold text-slate-800 text-xs md:text-sm line-clamp-2 mb-2" style="line-height: 1.4;">${p.title}</h3>
        <div class="flex items-center justify-between">
          <span class="font-black text-brand-600 text-sm">${formatPrice(p.price, p.currency)}</span>
          <span class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition">
            <svg class="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </span>
        </div>
      </a>
    `;
  }).join('');
}

/**
 * Toggles the Store Modal
 */
window.toggleStoreModal = function () {
  const storeModal = document.getElementById('store-modal');
  if (!storeModal) return;

  if (storeModal.classList.contains('hidden')) {
    storeModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Empêcher le scroll derrière la modale
  } else {
    storeModal.classList.add('hidden');
    document.body.style.overflow = 'auto'; // Réactiver le scroll
  }
};

/**
 * Load a product dynamically and close modal
 */
window.loadProduct = function (productId) {
  const newProd = allProducts.find(p => p.id === productId);
  if (!newProd) return;

  // Mettre à jour l'URL sans recharger la page
  const newUrl = new URL(window.location.href);
  newUrl.searchParams.set('id', productId);
  window.history.pushState({ path: newUrl.href }, '', newUrl.href);

  currentProduct = newProd;
  if (currentProduct.variants && currentProduct.variants.length > 0) {
    selectedVariant = currentProduct.variants[0];
  } else {
    selectedVariant = null;
  }

  selectedQuantity = 1;
  const qtyDisplay = document.getElementById('qty-display');
  if (qtyDisplay) qtyDisplay.textContent = selectedQuantity;

  // Re-rendre la page avec le nouveau produit
  renderProductPage(currentProduct);

  // Mettre à jour la grille de prix avec la Wilaya déjà sélectionnée
  updatePriceSummary();

  // Déclencher le pixel
  trackViewContent(currentProduct);

  // Fermer la modale
  toggleStoreModal();

  // Remonter en haut de page
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

/**
 * Injection complète des données du produit dans le DOM (RTL Arabic)
 */
function renderProductPage(product) {
  // Page Title
  document.title = `${product.title} | متجر الجزائر (الدفع عند الاستلام)`;

  // Top Announcement Bar
  document.getElementById('top-announcement').innerHTML = `
    <span class="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
    <span>🤝 الدفع عند الاستلام بعد معاينة المنتج | 🚚 توصيل لجميع 58 ولاية جزائرية</span>
  `;

  // Store Brand Name
  document.getElementById('store-brand').innerHTML = `
    <div class="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center font-black text-sm">
      ZS
    </div>
    <span class="text-slate-900 font-bold tracking-wide">ZED StOrE</span>
  `;

  // Product Badge
  document.getElementById('product-badge').innerHTML = `
    <span class="bg-amber-100 text-amber-800 border border-amber-300/80 font-black text-xs px-3 py-1 rounded-full flex items-center gap-1">
      ${product.badge || 'الدفع عند الاستلام 🔥'}
    </span>
  `;

  // Stock Status
  document.getElementById('product-stock-status').innerHTML = `
    <span class="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
    <span>المخزون محدود: متبقي ${product.stock_remaining || 5} قطع فقط!</span>
  `;

  // Title & Subtitle
  document.getElementById('product-title').textContent = product.title;
  document.getElementById('product-subtitle').textContent = product.subtitle;

  // Rating Stars
  const ratingStars = Array.from({ length: 5 }, (_, i) =>
    `<svg class="w-4 h-4 ${i < Math.floor(product.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`
  ).join('');

  document.getElementById('product-rating-box').innerHTML = `
    <div class="flex items-center gap-1">${ratingStars}</div>
    <span class="text-xs font-bold text-slate-700">${product.rating || 4.9}</span>
    <span class="text-xs text-slate-500">(${product.reviews_count || 120} تقييم ممتاز)</span>
  `;

  // Gallery Main Image & Dynamic Thumbnails Loop
  const mainImg = document.getElementById('product-img');
  const thumbsContainer = document.getElementById('product-gallery-thumbnails');

  if (product.images && product.images.length > 0) {
    mainImg.src = product.images[0];
    mainImg.alt = product.title;

    if (thumbsContainer) {
      const cols = Math.min(Math.max(product.images.length, 4), 6);
      thumbsContainer.className = `grid grid-cols-${cols} gap-2 px-3 pb-3 sm:px-0 sm:pb-0`;

      thumbsContainer.innerHTML = product.images.map((imgUrl, index) => `
        <button type="button" 
                onclick="changeMainImage('${imgUrl}', this)" 
                class="thumbnail-btn border-2 ${index === 0 ? 'border-brand-600 ring-2 ring-brand-500/30' : 'border-slate-200'} rounded-xl overflow-hidden aspect-square bg-slate-100 transition focus:outline-none cursor-pointer">
          <img src="${imgUrl}" alt="${product.title}" class="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </button>
      `).join('');
    }
  } else {
    if (thumbsContainer) thumbsContainer.innerHTML = '';
  }

  // Prices & Discount Calculation
  const priceFormatted = formatPrice(product.price, product.currency);
  const oldPriceFormatted = formatPrice(product.old_price, product.currency);
  const discountPercent = Math.round(((product.old_price - product.price) / product.old_price) * 100);

  document.getElementById('product-price').textContent = priceFormatted;
  document.getElementById('product-old-price').textContent = oldPriceFormatted;
  document.getElementById('product-discount').textContent = `توفير ${discountPercent}% للطلب اليوم`;

  // Variants Selection Chips
  const variantsContainer = document.getElementById('product-variants');
  if (product.variants && product.variants.length > 0) {
    variantsContainer.innerHTML = `
      <label class="block text-xs font-bold text-slate-700 mb-1.5">اختر الخيار المناسب:</label>
      <div class="flex flex-wrap gap-2">
        ${product.variants.map((v, idx) => `
          <button type="button" 
                  onclick="selectVariant('${v.id}')" 
                  id="variant-btn-${v.id}"
                  class="variant-btn px-4 py-2 rounded-xl text-xs font-bold transition border ${idx === 0
        ? 'bg-brand-50 border-brand-600 text-brand-900 ring-2 ring-brand-500/20'
        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
      }">
            ${v.name}
          </button>
        `).join('')}
      </div>
    `;
  } else {
    variantsContainer.innerHTML = '';
  }

  // Quantity Control Input
  const qtyContainer = document.getElementById('quantity-controls');
  qtyContainer.innerHTML = `
    <div class="flex items-center justify-between">
      <label class="text-xs font-bold text-slate-700">الكمية المطلوبة:</label>
      <div class="flex items-center border border-slate-300 rounded-xl bg-slate-50 p-1">
        <button type="button" onclick="adjustQuantity(-1)" class="w-8 h-8 rounded-lg bg-white shadow-xs border border-slate-200 text-slate-800 font-bold text-base flex items-center justify-center hover:bg-slate-100">-</button>
        <span id="qty-display" class="w-10 text-center font-black text-sm text-slate-900">1</span>
        <button type="button" onclick="adjustQuantity(1)" class="w-8 h-8 rounded-lg bg-white shadow-xs border border-slate-200 text-slate-800 font-bold text-base flex items-center justify-center hover:bg-slate-100">+</button>
      </div>
    </div>
  `;

  // Product Features Checklist
  const featuresList = document.getElementById('product-features');
  featuresList.innerHTML = product.features.map(feat => `
    <li class="flex items-start gap-2.5">
      <div class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
      </div>
      <span class="font-semibold">${feat}</span>
    </li>
  `).join('');

  // Product Full Description
  document.getElementById('product-description').textContent = product.description;

  // Order Form Titles
  document.getElementById('form-title').textContent = 'إستمارة الطلب السريع (الدفع عند الاستلام)';
  document.getElementById('form-subtitle').textContent = 'يرجى ملء كافة معلوماتك ليصلك المنتج حتى باب منزلك مع الضمان ومعاينة المنتج قبل الدفع!';

  // Input Placeholders
  document.getElementById('customer-name').placeholder = 'مثال: محمد بن علي';
  document.getElementById('customer-phone').placeholder = '06XX XX XX XX';
  document.getElementById('customer-address').placeholder = 'مثال: حي السلام، الشارع الرئيسي، بالقرب من المسجد';

  // Order Submit Button
  document.getElementById('submit-order-btn').innerHTML = `
    <span>تأكيد الطلب الآن (الدفع عند الاستلام)</span>
    <svg class="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
  `;

  // Form Guarantee Notice
  document.getElementById('form-guarantee').innerHTML = `
    <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
    <span>ضمان الفحص عند الاستلام قبل تسليم المبلغ للسائق!</span>
  `;

  // Reviews Section
  document.getElementById('reviews-title').textContent = `آراء وتقييمات زبائننا الكرام (${product.reviews.length})`;
  document.getElementById('product-reviews').innerHTML = product.reviews.map(rev => `
    <div class="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
      <div class="flex items-center justify-between">
        <span class="font-bold text-slate-900 text-sm">${rev.author}</span>
        <span class="text-xs text-slate-400">${rev.date || 'منذ فترة'}</span>
      </div>
      <div class="flex items-center gap-1">
        ${Array.from({ length: 5 }, (_, i) => `<svg class="w-3.5 h-3.5 ${i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`).join('')}
      </div>
      <p class="text-xs md:text-sm text-slate-700 leading-relaxed">${rev.comment}</p>
    </div>
  `).join('');
}

/**
 * Switch main image on thumbnail click
 */
window.changeMainImage = function (src, btnEl) {
  const mainImg = document.getElementById('product-img');
  mainImg.src = src;

  document.querySelectorAll('.thumbnail-btn').forEach(b => {
    b.classList.remove('border-brand-600', 'ring-2', 'ring-brand-500/30');
    b.classList.add('border-slate-200');
  });

  if (btnEl) {
    btnEl.classList.remove('border-slate-200');
    btnEl.classList.add('border-brand-600', 'ring-2', 'ring-brand-500/30');
  }
};

/**
 * Select variant chip
 */
window.selectVariant = function (variantId) {
  if (!currentProduct || !currentProduct.variants) return;
  selectedVariant = currentProduct.variants.find(v => v.id === variantId);

  document.querySelectorAll('.variant-btn').forEach(btn => {
    btn.className = 'variant-btn px-4 py-2 rounded-xl text-xs font-bold transition border bg-white border-slate-300 text-slate-700 hover:bg-slate-50';
  });

  const activeBtn = document.getElementById(`variant-btn-${variantId}`);
  if (activeBtn) {
    activeBtn.className = 'variant-btn px-4 py-2 rounded-xl text-xs font-bold transition border bg-brand-50 border-brand-600 text-brand-900 ring-2 ring-brand-500/20';
  }
};

/**
 * Adjust product quantity
 */
window.adjustQuantity = function (delta) {
  selectedQuantity = Math.max(1, Math.min(20, selectedQuantity + delta));
  const qtyDisplay = document.getElementById('qty-display');
  if (qtyDisplay) qtyDisplay.textContent = selectedQuantity;
  updatePriceSummary();
};

/**
 * Populate 58 Wilayas selector
 */
function initWilayasSelect() {
  const select = document.getElementById('customer-wilaya');
  if (!select) return;

  select.innerHTML = `
    <option value="" disabled selected>-- اختر ولايتك (58 ولاية) --</option>
    ${WILAYAS_ALGERIE.map(w => `
      <option value="${w.code}" data-zone="${w.zone}">
        ${w.code} - ${w.name}
      </option>
    `).join('')}
  `;

  // Default selection: Alger (16)
  select.value = '16';
  select.addEventListener('change', () => {
    updatePriceSummary();
  });
}

/**
 * Initialize Delivery Type Options
 */
function initDeliveryOptions() {
  const optionsContainer = document.getElementById('delivery-options');
  if (!optionsContainer) return;

  optionsContainer.innerHTML = `
    <label id="opt-home" class="flex items-center justify-between p-3 rounded-xl border-2 border-brand-600 bg-brand-50/60 cursor-pointer transition">
      <div class="flex items-center gap-2">
        <input type="radio" name="delivery_type" value="home" checked onchange="setDeliveryType('home')" class="accent-brand-600 w-4 h-4" />
        <span class="text-xs font-bold text-slate-900">توصيل للبيت 🏠</span>
      </div>
      <span id="home-fee-tag" class="text-xs font-black text-brand-700"></span>
    </label>

    <label id="opt-desk" class="flex items-center justify-between p-3 rounded-xl border border-slate-300 bg-white cursor-pointer transition hover:bg-slate-50">
      <div class="flex items-center gap-2">
        <input type="radio" name="delivery_type" value="desk" onchange="setDeliveryType('desk')" class="accent-brand-600 w-4 h-4" />
        <span class="text-xs font-bold text-slate-900">استلام من المكتب 🏢</span>
      </div>
      <span id="desk-fee-tag" class="text-xs font-black text-slate-600"></span>
    </label>
  `;
}

window.setDeliveryType = function (type) {
  selectedDeliveryType = type;
  const optHome = document.getElementById('opt-home');
  const optDesk = document.getElementById('opt-desk');

  if (type === 'home') {
    optHome.className = 'flex items-center justify-between p-3 rounded-xl border-2 border-brand-600 bg-brand-50/60 cursor-pointer transition';
    optDesk.className = 'flex items-center justify-between p-3 rounded-xl border border-slate-300 bg-white cursor-pointer transition hover:bg-slate-50';
  } else {
    optHome.className = 'flex items-center justify-between p-3 rounded-xl border border-slate-300 bg-white cursor-pointer transition hover:bg-slate-50';
    optDesk.className = 'flex items-center justify-between p-3 rounded-xl border-2 border-brand-600 bg-brand-50/60 cursor-pointer transition';
  }

  updatePriceSummary();
};

/**
 * Calculates and updates order summary breakdown
 */
function updatePriceSummary() {
  if (!currentProduct) return;

  const lp = window.globalLandingPageConfig || {};
  const isProductFreeShipping = (currentProduct.freeShipping === true);
  const isGlobalDeliveryShown = (lp.showDelivery !== false);
  const shouldDisplayDelivery = isProductFreeShipping || isGlobalDeliveryShown;

  // Toggle delivery section visibility based on priority rules
  const deliverySection = document.getElementById('delivery-section') ||
                          document.getElementById('delivery-options')?.parentElement;
  if (deliverySection) {
    deliverySection.style.display = shouldDisplayDelivery ? '' : 'none';
  }

  const wilayaSelect = document.getElementById('customer-wilaya');
  const selectedWilayaCode = wilayaSelect ? wilayaSelect.value : '16';
  const wilayaObj = WILAYAS_ALGERIE.find(w => w.code === selectedWilayaCode) || WILAYAS_ALGERIE[15];

  const zone = wilayaObj.zone;
  const rates = SHIPPING_RATES[zone] || SHIPPING_RATES.north;

  const optionsContainer = document.getElementById('delivery-options');
  if (optionsContainer && shouldDisplayDelivery) {
    if (isProductFreeShipping) {
      selectedDeliveryType = 'free';
      optionsContainer.innerHTML = `
        <label id="opt-free" class="col-span-2 flex items-center justify-between p-3.5 rounded-xl border-2 border-emerald-600 bg-emerald-50/80 cursor-default shadow-xs transition">
          <div class="flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black">🚚</span>
            <div class="flex flex-col text-right">
              <span class="text-xs font-black text-emerald-950">توصيل مجاني 🎉</span>
              <span class="text-[10px] text-emerald-700 font-semibold">عرض خاص: التوصيل مجاناً لجميع الولايات</span>
            </div>
          </div>
          <span class="text-xs font-black bg-emerald-600 text-white px-2.5 py-1 rounded-lg shadow-xs">مجاني (0 د.ج)</span>
        </label>
      `;
    } else {
      if (selectedDeliveryType === 'free') selectedDeliveryType = 'home';
      optionsContainer.innerHTML = `
        <label id="opt-home" class="flex items-center justify-between p-3 rounded-xl ${selectedDeliveryType === 'home' ? 'border-2 border-brand-600 bg-brand-50/60' : 'border border-slate-300 bg-white hover:bg-slate-50'} cursor-pointer transition">
          <div class="flex items-center gap-2">
            <input type="radio" name="delivery_type" value="home" ${selectedDeliveryType === 'home' ? 'checked' : ''} onchange="setDeliveryType('home')" class="accent-brand-600 w-4 h-4" />
            <span class="text-xs font-bold text-slate-900">توصيل للبيت 🏠</span>
          </div>
          <span id="home-fee-tag" class="text-xs font-black text-brand-700">${rates.home} د.ج</span>
        </label>

        <label id="opt-desk" class="flex items-center justify-between p-3 rounded-xl ${selectedDeliveryType === 'desk' ? 'border-2 border-brand-600 bg-brand-50/60' : 'border border-slate-300 bg-white hover:bg-slate-50'} cursor-pointer transition">
          <div class="flex items-center gap-2">
            <input type="radio" name="delivery_type" value="desk" ${selectedDeliveryType === 'desk' ? 'checked' : ''} onchange="setDeliveryType('desk')" class="accent-brand-600 w-4 h-4" />
            <span class="text-xs font-bold text-slate-900">استلام من المكتب 🏢</span>
          </div>
          <span id="desk-fee-tag" class="text-xs font-black text-slate-600">${rates.desk} د.ج</span>
        </label>
      `;
    }
  }

  let shippingFee = 0;
  if (!shouldDisplayDelivery || isProductFreeShipping) {
    shippingFee = 0;
  } else {
    shippingFee = selectedDeliveryType === 'home' ? rates.home : rates.desk;
  }

  const subtotal = currentProduct.price * selectedQuantity;
  const total = subtotal + shippingFee;

  // Update Breakdown Labels & Visibility
  const subtotalLabel = document.getElementById('summary-subtotal-label');
  if (subtotalLabel) subtotalLabel.textContent = `سعر المنتج (${selectedQuantity}x):`;
  const subtotalVal = document.getElementById('summary-subtotal');
  if (subtotalVal) subtotalVal.textContent = formatPrice(subtotal, currentProduct.currency);

  const shippingRow = document.getElementById('summary-shipping-row') ||
                      document.getElementById('summary-shipping')?.parentElement;
  const shippingLabel = document.getElementById('summary-shipping-label');
  const shippingVal = document.getElementById('summary-shipping');

  if (!shouldDisplayDelivery) {
    if (shippingRow) shippingRow.style.display = 'none';
  } else {
    if (shippingRow) shippingRow.style.display = 'flex';
    if (shippingLabel) shippingLabel.textContent = `مصاريف التوصيل (${wilayaObj.name}):`;
    if (shippingVal) {
      shippingVal.textContent = isProductFreeShipping ? 'مجاني (0 د.ج)' : formatPrice(shippingFee, currentProduct.currency);
    }
  }

  const totalLabel = document.getElementById('summary-total-label');
  if (totalLabel) totalLabel.textContent = 'المبلغ الإجمالي عند الاستلام:';
  const totalVal = document.getElementById('summary-total');
  if (totalVal) totalVal.textContent = formatPrice(total, currentProduct.currency);

  // Update Sticky Bottom Bar Price
  const stickyPrice = document.getElementById('sticky-price');
  if (stickyPrice) stickyPrice.textContent = formatPrice(total, currentProduct.currency);
}

/**
 * Countdown timer logic for urgency
 */
function initCountdownTimer() {
  const timerContainer = document.getElementById('product-timer');
  if (!timerContainer) return;

  let totalSeconds = 23 * 3600 + 59 * 60 + 59; // 23h 59m 59s

  function updateTimerUI() {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = num => String(num).padStart(2, '0');

    timerContainer.innerHTML = `
      <span class="font-bold flex items-center gap-1">
        <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        ينتهي هذا العرض والتخفيض خلال:
      </span>
      <div class="font-mono font-black text-amber-400 text-sm tracking-wider flex items-center gap-1 dir-ltr">
        <span class="bg-emerald-900/90 px-1.5 py-0.5 rounded border border-emerald-700">${pad(hours)}</span>:
        <span class="bg-emerald-900/90 px-1.5 py-0.5 rounded border border-emerald-700">${pad(minutes)}</span>:
        <span class="bg-emerald-900/90 px-1.5 py-0.5 rounded border border-emerald-700">${pad(seconds)}</span>
      </div>
    `;

    if (totalSeconds > 0) {
      totalSeconds--;
    }
  }

  updateTimerUI();
  setInterval(updateTimerUI, 1000);
}

/**
 * Validation stricte des numéros de téléphone mobiles algériens (05, 06, 07 - 10 chiffres)
 */
function validateAlgerianPhone(phone) {
  let cleanPhone = (phone || '').replace(/[\s\-\.\(\)]/g, '');
  if (cleanPhone.startsWith('+213')) cleanPhone = '0' + cleanPhone.slice(4);
  if (cleanPhone.startsWith('00213')) cleanPhone = '0' + cleanPhone.slice(5);
  const regex = /^0[567][0-9]{8}$/;
  return {
    isValid: regex.test(cleanPhone),
    cleanPhone: cleanPhone
  };
}

/**
 * Initialise la validation dynamique du numéro de téléphone
 */
function initPhoneValidation() {
  const phoneInput = document.getElementById('customer-phone');
  const errorMsg = document.getElementById('phone-error-msg');
  if (!phoneInput) return;

  function checkPhone() {
    const rawVal = phoneInput.value.trim();
    if (!rawVal) {
      phoneInput.classList.remove('border-red-500', 'focus:ring-red-500/20', 'border-brand-500');
      phoneInput.classList.add('border-slate-300');
      if (errorMsg) errorMsg.classList.add('hidden');
      return true;
    }

    const { isValid } = validateAlgerianPhone(rawVal);
    if (!isValid) {
      phoneInput.classList.remove('border-slate-300', 'border-brand-500');
      phoneInput.classList.add('border-red-500', 'focus:ring-2', 'focus:ring-red-500/20');
      if (errorMsg) errorMsg.classList.remove('hidden');
      return false;
    } else {
      phoneInput.classList.remove('border-red-500', 'focus:ring-red-500/20');
      phoneInput.classList.add('border-brand-500');
      if (errorMsg) errorMsg.classList.add('hidden');
      return true;
    }
  }

  phoneInput.addEventListener('input', checkPhone);
  phoneInput.addEventListener('blur', checkPhone);
}

/**
 * Handle Order Form Submit
 */
function handleOrderSubmit(e) {
  e.preventDefault();

  const nameInput = document.getElementById('customer-name');
  const phoneInput = document.getElementById('customer-phone');
  const wilayaSelect = document.getElementById('customer-wilaya');
  const addressInput = document.getElementById('customer-address');
  const errorMsg = document.getElementById('phone-error-msg');

  const name = nameInput ? nameInput.value.trim() : '';
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const wilayaCode = wilayaSelect ? wilayaSelect.value : '';
  const address = addressInput ? addressInput.value.trim() : '';

  if (!name || !phone || !wilayaCode || !address) {
    alert('يرجى ملء جميع الحقول المطلوبة قبل إرسال الطلب.');
    return;
  }

  // Validation stricte du numéro de téléphone mobile algérien (05, 06, 07 + 8 chiffres = 10 chiffres)
  const { isValid: isPhoneValid, cleanPhone } = validateAlgerianPhone(phone);
  if (!isPhoneValid) {
    phoneInput.classList.remove('border-slate-300', 'border-brand-500');
    phoneInput.classList.add('border-red-500', 'focus:ring-2', 'focus:ring-red-500/20');
    if (errorMsg) errorMsg.classList.remove('hidden');
    phoneInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    phoneInput.focus();
    return;
  } else {
    phoneInput.classList.remove('border-red-500', 'focus:ring-red-500/20');
    phoneInput.classList.add('border-brand-500');
    if (errorMsg) errorMsg.classList.add('hidden');
  }

  const wilayaObj = WILAYAS_ALGERIE.find(w => w.code === wilayaCode) || WILAYAS_ALGERIE[15];
  const rates = SHIPPING_RATES[wilayaObj.zone] || SHIPPING_RATES.north;

  const lp = window.globalLandingPageConfig || {};
  const isProductFreeShipping = (currentProduct && currentProduct.freeShipping === true);
  const isGlobalDeliveryShown = (lp.showDelivery !== false);
  const shouldDisplayDelivery = isProductFreeShipping || isGlobalDeliveryShown;

  let shippingFee = 0;
  if (!shouldDisplayDelivery || isProductFreeShipping) {
    shippingFee = 0;
  } else {
    shippingFee = selectedDeliveryType === 'home' ? rates.home : rates.desk;
  }

  const subtotal = currentProduct.price * selectedQuantity;
  const totalAmount = subtotal + shippingFee;

  const generateOrderCode = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomLetters = letters.charAt(Math.floor(Math.random() * letters.length)) +
      letters.charAt(Math.floor(Math.random() * letters.length));
    const randomNumbers = Math.floor(10000 + Math.random() * 90000); // 5 chiffres
    return `ZED-${randomLetters}-${randomNumbers}`;
  };
  const numeroCommande = generateOrderCode();

  // 1. Préparer le document pour Firestore
  const newOrder = {
    nom: name,
    telephone: cleanPhone,
    wilaya: wilayaObj.name,
    adresse: address,
    produitId: currentProduct.id,
    produitNom: currentProduct.title,
    variante: selectedVariant ? selectedVariant.name : "",
    quantite: selectedQuantity,
    typeLivraison: selectedDeliveryType,
    fraisLivraison: shippingFee,
    prixUnitaire: currentProduct.price,
    total: totalAmount,
    montantTotal: totalAmount,
    status: 'pending', // par défaut
    date: db ? firebase.firestore.FieldValue.serverTimestamp() : new Date().toISOString(),
    numeroCommande: numeroCommande
  };

  // 2. Bouton en état de chargement
  const btn = document.getElementById('submit-order-btn');
  const originalBtnHtml = btn.innerHTML;
  btn.innerHTML = 'جاري الإرسال... <svg class="animate-spin w-5 h-5 ml-2 inline" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>';
  btn.disabled = true;

  // 3. Envoi à Firebase
  if (db) {
    db.collection('commandes').add(newOrder)
      .then((docRef) => {
        trackPurchase(currentProduct, selectedQuantity, totalAmount);
        showSuccessModal(name, phone, numeroCommande, totalAmount, wilayaObj.name, address);
      })
      .catch((error) => {
        console.error("Erreur d'ajout Firebase:", error);
        alert("حدث خطأ، يرجى المحاولة مرة أخرى.");
      })
      .finally(() => {
        btn.innerHTML = originalBtnHtml;
        btn.disabled = false;
      });
  } else {
    // Simulation pour test si Firebase n'est pas configuré
    console.warn("Firebase non configuré, commande simulée:", newOrder);
    setTimeout(() => {
      trackPurchase(currentProduct, selectedQuantity, totalAmount);
      showSuccessModal(name, phone, numeroCommande, totalAmount, wilayaObj.name, address);
      btn.innerHTML = originalBtnHtml;
      btn.disabled = false;
    }, 1000);
  }
}

function showSuccessModal(name, phone, orderCode, totalAmount, wilayaName, address) {
  // Display Order Confirmation Modal
  const modal = document.getElementById('order-success-modal');
  const modalContent = document.getElementById('modal-content');

  const safeName = escapeHtml(name);
  const safePhone = escapeHtml(phone);
  const safeAddress = escapeHtml(address);
  const safeWilaya = escapeHtml(wilayaName);

  modalContent.innerHTML = `
    <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
      <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
    </div>

    <h3 class="text-2xl font-black text-slate-900">تم تسجيل طلبك بنجاح! 🎉</h3>
    <p class="text-xs md:text-sm text-slate-600 leading-relaxed">
      شكراً لك <strong class="text-slate-900">${safeName}</strong>. سنتصل بك على الرقم <strong class="text-brand-700 font-mono" dir="ltr">${safePhone}</strong> لتأكيد طلبك قبل الشحن.
    </p>

    <!-- Receipt Details -->
    <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-right text-xs space-y-2 font-semibold">
      <div class="flex justify-between border-b border-slate-200 pb-2">
        <span class="text-slate-500">رقم الطلب:</span>
        <span class="font-mono font-bold text-slate-900">${orderCode}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-500">المنتج:</span>
        <span class="text-slate-900 font-bold">${escapeHtml(currentProduct.title)}</span>
      </div>
      ${selectedVariant ? `
        <div class="flex justify-between">
          <span class="text-slate-500">الخيار المختار:</span>
          <span class="text-slate-900">${escapeHtml(selectedVariant.name)}</span>
        </div>
      ` : ''}
      <div class="flex justify-between">
        <span class="text-slate-500">الكمية:</span>
        <span class="text-slate-900 font-bold">${selectedQuantity}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-500">الولاية والعنوان:</span>
        <span class="text-slate-900">${safeWilaya} - ${safeAddress}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-500">طريقة التوصيل:</span>
        <span class="text-slate-900">${(currentProduct && currentProduct.freeShipping === true) || selectedDeliveryType === 'free' ? 'توصيل مجاني 🎉 (0 د.ج)' : (selectedDeliveryType === 'home' ? 'توصيل للمنزل 🏠' : 'استلام من المكتب 🏢')}</span>
      </div>
      <div class="flex justify-between border-t border-slate-200 pt-2 font-black text-sm text-brand-700">
        <span>المبلغ عند الاستلام:</span>
        <span>${formatPrice(totalAmount, currentProduct.currency)}</span>
      </div>
    </div>

    <button type="button" 
            onclick="closeSuccessModal()" 
            class="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl shadow-md transition cursor-pointer">
      تم، العودة للمتجر
    </button>
  `;

  modal.classList.remove('hidden');
}

window.closeSuccessModal = function () {
  const modal = document.getElementById('order-success-modal');
  if (modal) modal.classList.add('hidden');
  document.getElementById('order-form').reset();
  setDeliveryType('home');
};

/**
 * Format price number into localized Arabic string with currency
 */
function formatPrice(amount, currency = 'د.ج') {
  return `${amount.toLocaleString('ar-DZ')} ${currency}`;
}

/**
 * Display Error Message if Product ID is missing or not found
 */
function showError(message, availableProducts = []) {
  const errorContainer = document.getElementById('error-container');
  const mainContent = document.getElementById('product-content');
  const stickyBar = document.getElementById('sticky-order-bar');

  if (mainContent) mainContent.classList.add('hidden');
  if (stickyBar) stickyBar.classList.add('hidden');

  if (errorContainer) {
    errorContainer.classList.remove('hidden');
    errorContainer.innerHTML = `
      <div class="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
      </div>
      <h2 class="text-lg font-bold text-slate-900 mb-2">خطأ في جلب بيانات المنتج</h2>
      <p class="text-xs text-slate-600 leading-relaxed mb-4">${message}</p>
      
      ${availableProducts.length ? `
        <div class="pt-3 border-t border-slate-200">
          <span class="block text-xs font-bold text-slate-700 mb-2">المنتجات المتاحة للتجربة:</span>
          <div class="flex flex-wrap justify-center gap-2">
            ${availableProducts.map(p => `
              <a href="?id=${p.id}" class="bg-brand-600 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-brand-700 transition">
                عرض: ${p.title} (?id=${p.id})
              </a>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;
  }
}

/**
 * Applique la configuration dynamique de la Landing Page depuis l'ERP (http://localhost:4000/api/config)
 */
async function applyLandingPageConfig() {
  try {
    let config = null;
    try {
      const res = await fetch(`${API_BASE}/api/config`, {
        headers: { 'bypass-tunnel-reminder': 'true' }
      });
      if (res.ok) config = await res.json();
    } catch (e) {
      try {
        const res = await fetch('./api/config');
        if (res.ok) config = await res.json();
      } catch (err) { }
    }

    if (!config || !config.landingPage) return;

    const lp = config.landingPage;
    window.globalLandingPageConfig = lp;

    // 1. Bouton WhatsApp
    const waContainer = document.getElementById('whatsapp-widget-container') || document.getElementById('whatsapp-toggle-btn')?.parentElement;
    if (waContainer) {
      if (lp.showWhatsapp === false) {
        waContainer.style.setProperty('display', 'none', 'important');
      } else {
        waContainer.style.display = '';
      }
    }

    // 2. Compte à rebours
    const timerElem = document.getElementById('product-timer');
    if (timerElem) {
      if (lp.showTimer === false) {
        timerElem.style.display = 'none';
      } else {
        timerElem.style.display = '';
      }
    }

    // 3. Prix barré & Badge de remise
    const isStrikethroughActive = (lp.showStrikethrough !== false && lp.strikethrough !== false);
    const oldPriceElem = document.getElementById('product-old-price');
    const discountBadge = document.getElementById('product-discount');
    if (oldPriceElem) oldPriceElem.style.display = isStrikethroughActive ? '' : 'none';
    if (discountBadge) discountBadge.style.display = isStrikethroughActive ? '' : 'none';

    // 4. Alerte Stock Limité
    const isStockAlertActive = (lp.showStockAlert !== false && lp.stockAlert !== false);
    const stockStatusElem = document.getElementById('product-stock-status');
    if (stockStatusElem) stockStatusElem.style.display = isStockAlertActive ? '' : 'none';

    // 5. Avis Clients / Évaluations (Masquage strict du conteneur global + Titre + Étoiles)
    const isReviewsActive = (lp.showReviews !== false && lp.reviews !== false);
    const ratingBox = document.getElementById('product-rating-box');
    const reviewsTitle = document.getElementById('reviews-title');
    const productReviews = document.getElementById('product-reviews');
    const reviewsSection = document.getElementById('customer-reviews-section') ||
      reviewsTitle?.closest('section') ||
      productReviews?.closest('section');

    if (ratingBox) ratingBox.style.display = isReviewsActive ? '' : 'none';
    if (reviewsSection) {
      if (isReviewsActive) {
        reviewsSection.style.display = '';
      } else {
        reviewsSection.style.setProperty('display', 'none', 'important');
      }
    }

    // 6. Section & Frais de livraison (Global Delivery Toggle)
    const isDeliveryActive = (lp.showDelivery !== false && lp.delivery !== false);
    const deliverySection = document.getElementById('delivery-section') || document.getElementById('delivery-options')?.parentElement;
    const shippingRow = document.getElementById('summary-shipping-row') || document.getElementById('summary-shipping')?.parentElement;

    if (deliverySection) {
      if (isDeliveryActive) {
        deliverySection.style.display = '';
      } else {
        deliverySection.style.setProperty('display', 'none', 'important');
      }
    }
    if (shippingRow) {
      if (isDeliveryActive) {
        shippingRow.style.display = '';
      } else {
        shippingRow.style.setProperty('display', 'none', 'important');
      }
    }

    if (typeof updatePriceSummary === 'function') {
      updatePriceSummary();
    }
  } catch (error) {
    console.warn('[Config LP] Échec du chargement de la configuration dynamique:', error);
  }
}

document.addEventListener('DOMContentLoaded', applyLandingPageConfig);

