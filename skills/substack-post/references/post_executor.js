// ─── ユーティリティ ───────────────────────────────────────────
// ※ TITLE / SUBTITLE / SECTION / SEO_TITLE / SEO_DESC / URL_SLUG / BODY_MD / BODY_PASTE_MODE
//    は呼び出し元の vars.js で宣言済み
//    BODY_PASTE_MODE: 'auto'（自動貼り付け）または 'manual'（本文貼り付けをスキップし、
//    ユーザー自身が手動で貼り付ける。本文が長くJavaScript実行の時間・トークンを
//    抑えたい場合に選択される）
//
// 言語設定に依存しないセレクタ方針:
//   - data-testid / name / role / class トークン（ハッシュ抜き）など、
//     Substackアプリのコンポーネント実装に由来する非表示テキストのみを使う
//   - ボタンのラベル文字列（「保存」「完了」など）や placeholder は
//     UI言語（日本語/英語など）で変わるため一切使わない
//   - 唯一の例外はセクション名（[role="menuitem"]）で、これはユーザー自身が
//     作成した名称であり UI言語に左右されないため従来どおりテキスト照合する

const sleep = ms => new Promise(r => setTimeout(r, ms));

function setVal(el, value) {
  if (!el) { console.warn('❌ 要素が見つかりません'); return false; }
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

// フォーム内に動的に出現する保存ボタン（type="submit"）を待ってクリックする。
// ボタンラベル文字列（「保存」/「Save」等）に依存しない。
async function waitAndClickSaveIn(formEl, timeoutMs = 3000) {
  if (!formEl) { console.warn('⚠️ 対象フォームが見つかりません'); return false; }
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const btn = formEl.querySelector('button[type="submit"]');
    if (btn) { btn.click(); console.log('✅ 保存ボタンクリック'); return true; }
    await sleep(100);
  }
  console.warn('⚠️ 保存ボタンが出現しませんでした（変更なし、またはUI変更の可能性）');
  return false;
}

