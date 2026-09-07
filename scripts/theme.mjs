// The parts of the page that every blog page shares with index.html: the
// design tokens, the sticky top bar and the two inline scripts. index.html
// stays hand-written and self-contained, so these are kept byte-compatible
// with it rather than extracted out of it.

export const HEAD_SCRIPT =
  `<script>try{if(localStorage.getItem('theme')==='dark'){document.documentElement.setAttribute('data-theme','dark');document.querySelector('meta[name="theme-color"]').setAttribute('content','#0d0d0d')}}catch(e){}</script>`;

export const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">`;

export const BASE_CSS = `:root{
  color-scheme:light;
  --bg:#fff;
  --text:#171717;
  --text-2:#525252;
  --muted:#767676;
  --line:#ebebeb;
  --hover:#f5f5f5;
  --shot:#fafafa;
  --bar:rgba(255,255,255,.85);
  --col:768px;
}
html[data-theme="dark"]{
  color-scheme:dark;
  --bg:#0d0d0d;
  --text:#ededed;
  --text-2:#a3a3a3;
  --muted:#9b9b9b;
  --line:#262626;
  --hover:#1a1a1a;
  --shot:#141414;
  --bar:rgba(13,13,13,.85);
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{
  margin:0;background:var(--bg);color:var(--text);
  font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  font-size:16px;line-height:24px;-webkit-font-smoothing:antialiased;
}
img{max-width:100%;display:block}
a{color:inherit;text-decoration:none}
button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer}
:focus-visible{outline:2px solid var(--text);outline-offset:2px;border-radius:8px}

/* ---------- sticky top bar ---------- */
.topbar{
  position:sticky;top:0;z-index:20;height:56px;background:var(--bar);
  backdrop-filter:blur(8px);border-bottom:1px solid transparent;transition:border-color .2s ease;
}
.topbar.scrolled{border-bottom-color:var(--line)}
.topbar-in{
  max-width:var(--col);margin:0 auto;height:100%;padding:0 16px;
  display:flex;align-items:center;justify-content:space-between;gap:12px;
}
.bar-left{display:flex;align-items:center;gap:10px;min-width:0}
.brand{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600;min-width:0;flex:none}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.brand img{width:22px;height:22px;border-radius:50%;object-fit:cover;flex:none}
.brand span.name{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

/* ---------- socials ---------- */
.socials{display:flex;align-items:center;gap:2px}
.soc{
  width:30px;height:30px;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;
  color:var(--text-2);transition:background .15s ease,color .15s ease;
}
.soc:hover{background:var(--hover);color:var(--text)}
.soc svg{width:17px;height:17px}
.bar-right{display:flex;align-items:center;gap:6px}
.bar-link{
  font-size:14px;line-height:22px;color:var(--text-2);padding:4px 8px;border-radius:6px;
  transition:background .15s ease,color .15s ease;white-space:nowrap;
}
.bar-link:hover{background:var(--hover);color:var(--text)}
.bar-link[aria-current="page"]{color:var(--text)}
.theme-btn{
  width:30px;height:30px;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;
  color:var(--text-2);transition:background .15s ease,color .15s ease;flex:none;
}
.theme-btn:hover{background:var(--hover);color:var(--text)}
.theme-btn svg{width:17px;height:17px}
html:not([data-theme="dark"]) .icon-sun{display:none}
html[data-theme="dark"] .icon-moon{display:none}
@media(max-width:430px){
  .bar-left{gap:4px}
  .socials .soc{width:27px;height:27px}
  .socials .soc svg{width:16px;height:16px}
  .brand span.name{font-size:13px}
}
@media(max-width:340px){.brand span.name{display:none}}

/* ---------- layout ---------- */
main{max-width:var(--col);margin:0 auto;padding:36px 16px 96px;display:flex;flex-direction:column;gap:56px}
.block{display:flex;flex-direction:column;gap:16px}
h1{font-size:24px;line-height:32px;font-weight:600;margin:0;letter-spacing:-.01em}
.label{font-size:16px;line-height:24px;font-weight:400;color:var(--muted);margin:0}
.lead{font-size:24px;line-height:32px;font-weight:600;color:var(--text-2);margin:0;letter-spacing:-.01em}
@media(max-width:520px){
  h1,.lead{font-size:21px;line-height:29px}
  main{padding:26px 16px 64px;gap:44px}
}
ul.list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}
.tag{font-size:13px;line-height:20px;color:var(--text-2);background:var(--hover);border-radius:6px;padding:2px 8px}
.meta-row{display:flex;align-items:flex-start;flex-wrap:wrap;gap:6px}
footer{max-width:var(--col);margin:0 auto;padding:0 16px 64px;color:var(--muted);font-size:14px;line-height:22px}
footer a{border-bottom:1px solid var(--line);padding-bottom:1px;transition:border-color .15s ease}
footer a:hover{border-bottom-color:var(--muted)}`;

const SOCIAL_ICONS = [
  ['https://github.com/onurkacmaz', 'GitHub',
    '<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>'],
  ['https://x.com/onurkcmz', 'X',
    '<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>'],
  ['https://www.linkedin.com/in/onurkcmz', 'LinkedIn',
    '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>'],
  ['https://www.instagram.com/onrkacmaz/', 'Instagram',
    '<path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm7.846-10.405a1.441 1.441 0 01-2.881 0 1.441 1.441 0 012.881 0z"/>'],
  ['mailto:kacmaz.onur@hotmail.com', 'Email',
    '<path d="M1.5 4.5h21v15h-21v-15Zm1.8 1.8v.62l8.7 5.6 8.7-5.6V6.3H3.3Zm17.4 3.13-7.72 4.97a1.8 1.8 0 0 1-1.96 0L3.3 9.43v8.27h17.4V9.43Z"/>'],
];

function socials() {
  return SOCIAL_ICONS.map(([href, label, path]) => {
    const ext = href.startsWith('http') ? ' target="_blank" rel="noopener"' : '';
    return `<a class="soc" href="${href}"${ext} aria-label="${label}"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">${path}</svg></a>`;
  }).join('\n        ');
}

// `current` marks the Writing link when the page being rendered is a blog page.
export function topbar({ current = '' } = {}) {
  return `<div class="topbar" id="topbar">
  <div class="topbar-in">
    <div class="bar-left">
      <a class="brand" href="/"><img src="/img/portrait.jpg" alt=""><span class="name">Onur Kaçmaz</span></a>
      <div class="socials">
        ${socials()}
      </div>
    </div>
    <div class="bar-right">
      <a class="bar-link" href="/blog/"${current === 'blog' ? ' aria-current="page"' : ''}>Writing</a>
      <button class="theme-btn" id="theme-btn" type="button" aria-label="Toggle dark mode" title="Toggle dark mode">
        <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>
        <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
      </button>
    </div>
  </div>
</div>`;
}

export const PAGE_SCRIPT = `<script>
// theme toggle
var tbtn=document.getElementById('theme-btn');
tbtn.addEventListener('click',function(){
  var dark=document.documentElement.getAttribute('data-theme')==='dark';
  if(dark){document.documentElement.removeAttribute('data-theme')}
  else{document.documentElement.setAttribute('data-theme','dark')}
  try{localStorage.setItem('theme',dark?'light':'dark')}catch(e){}
  var m=document.querySelector('meta[name="theme-color"]');
  if(m) m.setAttribute('content',dark?'#ffffff':'#0d0d0d');
});

// topbar border
var tb=document.getElementById('topbar');
addEventListener('scroll',function(){tb.classList.toggle('scrolled',scrollY>8)},{passive:true});
</script>`;
