// Blog-only styles. Everything here is built from the same tokens the rest of
// the site uses, so a post reads like the index page with prose in it.

export const BLOG_CSS = `
/* ---------- post list ---------- */
.post-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}
.post-link{
  display:flex;flex-direction:column;gap:4px;padding:12px 10px;margin:0 -10px;border-radius:10px;
  transition:background .15s ease;
}
.post-link:hover{background:var(--hover)}
.post-head{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}
.post-title{font-size:20px;line-height:28px;letter-spacing:-.01em}
.post-date{font-size:14px;line-height:22px;color:var(--muted);white-space:nowrap}
.post-lang{
  font-size:11px;line-height:18px;letter-spacing:.04em;color:var(--muted);
  border:1px solid var(--line);border-radius:5px;padding:0 5px;white-space:nowrap;
}
.post-desc{font-size:16px;line-height:24px;color:var(--muted)}
@media(max-width:560px){
  .post-title{font-size:18px;line-height:26px}
  .post-desc{font-size:15px;line-height:22px}
}
.empty{color:var(--muted);font-size:17px;line-height:28px;margin:0}

/* ---------- year groups ---------- */
.year{display:flex;flex-direction:column;gap:6px}
.year-k{font-size:14px;line-height:22px;color:var(--muted);margin:0}

/* ---------- article header ---------- */
.post-hero{display:flex;flex-direction:column;gap:12px}
.post-hero h1{font-size:32px;line-height:40px;letter-spacing:-.02em}
.post-meta{display:flex;align-items:center;flex-wrap:wrap;gap:8px;color:var(--muted);font-size:14px;line-height:22px}
.post-meta .dot{width:3px;height:3px;border-radius:50%;background:var(--muted);flex:none}
@media(max-width:520px){.post-hero h1{font-size:25px;line-height:33px}}

/* ---------- article prose ---------- */
.article{color:var(--text-2);font-size:17px;line-height:28px}
.article > *:first-child{margin-top:0}
.article p{margin:0 0 20px}
.article b{color:var(--text);font-weight:600}
.article a{
  color:var(--text);border-bottom:1px solid var(--line);padding-bottom:1px;
  transition:border-color .15s ease;
}
.article a:hover{border-bottom-color:var(--muted)}
.article h2,.article h3,.article h4,.article h5,.article h6{
  color:var(--text);font-weight:600;letter-spacing:-.01em;margin:40px 0 14px;scroll-margin-top:72px;
}
.article h2{font-size:22px;line-height:30px}
.article h3{font-size:19px;line-height:27px}
.article h4,.article h5,.article h6{font-size:17px;line-height:26px}
.article ul.md-list,.article ol.md-list{margin:0 0 20px;padding:0;display:flex;flex-direction:column;gap:10px}
.article ul.md-list{list-style:none}
.article ul.md-list li{position:relative;padding-left:19px}
.article ul.md-list li::before{content:"";position:absolute;left:4px;top:12px;width:5px;height:5px;border-radius:50%;background:var(--muted)}
.article ol.md-list{list-style:decimal;padding-left:22px}
.article ol.md-list li::marker{color:var(--muted);font-size:15px}
.article blockquote{
  margin:0 0 20px;padding:2px 0 2px 16px;border-left:2px solid var(--line);color:var(--muted);
}
.article blockquote p:last-child{margin-bottom:0}
.article hr{border:0;border-top:1px solid var(--line);margin:32px 0}
.article code{
  font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:14px;
  background:var(--hover);border-radius:5px;padding:2px 5px;color:var(--text);
}
.article pre{
  margin:0 0 20px;padding:14px 16px;background:var(--shot);border:1px solid var(--line);
  border-radius:10px;overflow-x:auto;
}
.article pre code{background:none;padding:0;font-size:13.5px;line-height:22px;color:var(--text-2)}
.article figure{margin:0 0 24px}
.article figure img,.article p img{
  border-radius:10px;border:1px solid var(--line);background:var(--shot);width:100%;
}
.table-wrap{overflow-x:auto;margin:0 0 24px;border:1px solid var(--line);border-radius:10px}
.article table{border-collapse:collapse;width:100%;font-size:15px;line-height:22px}
.article th,.article td{text-align:left;padding:10px 14px;border-bottom:1px solid var(--line)}
.article th{color:var(--text);font-weight:600;white-space:nowrap}
.article tbody tr:last-child td{border-bottom:0}
@media(max-width:520px){.article{font-size:16px;line-height:27px}}

/* ---------- article footer nav ---------- */
.post-nav{display:flex;flex-direction:column;gap:6px}
.nav-link{display:flex;flex-direction:column;gap:2px;padding:10px;margin:0 -10px;border-radius:10px;transition:background .15s ease}
.nav-link:hover{background:var(--hover)}
.nav-k{font-size:13px;line-height:20px;color:var(--muted)}
.nav-t{font-size:17px;line-height:26px}
`;