async function waitSaveDoneIn(formEl, timeoutMs = 6000) {
  if (!formEl) return true;
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (!formEl.querySelector('button[type="submit"]')) return true;
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

// STEP 1: エディタ読み込み待機（タイトル入力欄＋本文エディタの両方を最大10秒・200ms間隔でポーリング）
let _waited = 0;
while ((!document.querySelector('[data-testid="post-title"]')
        || !document.querySelector('[data-testid="editor"]')) && _waited < 10000) {
  await sleep(200); _waited += 200;
}
if (!document.querySelector('[data-testid="post-title"]') || !document.querySelector('[data-testid="editor"]')) {
  console.error('❌ エディタが未ロード');
  return { error: 'editor_not_loaded', url: location.href };
}

// STEP 2: タイトル・サブタイトル
// タイトルは data-testid="post-title"（id="post-title" も同じ要素）。
// サブタイトルは placeholder が言語依存のため、CSSクラストークン "subtitle" で特定する。
const titleEl = document.querySelector('[data-testid="post-title"]');
setVal(titleEl, TITLE);
R.title = true;
const subtitleEl = document.querySelector('textarea.subtitle');
R.subtitle = SUBTITLE ? setVal(subtitleEl, SUBTITLE) : 'skipped';
await sleep(150);

// STEP 3: セクション選択（正規化照合）
// セクション名はユーザー自身が作成した固有名詞のため、UI言語に関係なくテキスト照合でよい。
if (SECTION) {
  const sectionBtn = document.querySelector('[data-testid="editor-section-selector"]');
  if (sectionBtn) {
    simulatePointerClick(sectionBtn);
    await sleep(400);
    const norm = s => s.normalize('NFKC').trim().replace(/\s+/g, '');
    const wanted = norm(SECTION);
    const items = [...document.querySelectorAll('[role="menuitem"]')];
    const target = items.find(el => norm(el.textContent) === wanted)
                || items.find(el => norm(el.textContent).includes(wanted));
    if (target) { target.click(); R.section = true; }
    else { console.warn('⚠️ セクションが見つかりません:', SECTION); R.section = false; }
  } else { R.section = false; }
} else { R.section = 'skipped'; }
await sleep(300);

// STEP 4: 本文ペースト
// BODY_PASTE_MODE === 'manual' の場合は、本文が長くJavaScript実行の時間・トークンを
// 消費するのを避けるため、ユーザー自身が貼り付ける前提であえてスキップする。
if (BODY_PASTE_MODE === 'manual') {
  R.body = 'skipped';
} else {
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
}
await sleep(300);

// STEP 5: 設定モーダルを開く
// モーダルの読み込み確認は、言語依存の placeholder ではなく
// role="combobox"（タグ入力欄）の出現で判定する。
document.querySelector('[data-testid="settings-button"]')?.click();
let waited = 0;
while (!document.querySelector('[data-testid="settings-modal"] [role="combobox"]') && waited < 3000) {
  await sleep(150); waited += 150;
}
const settingsModal = document.querySelector('[data-testid="settings-modal"]');
R.modal = !!document.querySelector('[data-testid="settings-modal"] [role="combobox"]');

// STEP 6: SEOアコーディオンを展開
// 見出しテキスト（「SEOオプション」/「SEO Options」）ではなく、
// Radix/Lucideの chevron アイコン（lucide-chevron-down/up）を持つ
// cursor-pointer 要素をモーダル内で特定して開閉する（言語非依存）。
let seoWrapper = null;
if (settingsModal) {
  const seoAccordion = [...settingsModal.querySelectorAll('[class*="cursor-pointer"]')]
    .find(el => el.querySelector('svg.lucide-chevron-down, svg.lucide-chevron-up'));
  if (seoAccordion) {
    seoAccordion.click();
    await sleep(300);
    seoWrapper = seoAccordion.parentElement;
  }
}
R.seoAccordion = !!seoWrapper;

// SEOアコーディオン内には <form> が2つ生成される:
//   Form 1: SEOタイトル(input) + SEO説明文(textarea)
//   Form 2: URLスラッグ(input[name="code"])
// のちに保存ボタン（button[type="submit"]、フォーム内に動的出現）をフォーム単位で待つ。
const seoForms = seoWrapper ? [...seoWrapper.querySelectorAll('form')] : [];
const titleDescForm = seoForms.find(f => f.querySelector('textarea')) || null;
const slugForm = seoForms.find(f => f.querySelector('input[name="code"]')) || null;

// STEP 7: SEOタイトル＋SEO説明文を入力・保存（Form 1）
if (titleDescForm) {
  setVal(titleDescForm.querySelector('input'), SEO_TITLE);
  setVal(titleDescForm.querySelector('textarea'), SEO_DESC);
  R.seoForm1 = await waitAndClickSaveIn(titleDescForm);
  await waitSaveDoneIn(titleDescForm);
} else { R.seoForm1 = false; }

// STEP 8: URLスラッグを入力・保存（Form 2）
if (slugForm) {
  setVal(slugForm.querySelector('input[name="code"]'), URL_SLUG);
  R.seoForm2 = await waitAndClickSaveIn(slugForm);
  await waitSaveDoneIn(slugForm);
} else { R.seoForm2 = false; }

// STEP 9: 完了ボタン
// フォーム単位で保存し損ねた submit ボタンが残っていれば先にクリックしておく。
for (const f of [titleDescForm, slugForm]) {
  const btn = f?.querySelector('button[type="submit"]');
  if (btn) { btn.click(); await waitSaveDoneIn(f); }
}
// 「完了」ボタンはラベル文字列ではなく data-modal-role="footer" 内のボタンとして特定する。
const doneBtn = document.querySelector('[data-modal-role="footer"] button');
if (doneBtn) { doneBtn.click(); R.done = true; }
else { R.done = false; }

await sleep(300);
console.log('📋 結果:', R, '| URL:', location.href);
return { ...R, url: location.href };
