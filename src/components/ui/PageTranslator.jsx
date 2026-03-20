/**
 * PageTranslator v9.1 — Instant hardcoded translation + AI fallback
 *
 * CACHING:
 *  • Hardcoded dictionary (pageTranslations.js) — covers 90%+ of the site
 *  • AI fallback results cached in localStorage (bocra-tn-ai-cache) — once only
 *  • translatedTexts Set tracks every Setswana string on screen — if all
 *    visible text is already Setswana, the page is skipped entirely
 *  • pageDone flag cancels remaining scan timers once page is complete
 */
import { useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../../lib/language';
import { useLocation } from 'react-router-dom';
import TRANSLATIONS from './pageTranslations';
import { supabaseUrl_, supabaseAnonKey_ } from '../../lib/supabase';

const CHAT_API = `${supabaseUrl_}/functions/v1/chat`;
const AI_CACHE_KEY = 'bocra-tn-ai-cache';

const SKIP_TAGS = new Set([
  'SCRIPT','STYLE','NOSCRIPT','SVG','PATH','CODE','PRE',
  'INPUT','TEXTAREA','SELECT','OPTION','IFRAME','CANVAS',
]);
const SKIP_CLASSES = ['recharts','mapbox','leaflet','code-block','grecaptcha','tn-indicator'];
const DNT = new Set([
  'BOCRA','Mascom','BTC','Orange','Botswana','QoS','LTE','SMS',
  'ICT','ASMS','DNS','TLD','PDF','CSIRT','BoFiNet','NIC','NFP','SAP',
  'BWP','VAT','Omang','NIST','NVD','CVE','PPADB','IEC','TN','EN',
]);

/* ═══ Dictionary ═══ */
let _fullDict = null;
let _reverseDict = null;
let _dictVersion = 0;

function getAiCache() {
  try { return JSON.parse(localStorage.getItem(AI_CACHE_KEY) || '{}'); } catch { return {}; }
}

function buildDicts() {
  _fullDict = { ...TRANSLATIONS, ...getAiCache() };
  _reverseDict = {};
  for (const [en, tn] of Object.entries(_fullDict)) _reverseDict[tn] = en;
  _dictVersion++;
}

function getDict() { if (!_fullDict) buildDicts(); return _fullDict; }
function getReverse() { if (!_reverseDict) buildDicts(); return _reverseDict; }

function saveAiTranslation(entries) {
  if (Object.keys(entries).length === 0) return;
  try {
    const cache = getAiCache();
    Object.assign(cache, entries);
    localStorage.setItem(AI_CACHE_KEY, JSON.stringify(cache));
    // Rebuild dicts so new translations are available immediately
    buildDicts();
  } catch {}
}

/* ═══ DOM ═══ */
function collectTextNodes() {
  const nodes = [];
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const text = node.textContent.trim();
      if (!text || text.length < 2) return NodeFilter.FILTER_REJECT;
      const el = node.parentElement;
      if (!el) return NodeFilter.FILTER_REJECT;
      if (SKIP_TAGS.has(el.tagName)) return NodeFilter.FILTER_REJECT;
      if (SKIP_CLASSES.some(c => el.closest(`.${c}`))) return NodeFilter.FILTER_REJECT;
      if (/^[\d\s.,%+\-()/@:#&=?]+$/.test(text)) return NodeFilter.FILTER_REJECT;
      if (/^https?:/.test(text)) return NodeFilter.FILTER_REJECT;
      if (text.includes('@') && text.includes('.')) return NodeFilter.FILTER_REJECT;
      if (DNT.has(text)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  while (walk.nextNode()) nodes.push(walk.currentNode);
  return nodes;
}

/**
 * Apply dictionary to DOM.
 * Returns { applied: number, missing: string[] }
 * - applied: how many nodes were translated this call
 * - missing: English texts not found in any dictionary
 */
function applyDictionary() {
  const dict = getDict();
  const reverse = getReverse();
  const nodes = collectTextNodes();
  const missing = [];
  let applied = 0;

  for (const node of nodes) {
    if (!document.body.contains(node)) continue;
    const text = node.textContent.trim();

    // Already Setswana — skip completely
    if (reverse[text]) continue;

    // In dictionary — translate
    if (dict[text]) {
      node.textContent = node.textContent.replace(text, dict[text]);
      applied++;
      continue;
    }

    // Not translatable (too short, starts with number, etc.)
    if (text.length < 3 || /^\d/.test(text)) continue;

    // Genuinely missing
    if (!missing.includes(text)) missing.push(text);
  }

  return { applied, missing };
}

/**
 * Quick check: are there any untranslated English texts on the page?
 * This is a READ-ONLY scan — doesn't modify DOM. Very fast.
 */
function hasUntranslatedContent() {
  const dict = getDict();
  const reverse = getReverse();
  const nodes = collectTextNodes();

  for (const node of nodes) {
    if (!document.body.contains(node)) continue;
    const text = node.textContent.trim();
    // Already Setswana
    if (reverse[text]) continue;
    // Has a translation available but not applied yet
    if (dict[text]) return true;
    // Unknown text that's long enough to matter
    if (text.length >= 3 && !/^\d/.test(text)) return true;
  }
  return false;
}

/* ═══ Restore to English ═══ */
function restoreToEnglish() {
  const reverse = getReverse();
  if (Object.keys(reverse).length === 0) return;
  const nodes = collectTextNodes();
  for (const node of nodes) {
    if (!document.body.contains(node)) continue;
    const text = node.textContent.trim();
    if (reverse[text]) {
      node.textContent = node.textContent.replace(text, reverse[text]);
    }
  }
}

/* ═══ AI fallback ═══ */
async function translateWithAI(texts, langRef) {
  if (texts.length === 0) return {};

  const chunks = [];
  for (let i = 0; i < texts.length; i += 25) chunks.push(texts.slice(i, i + 25));

  const allMapped = {};
  const dntList = [...DNT].join(', ');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${supabaseAnonKey_}`,
    apikey: supabaseAnonKey_,
  };

  for (const chunk of chunks) {
    if (langRef.current !== 'tn') break;
    const numbered = chunk.map((t, j) => `[${j}] ${t}`).join('\n');
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      const res = await fetch(CHAT_API, {
        method: 'POST', headers,
        body: JSON.stringify({
          message: `Translate each line from English to Setswana. Keep [number] prefix. Do NOT translate: ${dntList}. Keep numbers, emails, URLs unchanged. Return ONLY translated lines.\n\n${numbered}`,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        (data.reply || '').split('\n').forEach(line => {
          const m = line.match(/^\[(\d+)\]\s*(.+)/);
          if (m) {
            const idx = parseInt(m[1]);
            if (idx < chunk.length) {
              const t = m[2].trim();
              if (t && t !== chunk[idx]) allMapped[chunk[idx]] = t;
            }
          }
        });
      }
    } catch {}
    if (chunks.length > 1) await new Promise(r => setTimeout(r, 500));
  }

  saveAiTranslation(allMapped);
  return allMapped;
}

/* ═══ Indicator ═══ */
function showIndicator(count) {
  if (document.getElementById('tn-indicator')) return;
  const el = document.createElement('div');
  el.id = 'tn-indicator';
  el.className = 'tn-indicator';
  el.style.cssText =
    'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;background:#00458B;color:white;padding:16px 28px;border-radius:16px;font-size:13px;font-weight:500;box-shadow:0 8px 32px rgba(0,0,0,0.25);display:flex;align-items:center;gap:10px;max-width:400px;text-align:left;';
  const countText = count > 0 ? ` (${count} item${count !== 1 ? 's' : ''})` : '';
  el.innerHTML =
    '<div style="width:18px;height:18px;border:2.5px solid rgba(255,255,255,0.2);border-top-color:white;border-radius:50%;animation:spin 0.7s linear infinite;flex-shrink:0;"></div>' +
    '<div><div style="font-weight:700;margin-bottom:2px;">Hold on...</div>' +
    '<div style="font-size:11px;opacity:0.7;">BOCRA Assistant is translating the page' + countText + '</div>' +
    '<div style="font-size:10px;opacity:0.4;margin-top:6px;">This may take a moment depending on the amount of content. Please bear with us.</div></div>' +
    '<style>@keyframes spin{to{transform:rotate(360deg)}}</style>';
  document.body.appendChild(el);
}
function hideIndicator() {
  document.getElementById('tn-indicator')?.remove();
}

/* ═══ Component ═══ */
export default function PageTranslator() {
  const { lang } = useLanguage();
  const location = useLocation();

  const langRef = useRef(lang);
  langRef.current = lang;
  const busy = useRef(false);
  const queued = useRef(false);
  const writing = useRef(false);
  const pageDone = useRef(false); // true once this page is fully translated
  const scanTimers = useRef([]);

  const cancelTimers = useCallback(() => {
    scanTimers.current.forEach(clearTimeout);
    scanTimers.current = [];
  }, []);

  const translatePage = useCallback(async () => {
    if (busy.current) { queued.current = true; return; }
    if (langRef.current !== 'tn') return;

    // If page is already done, do a quick read-only check for new content
    if (pageDone.current) {
      if (!hasUntranslatedContent()) return; // nothing new — truly skip
      pageDone.current = false; // new content appeared, re-process
    }

    busy.current = true;
    queued.current = false;

    await new Promise(r => setTimeout(r, 200));
    if (langRef.current !== 'tn') { busy.current = false; return; }

    // Apply dictionary
    writing.current = true;
    const { missing } = applyDictionary();
    writing.current = false;

    // Page fully translated — mark done, cancel remaining timers
    if (missing.length === 0) {
      pageDone.current = true;
      cancelTimers();
      busy.current = false;
      if (queued.current && langRef.current === 'tn') {
        queued.current = false;
        setTimeout(() => translatePage(), 300);
      }
      return;
    }

    // AI fallback
    if (langRef.current !== 'tn') { busy.current = false; return; }
    showIndicator(missing.length);

    await translateWithAI(missing, langRef);

    // Apply newly translated text
    if (langRef.current === 'tn') {
      writing.current = true;
      const result = applyDictionary();
      writing.current = false;
      if (result.missing.length === 0) {
        pageDone.current = true;
        cancelTimers();
      }
    }

    hideIndicator();
    busy.current = false;

    if (queued.current && langRef.current === 'tn') {
      queued.current = false;
      setTimeout(() => translatePage(), 300);
    }
  }, [cancelTimers]);

  // Language toggle
  useEffect(() => {
    if (lang === 'tn') {
      pageDone.current = false;
      buildDicts(); // ensure dicts include latest AI cache
      translatePage();
    } else {
      hideIndicator();
      busy.current = false;
      queued.current = false;
      pageDone.current = false;
      cancelTimers();
      writing.current = true;
      restoreToEnglish();
      writing.current = false;
    }
  }, [lang, translatePage, cancelTimers]);

  // Route change
  useEffect(() => {
    if (lang !== 'tn') return;
    pageDone.current = false;

    const delays = [300, 800, 1500, 3000, 6000];
    scanTimers.current = delays.map(d =>
      setTimeout(() => {
        if (langRef.current === 'tn' && !pageDone.current) translatePage();
      }, d),
    );
    return () => cancelTimers();
  }, [location.pathname, translatePage, cancelTimers]);

  // MutationObserver
  useEffect(() => {
    if (lang !== 'tn') return;

    let debounce = null;
    const observer = new MutationObserver((mutations) => {
      if (writing.current) return;

      const hasNew = mutations.some(m => {
        if (m.type !== 'childList' || m.addedNodes.length === 0) return false;
        for (const n of m.addedNodes) {
          if (n.id === 'tn-indicator') return false;
          if (n.nodeType === 1 && n.classList?.contains('tn-indicator')) return false;
        }
        return true;
      });
      if (!hasNew) return;

      clearTimeout(debounce);
      debounce = setTimeout(() => {
        if (langRef.current === 'tn' && !busy.current) translatePage();
      }, 1000);
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => { observer.disconnect(); clearTimeout(debounce); };
  }, [lang, translatePage]);

  return null;
}
