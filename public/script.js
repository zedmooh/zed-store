/**
 * Script de gestion dynamique de la Landing Page "YouCan Style" (Algérie - COD)
 * Totalement piloté par JavaScript & produits.json (Aucune donnée produit en dur)
 */

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
let selectedQuantity = 1;
let selectedVariant = null;
const API_BASE = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ? 'http://localhost:4000'
  : 'https://intelligence-welfare-ceo-song.trycloudflare.com';

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
          const resFallback = await fetch('./produits.json');
          if (resFallback.ok) products = await resFallback.json();
        } catch (err) { }
      }
    }

    if (!products || !products.length) {
      showError('تعذر تحميل قاعدة بيانات المنتجات (produits.json). يرجى التأكد من وجود الملف.');
      return;
    }

    // 2. Extraction du paramètre ?id= dans l'URL
    const urlParams = new URLSearchParams(window.location.search);
    let productId = urlParams.get('id');

    // Setup Quick Tester Toolbar
    renderProductTesterToolbar(products, productId);

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

    // 3. Injection dynamique dans le DOM
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

  } catch (err) {
    console.error('Error loading product data:', err);
    showError('حدث خطأ أثناء تحميل بيانات الصفحة: ' + err.message);
  }
}

/**
 * Affiche la barre d'outils de test des liens ?id=
 */
function renderProductTesterToolbar(products, activeId) {
  const container = document.getElementById('product-tester-bar');
  if (!container) return;

  container.innerHTML = products.map(p => {
    const isActive = p.id === activeId || (!activeId && p.id === 'collier-lune');
    return `
      <a href="?id=${p.id}" 
         class="px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${isActive
        ? 'bg-brand-600 text-white shadow-xs'
        : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
      }">
        <span>${p.id === 'collier-lune' ? '🌙' : p.id === 'montre-homme' ? '⌚' : '🎒'}</span>
        <span>${p.id}</span>
      </a>
    `;
  }).join('');
}

/**
 * Injection complète des données du produit dans le DOM (RTL Arabic)
 */
function renderProductPage(product) {
  // Page Title
  document.title = `${product.title} | متجر الجزائر (الدفع عند الاستلام)`;

  // Top Announcement Bar
  document.getElementById('top-announcement').innerHTML = `
    <span class="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
    <span>🔥 الشحن لجميع 58 ولاية جزائرية | الدفع حصرًا عند الاستلام بعد معاينة المنتج!</span>
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
      ${product.badge || 'عرض حصري 🔥'}
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

  // Gallery Main Image & Thumbnails
  const mainImg = document.getElementById('product-img');
  mainImg.src = product.images[0];
  mainImg.alt = product.title;

  const thumbsContainer = document.getElementById('product-gallery-thumbnails');
  thumbsContainer.innerHTML = product.images.map((imgUrl, index) => `
    <button type="button" 
            onclick="changeMainImage('${imgUrl}', this)" 
            class="thumbnail-btn border-2 ${index === 0 ? 'border-brand-600 ring-2 ring-brand-500/30' : 'border-slate-200'} rounded-xl overflow-hidden aspect-square bg-slate-100 transition focus:outline-none">
      <img src="${imgUrl}" alt="${product.title}" class="w-full h-full object-cover" referrerPolicy="no-referrer" />
    </button>
  `).join('');

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

  let shippingFee = 0;
  if (!shouldDisplayDelivery) {
    shippingFee = 0;
  } else if (isProductFreeShipping) {
    shippingFee = 0;
  } else {
    shippingFee = selectedDeliveryType === 'home' ? rates.home : rates.desk;
  }

  const subtotal = currentProduct.price * selectedQuantity;
  const total = subtotal + shippingFee;

  // Update delivery radio option tags
  const homeTag = document.getElementById('home-fee-tag');
  const deskTag = document.getElementById('desk-fee-tag');
  if (isProductFreeShipping) {
    if (homeTag) homeTag.textContent = 'مجاني (0 د.ج)';
    if (deskTag) deskTag.textContent = 'مجاني (0 د.ج)';
  } else {
    if (homeTag) homeTag.textContent = `${rates.home} د.ج`;
    if (deskTag) deskTag.textContent = `${rates.desk} د.ج`;
  }

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
 * Handle Order Form Submit
 */
function handleOrderSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('customer-name').value.trim();
  const phone = document.getElementById('customer-phone').value.trim();
  const wilayaCode = document.getElementById('customer-wilaya').value;
  const address = document.getElementById('customer-address').value.trim();

  if (!name || !phone || !wilayaCode || !address) {
    alert('يرجى ملء جميع الحقول المطلوبة قبل إرسال الطلب.');
    return;
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

  const orderCode = 'DZ-' + Math.floor(100000 + Math.random() * 900000);

  // Display Order Confirmation Modal
  const modal = document.getElementById('order-success-modal');
  const modalContent = document.getElementById('modal-content');

  modalContent.innerHTML = `
    <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
      <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
    </div>

    <h3 class="text-2xl font-black text-slate-900">تم تسجيل طلبك بنجاح! 🎉</h3>
    <p class="text-xs md:text-sm text-slate-600 leading-relaxed">
      شكراً لك <strong class="text-slate-900">${name}</strong>. سنتصل بك على الرقم <strong class="text-brand-700 font-mono" dir="ltr">${phone}</strong> لتأكيد طلبك قبل الشحن.
    </p>

    <!-- Receipt Details -->
    <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-right text-xs space-y-2 font-semibold">
      <div class="flex justify-between border-b border-slate-200 pb-2">
        <span class="text-slate-500">رقم الطلب:</span>
        <span class="font-mono font-bold text-slate-900">${orderCode}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-500">المنتج:</span>
        <span class="text-slate-900 font-bold">${currentProduct.title}</span>
      </div>
      ${selectedVariant ? `
        <div class="flex justify-between">
          <span class="text-slate-500">الخيار المختار:</span>
          <span class="text-slate-900">${selectedVariant.name}</span>
        </div>
      ` : ''}
      <div class="flex justify-between">
        <span class="text-slate-500">الكمية:</span>
        <span class="text-slate-900 font-bold">${selectedQuantity}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-500">الولاية والعنوان:</span>
        <span class="text-slate-900">${wilayaObj.name} - ${address}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-500">طريقة التوصيل:</span>
        <span class="text-slate-900">${selectedDeliveryType === 'home' ? 'توصيل للمنزل' : 'استلام من المكتب'}</span>
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
