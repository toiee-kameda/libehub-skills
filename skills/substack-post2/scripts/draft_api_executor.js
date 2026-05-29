// ─── Substack 内部API 下書き作成ロジック ─────────────────────────
// ※ TITLE / SUBTITLE / SECTION / SEO_TITLE / SEO_DESC / URL_SLUG / BODY_MD
//    は呼び出し元の IIFE で宣言済み
//
// 使い方：
//   (async () => {
//     const TITLE    = '...';
//     const SUBTITLE = '...' or null;
//     const SECTION  = 'リベハブ' or null;
//     const SEO_TITLE = '...';
//     const SEO_DESC  = '...';
//     const URL_SLUG  = '...';
//     const BODY_MD  = `...本文Markdown...`;
//     // ↓ このファイルの内容をそのまま展開 ↓
//   })()

// ─── ① userId を JWT クッキーから自動取得 ───────────────────────
function getUserId() {
  const cookie = document.cookie.split(';')
    .map(c => c.trim())
    .find(c => c.startsWith('substack.lli='));
  if (!cookie) throw new Error('substack.lli クッキーが見つかりません。Substackにログインしてください。');
  const token = decodeURIComponent(cookie.split('=').slice(1).join('='));
  const parts = token.split('.');
  if (parts.length < 2) throw new Error('JWT の形式が不正です');
  const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
  if (!payload.id) throw new Error('JWT に id フィールドがありません');
  return payload.id;
}

// ─── ② Markdown → ProseMirror JSON ─────────────────────────────
function mdToProseMirror(md) {
  const lines = md.split('\n');
  const content = [];
  let i = 0;

  function parseInline(text) {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
    return parts.filter(Boolean).map(p => {
      if (p.startsWith('**') && p.endsWith('**')) {
        return { type: 'text', marks: [{ type: 'strong' }], text: p.slice(2, -2) };
      } else if (p.startsWith('*') && p.endsWith('*')) {
        return { type: 'text', marks: [{ type: 'em' }], text: p.slice(1, -1) };
      } else if (p.startsWith('`') && p.endsWith('`')) {
        return { type: 'text', marks: [{ type: 'code' }], text: p.slice(1, -1) };
      }
      return { type: 'text', text: p };
    });
  }

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('# ')) {
      content.push({ type: 'heading', attrs: { level: 1 },
        content: parseInline(line.slice(2)) });
    } else if (line.startsWith('## ')) {
      content.push({ type: 'heading', attrs: { level: 2 },
        content: parseInline(line.slice(3)) });
    } else if (line.startsWith('### ')) {
      content.push({ type: 'heading', attrs: { level: 3 },
        content: parseInline(line.slice(4)) });
    } else if (line.startsWith('---')) {
      content.push({ type: 'horizontal_rule' });
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      // 箇条書きをまとめて収集
      const items = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push({
          type: 'list_item',
          content: [{ type: 'paragraph', content: parseInline(lines[i].slice(2)) }]
        });
        i++;
      }
      content.push({ type: 'bullet_list', content: items });
      continue;
    } else if (/^\d+\. /.test(line)) {
      // 番号付きリストをまとめて収集
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push({
          type: 'list_item',
          content: [{ type: 'paragraph', content: parseInline(lines[i].replace(/^\d+\. /, '')) }]
        });
        i++;
      }
      content.push({ type: 'ordered_list', content: items });
      continue;
    } else if (line.trim() !== '') {
      content.push({ type: 'paragraph', content: parseInline(line) });
    }
    i++;
  }

  return { type: 'doc', attrs: { schemaVersion: 'v1' }, content };
}

// ─── ③ セクション名 → section_id の解決 ─────────────────────────
// Substack API は section_id（数値）を要求するが、手軽に取得する方法として
// /api/v1/publication/settings から sections リストを取得して照合する
async function getSectionId(sectionName) {
  if (!sectionName) return null;
  try {
    const res = await fetch('/api/v1/publication/settings', {
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) return null;
    const data = await res.json();
    const sections = data.sections || [];
    const norm = s => s.normalize('NFKC').trim().replace(/\s+/g, '');
    const wanted = norm(sectionName);
    const found = sections.find(s =>
      norm(s.name) === wanted || norm(s.name).includes(wanted)
    );
    return found ? found.id : null;
  } catch (e) {
    console.warn('⚠️ セクションID取得失敗:', e.message);
    return null;
  }
}

// ─── ④ 本処理 ───────────────────────────────────────────────────
let userId;
try {
  userId = getUserId();
} catch (e) {
  return { ok: false, error: e.message, url: location.href };
}

const sectionId = await getSectionId(SECTION);

const payload = {
  draft_title:       TITLE,
  draft_subtitle:    SUBTITLE || '',
  draft_description: SEO_DESC || '',
  draft_body:        JSON.stringify(mdToProseMirror(BODY_MD)),
  draft_bylines:     [{ id: userId, is_guest: false }],
  type:              'newsletter',
  audience:          'everyone'
};

// SEOタイトルが指定されている場合
if (SEO_TITLE && SEO_TITLE !== TITLE) {
  payload.draft_title = TITLE;         // 本文タイトルはそのまま
  // SEO専用タイトルはAPIフィールドで別途設定（Substackの制限上、draft_titleと同値で良い場合が多い）
}

// URLスラッグ
if (URL_SLUG) {
  payload.draft_slug = URL_SLUG;
}

// セクション
if (sectionId) {
  payload.section_id = sectionId;
}

let result;
try {
  const res = await fetch('/api/v1/drafts', {
    method:      'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept':       'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  if (!res.ok) {
    return {
      ok:      false,
      error:   `APIエラー ${res.status}: ${JSON.stringify(data)}`,
      url:     location.href
    };
  }

  result = {
    ok:      true,
    draftId: data.id,
    title:   data.draft_title,
    url:     `https://ccwm.substack.com/publish/post/${data.id}`
  };
} catch (e) {
  return { ok: false, error: e.message, url: location.href };
}

console.log('✅ 下書き作成完了:', result);
return result;
