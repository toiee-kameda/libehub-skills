// ─── ユーティリティ ───────────────────────────────────────────
// ※ TITLE / SUBTITLE / SECTION / SEO_TITLE / SEO_DESC / URL_SLUG / BODY_MD
//    は呼び出し元の vars.js で宣言済み

const sleep = ms => new Promise(r => setTimeout(r, ms));

function setVal(selector, value) {
  const el = document.querySelector(selector);
  if (!el) { console.warn('❌ 要素が見つかりません:', selector); return false; }
  const proto = el.tagName === 'TEXTAREA'
    ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
  el.dispatchEvent(new Event('input',  { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}

function simulatePointerClick(el) {
  const opts = { bubbles: true, cancelable: true, view: window };
  ['pointerover','pointerenter','mouseover','mouseenter',
   'pointermove','mousemove','pointerdown','mousedown',
   'pointerup','mouseup','click'
  ].forEach(type => el.dispatchEvent(new MouseEvent(type, opts)));
}

async function waitAndClickSave(timeoutMs = 3000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const btn = [...document.querySelectorAll('button')]
      .find(b => b.textContent.trim() === '保存');
    if (btn) { btn.click(); console.log('✅ 保存ボタンクリック'); return true; }
    await sleep(100);
  }
  console.warn('⚠️ 保存ボタンが出現しませんでした');
  return false;
}

async function waitSaveDone(timeoutMs = 6000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const btn = [...document.querySelectorAll('button')]
      .find(b => b.textContent.trim() === '保存');
    if (!btn) return true;
    await sleep(150);
  }
  return false;
}

function md2html(md) {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2>$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,     '<em>$1</em>')
    .replace(/`(.+?)`/g,       '<code>$1</code>')
    .replace(/^---$/gm,        '<hr>')
    .replace(/(^- .+$(\n^- .+$)*)/gm, m => {
      const items = m.split('\n').map(l => `<li>${l.replace(/^- /, '')}</li>`).join('');
      return `<ul>${items}</ul>`;
    })
    .replace(/(^\d+\. .+$(\n^\d+\. .+$)*)/gm, m => {
      const items = m.split('\n').map(l => `<li>${l.replace(/^\d+\. /, '')}</li>`).join('');
      return `<ol>${items}</ol>`;
    })
    .replace(/^(?!<[huo]|<li|<hr|<code)(.+)$/gm, '<p>$1</p>')
    .replace(/^\s*$/gm, '');
}

// ─── 本処理 ───────────────────────────────────────────────────
const R = {};

// STEP 1: エディタ確認
if (!document.querySelector('#post-title')) {
  console.error('❌ エディタが未ロード');
  return { error: 'editor_not_loaded' };
}

// STEP 2: タイトル・サブタイトル
const titleEl = document.querySelector('#post-title');
Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')
  .set.call(titleEl, TITLE);
titleEl.dispatchEvent(new Event('input',  { bubbles: true }));
titleEl.dispatchEvent(new Event('change', { bubbles: true }));
R.title = true;
R.subtitle = SUBTITLE ? setVal('textarea[placeholder="サブタイトルを追加…"]', SUBTITLE) : 'skipped';
await sleep(300);

// STEP 3: セクション選択
if (SECTION) {
  const sectionBtn = document.querySelector('[data-testid="editor-section-selector"]');
  if (sectionBtn) {
    simulatePointerClick(sectionBtn);
    await sleep(400);
    const target = [...document.querySelectorAll('[role="menuitem"]')]
      .find(el => el.textContent.trim() === SECTION);
    if (target) { target.click(); R.section = true; }
    else { console.warn('⚠️ セクションが見つかりません:', SECTION); R.section = false; }
  } else { R.section = false; }
} else { R.section = 'skipped'; }
await sleep(300);

// STEP 4: 本文ペースト
const editor = document.querySelector('[data-testid="editor"]');
if (editor) {
  editor.focus();
  const dt = new DataTransfer();
  dt.setData('text/html',  md2html(BODY_MD));
  dt.setData('text/plain', BODY_MD);
  editor.dispatchEvent(new ClipboardEvent('paste', {
    bubbles: true, cancelable: true, clipboardData: dt
  }));
  R.body = true;
} else { R.body = false; }
await sleep(400);

// STEP 5: 設定モーダルを開く
document.querySelector('[data-testid="settings-button"]')?.click();
let waited = 0;
while (!document.querySelector('input[placeholder="タグを選択または作成"]') && waited < 3000) {
  await sleep(150); waited += 150;
}
R.modal = !!document.querySelector('input[placeholder="タグを選択または作成"]');
await sleep(200);

// STEP 6: SEOアコーディオン展開
const seoAccordion = [...document.querySelectorAll('[class*="cursor-pointer"]')]
  .find(el => el.textContent.includes('SEOオプション'))
  || [...document.querySelectorAll('div')]
    .find(el => el.textContent.trim() === 'SEOオプション' && el.children.length <= 3);
if (seoAccordion) seoAccordion.click();
await sleep(400);

// STEP 7: SEOタイトル＋SEO説明文を入力・保存（Form 1）
setVal('input[placeholder="カスタムタイトルを入力..."]', SEO_TITLE);
setVal('textarea[placeholder="カスタムの説明を入力..."]', SEO_DESC);
R.seoForm1 = await waitAndClickSave();
await waitSaveDone();

// STEP 8: URLスラッグを入力・保存（Form 2）
setVal('input[name="code"]', URL_SLUG);
R.seoForm2 = await waitAndClickSave();
await waitSaveDone();

// STEP 9: 完了ボタン
const remaining = [...document.querySelectorAll('button')]
  .filter(b => b.textContent.trim() === '保存');
if (remaining.length > 0) { remaining.forEach(b => b.click()); await waitSaveDone(); }
const doneBtn = [...document.querySelectorAll('button')]
  .find(b => b.textContent.trim() === '完了');
if (doneBtn) { doneBtn.click(); R.done = true; }
else { R.done = false; }

await sleep(500);
console.log('📋 結果:', R, '| URL:', location.href);
return { ...R, url: location.href };
