// A small Markdown subset, written here rather than pulled in as a dependency
// so the repo keeps its one-devDependency shape. It covers what the posts
// actually use: headings, paragraphs, lists, quotes, fenced and inline code,
// tables, rules, images and links.

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

export function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Inline formatting runs on already-escaped text. Code spans are lifted out
// first and put back at the end, so ** or _ inside `code` stays literal.
function inline(src) {
  const spans = [];
  const HOLE = '\u0000';
  let text = escapeHtml(src).replace(/(`+)([\s\S]+?)\1/g, (_, __, code) => {
    spans.push(code.trim());
    return HOLE + (spans.length - 1) + HOLE;
  });

  text = text
    .replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g,
      (_, alt, src2) => `<img src="${src2}" alt="${alt}" loading="lazy">`)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
      const external = /^https?:\/\//.test(href) && !href.includes('onurkacmaz.com');
      const attrs = external ? ' target="_blank" rel="noopener"' : '';
      return `<a href="${href}"${attrs}>${label}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/(?<![\w*])\*([^*\n]+)\*(?![\w*])/g, '<i>$1</i>')
    .replace(/(?<![\w_])_([^_\n]+)_(?![\w_])/g, '<i>$1</i>')
    .replace(/~~([^~]+)~~/g, '<s>$1</s>')
    // A bare URL on its own is common in notes; link it rather than print it raw.
    .replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g,
      '$1<a href="$2" target="_blank" rel="noopener">$2</a>');

  return text.replace(new RegExp(HOLE + '(\\d+)' + HOLE, 'g'),
    (_, i) => `<code>${spans[Number(i)]}</code>`);
}

function listItems(lines, ordered) {
  // Items may span several lines; continuation lines fold into the item above.
  const items = [];
  const marker = ordered ? /^\s*\d+[.)]\s+(.*)$/ : /^\s*[-*+]\s+(.*)$/;
  for (const line of lines) {
    const m = line.match(marker);
    if (m) items.push([m[1]]);
    else if (items.length && line.trim()) items[items.length - 1].push(line.trim());
  }
  return items.map((parts) => `<li>${inline(parts.join(' '))}</li>`).join('');
}

function table(rows) {
  const cells = (row) => row.replace(/^\s*\|?|\|?\s*$/g, '').split('|').map((c) => c.trim());
  const head = cells(rows[0]);
  const body = rows.slice(2).map(cells);
  const th = head.map((c) => `<th>${inline(c)}</th>`).join('');
  const tb = body
    .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`)
    .join('');
  return `<div class="table-wrap"><table><thead><tr>${th}</tr></thead><tbody>${tb}</tbody></table></div>`;
}

export function renderMarkdown(src) {
  const lines = String(src).replace(/\r\n/g, '\n').split('\n');
  const out = [];
  const headings = [];
  let i = 0;

  // The post title is already the page h1. A post that opens its sections with
  // "#" is shifted down one level so nothing competes with it; a post that uses
  // "##" is left alone, so heading levels never skip a step either way.
  const depths = lines
    .filter((l) => /^#{1,6}\s+\S/.test(l))
    .map((l) => l.match(/^(#+)/)[1].length);
  const offset = depths.length && Math.min(...depths) === 1 ? 1 : 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    const fence = line.match(/^\s*(```|~~~)\s*([\w+-]*)\s*$/);
    if (fence) {
      const closer = new RegExp('^\\s*' + fence[1] + '+\\s*$');
      const buf = [];
      i++;
      while (i < lines.length && !closer.test(lines[i])) { buf.push(lines[i]); i++; }
      i++;
      const lang = fence[2] ? ` class="lang-${fence[2]}"` : '';
      out.push(`<pre><code${lang}>${escapeHtml(buf.join('\n'))}</code></pre>`);
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = Math.min(heading[1].length + offset, 6);
      const text = heading[2].trim().replace(/\s*#+\s*$/, '');
      const id = slugify(text);
      headings.push({ level, text, id });
      out.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      i++;
      continue;
    }

    if (/^\s*(?:[-*_]\s*){3,}$/.test(line)) { out.push('<hr>'); i++; continue; }

    if (/^\s*>/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*>\s?/, '')); i++;
      }
      out.push(`<blockquote>${renderMarkdown(buf.join('\n')).html}</blockquote>`);
      continue;
    }

    if (/^\s*\|.*\|\s*$/.test(line) && /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(lines[i + 1] || '')) {
      const buf = [];
      while (i < lines.length && /\|/.test(lines[i]) && lines[i].trim()) { buf.push(lines[i]); i++; }
      out.push(table(buf));
      continue;
    }

    const bullet = /^\s*[-*+]\s+/.test(line);
    const numbered = /^\s*\d+[.)]\s+/.test(line);
    if (bullet || numbered) {
      const same = (l) => (bullet ? /^\s*[-*+]\s+/ : /^\s*\d+[.)]\s+/).test(l);
      const buf = [];
      while (i < lines.length && (same(lines[i]) || (lines[i].trim() && /^\s{2,}\S/.test(lines[i])))) {
        buf.push(lines[i]); i++;
      }
      const tag = bullet ? 'ul' : 'ol';
      out.push(`<${tag} class="md-list">${listItems(buf, numbered)}</${tag}>`);
      continue;
    }

    // paragraph: everything up to the next blank line or block start
    const buf = [];
    while (
      i < lines.length && lines[i].trim() &&
      !/^\s*(?:```|~~~|#{1,6}\s|>|[-*+]\s|\d+[.)]\s)/.test(lines[i]) &&
      !/^\s*(?:[-*_]\s*){3,}$/.test(lines[i])
    ) { buf.push(lines[i].trim()); i++; }

    const text = buf.join(' ');
    // A paragraph that is only an image reads as a figure, not a line of prose.
    const onlyImage = /^!\[[^\]]*\]\([^)\s]+\)$/.test(text);
    out.push(onlyImage ? `<figure>${inline(text)}</figure>` : `<p>${inline(text)}</p>`);
  }

  return { html: out.join('\n'), headings };
}

// Plain text of a rendered post, used for the excerpt and the reading time.
export function stripMarkdown(src) {
  return String(src)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/[*_~|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
