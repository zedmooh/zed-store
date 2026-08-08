/**
 * ═══════════════════════════════════════════════════════════════
 * generateur.js — Outil d'administration : Générateur produits.json
 * ZED StOrE — COD Algérie
 * ───────────────────────────────────────────────────────────────
 * ✅ Aucun conflit avec script.js (fichiers 100% indépendants)
 * ✅ Compatible avec la structure exacte attendue par index.html
 * ✅ Génère produits.json via l'API Blob (téléchargement direct)
 * ═══════════════════════════════════════════════════════════════
 */

'use strict';

// Namespace isolé pour éviter tout conflit de variable globale avec script.js
const Gen = (() => {

  // ─── État interne ──────────────────────────────────────────────
  let _counter = 0;          // Compteur unique pour les IDs de blocs
  let _previewTimer = null;  // Debounce pour l'aperçu JSON

  // ─── Initialisation ────────────────────────────────────────────
  function init() {
    addProductBlock(); // Bloc vide par défaut au chargement
    refreshPreview();

    // Brancher le listener d'importation sur l'input file
    const importInput = document.getElementById('import-json-input');
    if (importInput) {
      importInput.addEventListener('change', _importFromFile);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION 1 : GESTION DES BLOCS PRODUIT
  // ═══════════════════════════════════════════════════════════════

  /**
   * Ajoute un nouveau bloc produit éditable dans le conteneur.
   * @param {Object} data - Données optionnelles pour préremplir le bloc
   */
  function addProductBlock(data = {}) {
    _counter++;
    const blockId = `pb-${_counter}`;
    const container = document.getElementById('products-container');
    if (!container) return;

    // Créer le wrapper
    const wrapper = document.createElement('div');
    wrapper.id = blockId;
    wrapper.className = 'product-block';
    wrapper.innerHTML = _buildBlockHTML(blockId, _counter, data);
    container.appendChild(wrapper);

    // --- Initialiser les listes dynamiques ---
    // Variants
    const variants = (data.variants && data.variants.length > 0)
      ? data.variants
      : [{ id: '', name: '' }];
    variants.forEach(v => _addVariantRow(blockId, v.id || '', v.name || ''));

    // Features
    const features = (data.features && data.features.length > 0)
      ? data.features
      : [''];
    features.forEach(f => _addFeatureRow(blockId, f));

    // Reviews
    if (data.reviews && data.reviews.length > 0) {
      data.reviews.forEach(r => _addReviewRow(blockId, r));
    }

    // --- Pré-remplir la description (doit se faire après l'insertion du HTML) ---
    const descTextarea = document.getElementById(`${blockId}-description`);
    if (descTextarea && data.description) {
      descTextarea.value = data.description;
    }

    // --- Initialiser les previews d'images ---
    for (let i = 0; i < 3; i++) {
      const imgInput = document.getElementById(`${blockId}-img-${i}`);
      if (imgInput) {
        // Pré-remplir depuis data
        if (data.images && data.images[i]) {
          imgInput.value = data.images[i];
          _updateImagePreview(blockId, i);
        }
        // Écouter les modifications
        imgInput.addEventListener('input', () => _updateImagePreview(blockId, i));
      }
    }

    // --- Écouters pour calcul de remise live ---
    ['price', 'old-price'].forEach(fieldSuffix => {
      const el = document.getElementById(`${blockId}-${fieldSuffix}`);
      if (el) el.addEventListener('input', () => _updateDiscountPreview(blockId));
    });

    _updateDiscountPreview(blockId);
    _updateProductCountBadge();
    _schedulePreviewRefresh();

    // Scroll vers le nouveau bloc (sauf le tout premier)
    if (_counter > 1) {
      setTimeout(() => {
        wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }

  /**
   * Supprime un bloc produit après confirmation.
   * @param {string} blockId
   */
  function removeProductBlock(blockId) {
    const blocks = document.querySelectorAll('.product-block');
    if (blocks.length <= 1) {
      _showToast('⚠️ يجب الإبقاء على منتج واحد على الأقل!', 'warning');
      return;
    }
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.')) return;

    const block = document.getElementById(blockId);
    if (!block) return;

    block.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    block.style.opacity = '0';
    block.style.transform = 'translateY(-12px) scale(0.98)';
    setTimeout(() => {
      block.remove();
      _updateProductCountBadge();
      _schedulePreviewRefresh();
    }, 300);
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION 2 : CONSTRUCTION HTML DU BLOC PRODUIT
  // ═══════════════════════════════════════════════════════════════

  /**
   * Construit le HTML complet d'un bloc produit éditable.
   * Reproduit fidèlement la structure visuelle de index.html.
   */
  function _buildBlockHTML(blockId, num, data = {}) {
    const d = {
      id            : _esc(data.id || ''),
      title         : _esc(data.title || ''),
      subtitle      : _esc(data.subtitle || ''),
      price         : data.price != null ? data.price : '',
      old_price     : data.old_price != null ? data.old_price : '',
      currency      : _esc(data.currency || 'د.ج'),
      rating        : data.rating != null ? data.rating : 4.9,
      reviews_count : data.reviews_count != null ? data.reviews_count : 0,
      stock_remaining: data.stock_remaining != null ? data.stock_remaining : 5,
      badge         : _esc(data.badge || ''),
    };

    return `
      <!-- ▌ EN-TÊTE DU BLOC ──────────────────────────────── -->
      <div class="bg-gradient-to-r from-slate-800 to-slate-900 px-5 py-3.5 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="block-num">${num}</div>
          <div>
            <span class="text-white font-bold text-sm">منتج رقم ${num}</span>
            <span class="mr-2 bg-slate-700/80 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded-md">
              id: <span class="${blockId}-id-preview text-emerald-400">${d.id || '...'}</span>
            </span>
          </div>
        </div>
        <button onclick="Gen.removeProductBlock('${blockId}')"
          class="text-red-400 hover:text-red-300 hover:bg-red-900/30 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
          حذف المنتج
        </button>
      </div>

      <!-- ▌ SECTION 1 : INFORMATIONS DE BASE ──────────────── -->
      <div class="p-5 border-b border-slate-100 space-y-4">
        <p class="section-title">
          <svg class="w-3.5 h-3.5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          المعلومات الأساسية
        </p>
        <!-- ID + Badge -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="gen-label" for="${blockId}-id">🔑 معرّف المنتج (ID) *</label>
            <input type="text" id="${blockId}-id" class="gen-input font-mono text-sm"
              value="${d.id}" placeholder="مثال: collier-lune, montre-homme..."
              oninput="document.querySelectorAll('.${blockId}-id-preview').forEach(el => el.textContent = this.value || '...')" />
            <span class="text-[10px] text-slate-400 block mt-1">بدون مسافات — يُستخدم في رابط: <code class="font-mono text-brand-600">?id=</code></span>
          </div>
          <div>
            <label class="gen-label" for="${blockId}-badge">🏷️ الشارة / Badge</label>
            <input type="text" id="${blockId}-badge" class="gen-input text-sm"
              value="${d.badge}" placeholder="الأكثر مبيعاً 🔥" />
          </div>
        </div>
        <!-- Titre -->
        <div>
          <label class="gen-label" for="${blockId}-title">📝 عنوان المنتج (Title) *</label>
          <input type="text" id="${blockId}-title" class="gen-input text-base font-black text-slate-900"
            value="${d.title}" placeholder="مثال: قلادة هلال القمر المطلي بالذهب عيار 18..." />
        </div>
        <!-- Sous-titre -->
        <div>
          <label class="gen-label" for="${blockId}-subtitle">💬 وصف قصير (Subtitle)</label>
          <input type="text" id="${blockId}-subtitle" class="gen-input text-sm text-slate-600"
            value="${d.subtitle}" placeholder="لمسة أناقة ساحرة تناسب جميع المناسبات..." />
        </div>
        <!-- Rating, Reviews Count, Stock, Currency -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label class="gen-label" for="${blockId}-rating">⭐ التقييم (1–5)</label>
            <input type="number" id="${blockId}-rating" class="gen-input text-sm"
              value="${d.rating}" min="1" max="5" step="0.1" placeholder="4.9" />
          </div>
          <div>
            <label class="gen-label" for="${blockId}-reviews-count">💬 عدد التقييمات</label>
            <input type="number" id="${blockId}-reviews-count" class="gen-input text-sm"
              value="${d.reviews_count}" min="0" step="1" placeholder="128" />
          </div>
          <div>
            <label class="gen-label" for="${blockId}-stock">📦 المخزون المتبقي</label>
            <input type="number" id="${blockId}-stock" class="gen-input text-sm"
              value="${d.stock_remaining}" min="0" step="1" placeholder="5" />
          </div>
          <div>
            <label class="gen-label" for="${blockId}-currency">💱 العملة</label>
            <input type="text" id="${blockId}-currency" class="gen-input text-sm"
              value="${d.currency}" placeholder="د.ج" />
          </div>
        </div>
      </div>

      <!-- ▌ SECTION 2 : IMAGES (clone de la galerie Landing Page) -->
      <div class="p-5 border-b border-slate-100 space-y-4">
        <p class="section-title">
          <svg class="w-3.5 h-3.5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          الصور (روابط URL — تظهر في معرض Landing Page)
        </p>
        <div class="grid grid-cols-3 gap-3">
          ${[0, 1, 2].map(i => `
            <div class="space-y-2">
              <!-- Preview box (visuel identique à la galerie de la Landing Page) -->
              <div class="img-preview-box" id="${blockId}-img-preview-${i}">
                <img id="${blockId}-img-thumb-${i}" src="" alt="" />
                <div class="placeholder-txt">
                  <svg class="w-8 h-8 text-slate-300 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  ${i === 0 ? '⭐ رئيسية' : `صورة ${i + 1}`}
                </div>
              </div>
              <div>
                <label class="gen-label">${i === 0 ? '🌟 رابط الصورة الرئيسية *' : `رابط الصورة ${i + 1} (اختياري)`}</label>
                <input type="url" id="${blockId}-img-${i}" class="gen-input text-[11px]"
                  placeholder="https://images.unsplash.com/..." />
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- ▌ SECTION 3 : PRIX (clone du bloc vert de Landing Page) ── -->
      <div class="p-5 border-b border-slate-100 bg-gradient-to-br from-emerald-900/5 to-transparent space-y-4">
        <p class="section-title">
          <svg class="w-3.5 h-3.5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          الأسعار والخصم
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="gen-label" for="${blockId}-price">💵 السعر الحالي بالدينار (د.ج) *</label>
            <input type="number" id="${blockId}-price" class="gen-input text-2xl font-black text-amber-600"
              value="${d.price}" min="0" step="50" placeholder="3200" />
          </div>
          <div>
            <label class="gen-label" for="${blockId}-old-price">🏷️ السعر الأصلي قبل الخصم</label>
            <input type="number" id="${blockId}-old-price" class="gen-input text-xl font-bold text-slate-500"
              value="${d.old_price}" min="0" step="50" placeholder="4800" />
          </div>
        </div>
        <!-- Aperçu remise (calculé en live) -->
        <div id="${blockId}-discount-preview" class="text-xs text-slate-500 font-semibold min-h-[22px]"></div>
      </div>

      <!-- ▌ SECTION 4 : VARIANTES (clone des "chips" de sélection) ── -->
      <div class="p-5 border-b border-slate-100 space-y-3">
        <p class="section-title">
          <svg class="w-3.5 h-3.5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
          الخيارات / Variants
        </p>
        <div id="${blockId}-variants-list" class="space-y-2"></div>
        <button type="button" onclick="Gen._addVariantRow('${blockId}')" class="add-row-btn">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
          إضافة خيار
        </button>
      </div>

      <!-- ▌ SECTION 5 : CARACTÉRISTIQUES (clone de la checklist) ──── -->
      <div class="p-5 border-b border-slate-100 space-y-3">
        <p class="section-title">
          <svg class="w-3.5 h-3.5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          مميزات المنتج (Features)
        </p>
        <div id="${blockId}-features-list" class="space-y-2"></div>
        <button type="button" onclick="Gen._addFeatureRow('${blockId}')" class="add-row-btn">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
          إضافة ميزة
        </button>
      </div>

      <!-- ▌ SECTION 6 : DESCRIPTION COMPLÈTE ─────────────────────── -->
      <div class="p-5 border-b border-slate-100 space-y-3">
        <p class="section-title">
          <svg class="w-3.5 h-3.5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/></svg>
          الوصف التفصيلي للمنتج
        </p>
        <div>
          <label class="gen-label" for="${blockId}-description">وصف كامل يظهر في صفحة المنتج</label>
          <textarea id="${blockId}-description" class="gen-input text-sm leading-relaxed"
            rows="4" placeholder="أكتب وصفاً تفصيلياً للمنتج: المواد، الاستخدام، المزايا..."></textarea>
        </div>
      </div>

      <!-- ▌ SECTION 7 : AVIS CLIENTS (clone de la section reviews) ── -->
      <div class="p-5 space-y-3">
        <p class="section-title">
          <svg class="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          آراء وتقييمات العملاء
        </p>
        <div id="${blockId}-reviews-list" class="space-y-3"></div>
        <button type="button" onclick="Gen._addReviewRow('${blockId}')" class="add-row-btn">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
          إضافة تقييم
        </button>
      </div>
    `;
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION 3 : LISTES DYNAMIQUES (variants, features, reviews)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Ajoute une ligne de variant à un bloc.
   */
  function _addVariantRow(blockId, varId = '', varName = '') {
    const list = document.getElementById(`${blockId}-variants-list`);
    if (!list) return;
    const row = document.createElement('div');
    row.className = 'flex items-end gap-2';
    row.innerHTML = `
      <div class="flex-1">
        <label class="gen-label">معرّف الخيار (ID)</label>
        <input type="text" class="gen-input variant-id text-[11px] font-mono"
          value="${_esc(varId)}" placeholder="gold-18k, silver-925..." />
      </div>
      <div class="flex-1">
        <label class="gen-label">اسم الخيار (Name)</label>
        <input type="text" class="gen-input variant-name text-sm"
          value="${_esc(varName)}" placeholder="ذهب عيار 18 (Gold 18K)" />
      </div>
      <button type="button" onclick="this.closest('.flex').remove()" class="remove-row-btn mb-1" title="حذف">✕</button>
    `;
    list.appendChild(row);
  }

  /**
   * Ajoute une ligne de feature (caractéristique produit).
   */
  function _addFeatureRow(blockId, text = '') {
    const list = document.getElementById(`${blockId}-features-list`);
    if (!list) return;
    const row = document.createElement('div');
    row.className = 'flex items-center gap-2';
    row.innerHTML = `
      <div class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <input type="text" class="gen-input feature-text text-sm flex-1"
        value="${_esc(text)}" placeholder="مثال: ضمان جودة لمدة سنة كاملة من تاريخ الشراء" />
      <button type="button" onclick="this.closest('.flex').remove()" class="remove-row-btn" title="حذف">✕</button>
    `;
    list.appendChild(row);
  }

  /**
   * Ajoute une carte d'avis client.
   * @param {string} blockId
   * @param {Object} data - {author, comment, rating, date}
   */
  function _addReviewRow(blockId, data = {}) {
    const list = document.getElementById(`${blockId}-reviews-list`);
    if (!list) return;
    const row = document.createElement('div');
    row.className = 'review-card space-y-3';
    row.innerHTML = `
      <div class="flex items-center justify-between border-b border-slate-200 pb-2">
        <span class="text-xs font-bold text-slate-600 flex items-center gap-1">
          <svg class="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          تقييم عميل
        </span>
        <button type="button" onclick="this.closest('.review-card').remove()"
          class="text-red-400 hover:bg-red-50 text-xs font-bold px-2 py-0.5 rounded-md transition">✕ حذف</button>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="gen-label">اسم العميل</label>
          <input type="text" class="gen-input review-author text-sm"
            value="${_esc(data.author || '')}" placeholder="أمينة - الجزائر العاصمة" />
        </div>
        <div>
          <label class="gen-label">تاريخ التقييم</label>
          <input type="text" class="gen-input review-date text-sm"
            value="${_esc(data.date || '')}" placeholder="منذ يومين" />
        </div>
      </div>
      <div>
        <label class="gen-label">التقييم من 5 نجوم</label>
        <input type="number" class="gen-input review-rating text-sm"
          value="${data.rating || 5}" min="1" max="5" step="1" />
      </div>
      <div>
        <label class="gen-label">نص التقييم / التعليق</label>
        <textarea class="gen-input review-comment text-sm" rows="2"
          placeholder="ما شاء الله المنتج روعة...">${_esc(data.comment || '')}</textarea>
      </div>
    `;
    list.appendChild(row);
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION 4 : PREVIEWS VISUELS (image + remise)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Met à jour la vignette d'aperçu d'image.
   */
  function _updateImagePreview(blockId, index) {
    const input  = document.getElementById(`${blockId}-img-${index}`);
    const thumb  = document.getElementById(`${blockId}-img-thumb-${index}`);
    const box    = document.getElementById(`${blockId}-img-preview-${index}`);
    if (!input || !thumb || !box) return;

    const url = input.value.trim();
    const placeholder = box.querySelector('.placeholder-txt');

    if (url) {
      thumb.src = url;
      thumb.style.display = 'block';
      if (placeholder) placeholder.style.display = 'none';

      thumb.onerror = () => {
        thumb.style.display = 'none';
        if (placeholder) placeholder.style.display = 'flex';
      };
      thumb.onload = () => {
        thumb.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';
      };
    } else {
      thumb.src = '';
      thumb.style.display = 'none';
      if (placeholder) placeholder.style.display = 'flex';
    }
    _schedulePreviewRefresh();
  }

  /**
   * Calcule et affiche la remise en direct.
   */
  function _updateDiscountPreview(blockId) {
    const priceEl    = document.getElementById(`${blockId}-price`);
    const oldPriceEl = document.getElementById(`${blockId}-old-price`);
    const previewEl  = document.getElementById(`${blockId}-discount-preview`);
    if (!previewEl) return;

    const price    = parseFloat(priceEl?.value) || 0;
    const oldPrice = parseFloat(oldPriceEl?.value) || 0;

    if (price > 0 && oldPrice > 0 && oldPrice > price) {
      const pct = Math.round(((oldPrice - price) / oldPrice) * 100);
      const saving = oldPrice - price;
      previewEl.innerHTML = `
        <span class="discount-badge">توفير ${pct}% (${saving.toLocaleString('ar-DZ')} د.ج)</span>
      `;
    } else {
      previewEl.innerHTML = '';
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION 5 : COLLECTE DES DONNÉES & GÉNÉRATION JSON
  // ═══════════════════════════════════════════════════════════════

  /**
   * Collecte toutes les données d'un bloc produit et retourne un objet JS.
   * Respecte EXACTEMENT la structure attendue par script.js / Landing Page.
   * @param {string} blockId
   * @returns {Object|null}
   */
  function _collectProductData(blockId) {
    const block = document.getElementById(blockId);
    if (!block) return null;

    // Helper : lire valeur d'un input par suffix d'ID
    const val = (suffix) => {
      const el = document.getElementById(`${blockId}-${suffix}`);
      return el ? el.value.trim() : '';
    };
    const num = (suffix, fallback = 0) => {
      const v = parseFloat(val(suffix));
      return isNaN(v) ? fallback : v;
    };

    // --- Images ---
    const images = [0, 1, 2]
      .map(i => val(`img-${i}`))
      .filter(url => url.length > 0);

    // --- Variants ---
    const variantRows = block.querySelectorAll(`#${blockId}-variants-list .flex`);
    const variants = Array.from(variantRows)
      .map(row => ({
        id  : (row.querySelector('.variant-id')?.value  || '').trim(),
        name: (row.querySelector('.variant-name')?.value || '').trim()
      }))
      .filter(v => v.id && v.name);

    // --- Features ---
    const features = Array.from(
      block.querySelectorAll(`#${blockId}-features-list .feature-text`)
    )
      .map(inp => inp.value.trim())
      .filter(f => f.length > 0);

    // --- Reviews ---
    const reviews = Array.from(
      block.querySelectorAll(`#${blockId}-reviews-list .review-card`)
    ).map(card => ({
      author : (card.querySelector('.review-author')?.value  || '').trim(),
      comment: (card.querySelector('.review-comment')?.value || '').trim(),
      rating : parseInt(card.querySelector('.review-rating')?.value || '5', 10),
      date   : (card.querySelector('.review-date')?.value    || '').trim()
    })).filter(r => r.author || r.comment);

    const price    = num('price', 0);
    const oldPrice = num('old-price', 0);

    return {
      id             : val('id')       || `produit-${blockId}`,
      title          : val('title')    || 'منتج بدون عنوان',
      subtitle       : val('subtitle'),
      price          : price,
      old_price      : oldPrice > 0 ? oldPrice : price,
      currency       : val('currency') || 'د.ج',
      rating         : num('rating', 4.9),
      reviews_count  : Math.round(num('reviews-count', 0)),
      stock_remaining: Math.round(num('stock', 5)),
      badge          : val('badge'),
      images         : images.length > 0 ? images : [],
      variants       : variants,
      description    : val('description'),
      features       : features,
      reviews        : reviews
    };
  }

  /**
   * Génère le fichier produits.json et force le téléchargement.
   * Utilise l'API Blob — aucun serveur requis.
   */
  function generateAndDownload() {
    const blocks = document.querySelectorAll('.product-block');
    if (blocks.length === 0) {
      _showToast('⚠️ لا توجد منتجات للتصدير!', 'warning');
      return;
    }

    // Collecter les données
    const products = [];
    const errors   = [];

    blocks.forEach((block, index) => {
      const data = _collectProductData(block.id);
      if (!data) return;

      // Validation minimale
      if (!data.id || data.id.startsWith('produit-pb-')) {
        errors.push(`المنتج ${index + 1}: معرّف ID مفقود أو غير صالح`);
      }
      if (!data.title || data.title === 'منتج بدون عنوان') {
        errors.push(`المنتج ${index + 1}: عنوان المنتج مفقود`);
      }
      if (data.price === 0) {
        errors.push(`المنتج ${index + 1}: سعر المنتج = 0`);
      }
      if (data.images.length === 0) {
        errors.push(`المنتج ${index + 1}: لا توجد صورة رئيسية`);
      }

      products.push(data);
    });

    // Avertissement si erreurs
    if (errors.length > 0) {
      const msg = `⚠️ تحذيرات في البيانات:\n\n${errors.join('\n')}\n\nهل تريد المتابعة وتنزيل الملف على أي حال؟`;
      if (!confirm(msg)) return;
    }

    // Sérialiser en JSON indenté (lisible)
    const jsonString = JSON.stringify(products, null, 2);

    // ─── API Blob : Créer le fichier virtuel et forcer le téléchargement ───
    const blob = new Blob([jsonString], { type: 'application/json; charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href     = blobUrl;
    anchor.download = 'produits.json';  // Nom exact attendu par Landing Page
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    // Libérer la mémoire
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

    // Feedback
    _showToast(
      `✅ تم تنزيل produits.json بنجاح! (${products.length} ${products.length === 1 ? 'منتج' : 'منتجات'})`,
      'success'
    );
    refreshPreview();
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION 6 : APERÇU JSON EN TEMPS RÉEL
  // ═══════════════════════════════════════════════════════════════

  /**
   * Rafraîchit l'aperçu JSON dans le panneau de contrôle.
   */
  function refreshPreview() {
    const preview = document.getElementById('json-preview');
    if (!preview) return;

    const blocks = document.querySelectorAll('.product-block');
    if (blocks.length === 0) {
      preview.textContent = '// لا توجد منتجات بعد';
      return;
    }

    try {
      const products = Array.from(blocks)
        .map(b => _collectProductData(b.id))
        .filter(Boolean);

      preview.textContent = JSON.stringify(products, null, 2);
    } catch (err) {
      preview.textContent = `// ⚠️ خطأ في توليد JSON: ${err.message}`;
    }
  }

  /**
   * Debounce : déclenche l'aperçu 800ms après la dernière saisie.
   */
  function _schedulePreviewRefresh() {
    clearTimeout(_previewTimer);
    _previewTimer = setTimeout(refreshPreview, 800);
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION 7 : UTILITAIRES
  // ═══════════════════════════════════════════════════════════════

  /**
   * Met à jour le badge de compteur de produits dans le header.
   */
  function _updateProductCountBadge() {
    const badge = document.getElementById('product-count-badge');
    if (!badge) return;
    const count = document.querySelectorAll('.product-block').length;
    badge.textContent = `${count} ${count === 1 ? 'منتج' : 'منتجات'}`;
  }

  /**
   * Échappe les caractères HTML dangereux pour l'injection sécurisée dans innerHTML.
   */
  function _esc(str) {
    if (!str && str !== 0) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Affiche une notification toast temporaire.
   * @param {string} message
   * @param {'success'|'warning'|'error'} type
   */
  function _showToast(message, type = 'success') {
    const colors = {
      success : 'background: #0f172a; color: white;',
      warning : 'background: #92400e; color: #fef3c7;',
      error   : 'background: #7f1d1d; color: #fecaca;'
    };

    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.style.cssText = colors[type] || colors.success;
    toast.innerHTML = `<span>${message}</span>`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('show'));
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 350);
    }, 4000);
  }

  /**
   * Scroll vers le panneau de contrôle.
   */
  function scrollToControls() {
    const panel = document.getElementById('control-panel');
    if (panel) panel.scrollIntoView({ behavior: 'smooth' });
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION 8 : CHARGEMENT / IMPORTATION DE produits.json
  // ═══════════════════════════════════════════════════════════════

  /**
   * Utilitaire commun : vide le conteneur et hydrate les blocs.
   * @param {Array} products - Tableau d'objets produit
   * @param {string} sourceName - Nom à afficher dans le toast
   */
  function _hydrateProducts(products, sourceName) {
    // Vider le conteneur + reset compteur
    const container = document.getElementById('products-container');
    if (container) container.innerHTML = '';
    _counter = 0;

    // Créer un bloc par produit
    products.forEach(productData => addProductBlock(productData));

    // Mettre à jour le label import
    const btnLabel = document.getElementById('import-btn-label');
    if (btnLabel) {
      btnLabel.innerHTML = `
        <svg class="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span class="text-emerald-700">تم تحميل: ${_esc(sourceName)}</span>
        <span class="text-slate-400">(${products.length} منتج)</span>
      `;
    }

    refreshPreview();
    _showToast(`✅ تم استيراد ${products.length} منتج/منتجات من "${sourceName}" بنجاح!`, 'success');

    // Scroll vers les produits
    setTimeout(() => {
      const top = document.getElementById('products-container');
      if (top) top.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  }

  /**
   * Charge produits.json directement depuis le serveur Vite (public/).
   * Méthode la plus fiable — pas besoin de file picker.
   */
  function loadFromServer() {
    _showToast('⏳ جارٍ تحميل produits.json...', 'warning');

    fetch('./produits.json?_t=' + Date.now())  // cache-buster
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status} — الملف غير موجود في public/`);
        return res.json();
      })
      .then(products => {
        if (!Array.isArray(products)) {
          throw new Error('الملف لا يحتوي على مصفوفة منتجات صالحة');
        }
        if (products.length === 0) {
          throw new Error('الملف فارغ — لا يحتوي على أي منتج');
        }
        // Charger directement (clic = confirmation implicite)
        _hydrateProducts(products, 'produits.json');
      })
      .catch(err => {
        alert('⚠️ خطأ في تحميل الملف من الخادم:\n\n' + err.message +
          '\n\nتأكد أن الملف موجود في: public/produits.json');
      });
  }

  /**
   * Lit un fichier .json sélectionné par l'utilisateur via l'API FileReader,
   * vide le conteneur, puis hydrate un bloc par produit importé.
   * @param {Event} event - L'événement 'change' de l'input[type=file]
   */
  function _importFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const btnLabel = document.getElementById('import-btn-label');

    // Vérification de l'extension (double sécurité)
    if (!file.name.toLowerCase().endsWith('.json')) {
      alert('⚠️ خطأ: الملف المحدد ليس ملف JSON.\nيرجى اختيار ملف بصيغة .json فقط.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();

    // ─── Lecture réussie ─────────────────────────────────────────
    reader.onload = function (e) {
      let products;

      // 1. Parsing JSON avec gestion d'erreur
      try {
        products = JSON.parse(e.target.result);
      } catch (parseErr) {
        alert(
          '⚠️ خطأ في قراءة الملف: الملف المحدد لا يحتوي على JSON صالح.\n\n' +
          'تفاصيل الخطأ: ' + parseErr.message
        );
        event.target.value = '';
        if (btnLabel) btnLabel.textContent = '📂 استيراد ملف produits.json موجود';
        return;
      }

      // 2. Validation : doit être un tableau
      if (!Array.isArray(products)) {
        alert(
          '⚠️ تنسيق غير صحيح: الملف لا يحتوي على مصفوفة منتجات (Array).\n' +
          'تأكد أن الملف هو produits.json الصحيح الخاص بهذا المشروع.'
        );
        event.target.value = '';
        if (btnLabel) btnLabel.textContent = '📂 استيراد ملف produits.json موجود';
        return;
      }

      // 3. Validation : tableau non vide
      if (products.length === 0) {
        alert('⚠️ الملف المحدد فارغ — لا يحتوي على أي منتج.');
        event.target.value = '';
        return;
      }

      // 4. Confirmation si des blocs existent déjà
      const currentCount = document.querySelectorAll('.product-block').length;
      if (currentCount > 0) {
        const confirmed = confirm(
          `سيتم مسح ${currentCount} منتج/منتجات موجود/ة حالياً\n` +
          `وتحميل ${products.length} منتج/منتجات من الملف "${file.name}".\n\n` +
          `هل أنت متأكد من المتابعة؟`
        );
        if (!confirmed) {
          event.target.value = '';
          if (btnLabel) btnLabel.textContent = '📂 استيراد ملف produits.json موجود';
          return;
        }
      }

      // 5. Vider le conteneur existant + réinitialiser le compteur
      const container = document.getElementById('products-container');
      if (container) container.innerHTML = '';
      _counter = 0;

      // 6. Hydratation : créer un bloc pour chaque produit importé
      products.forEach(productData => addProductBlock(productData));

      // 7. Mettre à jour le label du bouton avec le nom du fichier
      if (btnLabel) {
        btnLabel.innerHTML = `
          <svg class="w-4 h-4 text-brand-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span class="text-brand-700">تم تحميل: ${_esc(file.name)}</span>
          <span class="text-slate-400">(${products.length} منتج)</span>
        `;
      }

      // 8. Rafraîchir l'aperçu JSON
      refreshPreview();

      // 9. Feedback toast + scroll vers le haut
      _showToast(
        `✅ تم استيراد ${products.length} منتج/منتجات من "${file.name}" بنجاح!`,
        'success'
      );
      const productsSection = document.getElementById('products-container');
      if (productsSection) {
        setTimeout(() => productsSection.scrollIntoView({ behavior: 'smooth' }), 200);
      }
    };

    // ─── Erreur de lecture du fichier ────────────────────────────
    reader.onerror = function () {
      alert('⚠️ حدث خطأ أثناء قراءة الملف. يرجى المحاولة مرة أخرى.');
      event.target.value = '';
      if (btnLabel) btnLabel.textContent = '📂 استيراد ملف produits.json موجود';
    };

    // Lancer la lecture en UTF-8
    reader.readAsText(file, 'UTF-8');
  }

  // ─── API publique exposée sous l'espace de noms Gen ──────────
  return {
    // Publique (appelé depuis HTML)
    init,
    addProductBlock,
    removeProductBlock,
    generateAndDownload,
    refreshPreview,
    scrollToControls,
    loadFromServer,
    // Semi-privé (appelé depuis le HTML généré dynamiquement)
    _addVariantRow,
    _addFeatureRow,
    _addReviewRow,
    // Import (lié par onchange dans HTML)
    _importFromFile,
  };

})(); // Fin du module Gen

// ─── Démarrage au chargement de la page ──────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // 1. Bloc produit vide par défaut
  Gen.addProductBlock();

  // 2. Rafraîchissement live sur tous les inputs des blocs
  const container = document.getElementById('products-container');
  if (container) {
    container.addEventListener('input', () => {
      clearTimeout(window._genDebounce);
      window._genDebounce = setTimeout(() => Gen.refreshPreview(), 800);
    });
  }

  // 3. Aperçu initial
  Gen.refreshPreview();
});


