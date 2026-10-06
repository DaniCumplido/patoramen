import { chromium } from 'playwright';
const BASE = 'http://127.0.0.1:4410/';
const browser = await chromium.launch();
const results = {};
async function sample(page, tag) {
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  const els = await page.evaluate(() => {
    const out = [];
    const sy = scrollY;
    const parse = c => { const m = c.match(/[\d.]+/g).map(Number); return { r:m[0], g:m[1], b:m[2], a: m[3] ?? 1 }; };
    const all = document.querySelectorAll('body *');
    let id = 0;
    for (const el of all) {
      const tn = el.tagName;
      if (['SCRIPT','STYLE','CANVAS','IMG','SVG','PATH','OPTION'].includes(tn.toUpperCase())) continue;
      let text = '', ph = false;
      if (tn==='INPUT' || tn==='TEXTAREA') { if (el.type==='checkbox') continue; if (el.value) text = el.value; else if (el.placeholder) { text = el.placeholder; ph = true; } else if (el.type==='date') text='dd/mm/yyyy'; }
      else if (tn==='SELECT') text = el.options[el.selectedIndex]?.text || '';
      else text = [...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim();
      if (!text) continue;
      if (el.closest('[aria-hidden="true"]')) continue;
      let op = 1, p = el, hidden = false;
      while (p && p!==document.documentElement) { const cs = getComputedStyle(p); op *= parseFloat(cs.opacity); if (cs.visibility==='hidden'||cs.display==='none') hidden = true; p = p.parentElement; }
      if (hidden || op < 0.05) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2 || r.right > innerWidth + 2 || r.left < -2) continue;
      const cs = getComputedStyle(el, ph ? '::placeholder' : null);
      const fs = parseFloat(cs.fontSize), fw = parseInt(cs.fontWeight);
      el.setAttribute('data-q', id);
      out.push({ id: id++, text: text.slice(0,40), tag: tn, cls: (el.className||'').toString().slice(0,60), color: parse(cs.color), op, fs, fw, x:r.left, y:r.top+sy, w:r.width, h:r.height, ph });
    }
    return out;
  });
  await page.addStyleTag({ content: '*,*::before,*::after{color:transparent!important;text-shadow:none!important;-webkit-text-fill-color:transparent!important;caret-color:transparent!important}::placeholder{color:transparent!important;-webkit-text-fill-color:transparent!important}svg{visibility:hidden!important}' });
  await page.evaluate(() => window.scrollTo(0,0)); await page.waitForTimeout(400);
  const buf = await page.screenshot({ fullPage: true });
  const b64 = buf.toString('base64');
  const res = await page.evaluate(async ({b64, els}) => {
    const img = new Image(); img.src = 'data:image/png;base64,'+b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const ctx = c.getContext('2d', { willReadFrequently: true }); ctx.drawImage(img,0,0);
    const lin = v => { v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4); };
    const L = (r,g,b) => 0.2126*lin(r)+0.7152*lin(g)+0.0722*lin(b);
    const out = [];
    for (const e of els) {
      const x = Math.max(0,Math.floor(e.x)), y = Math.max(0,Math.floor(e.y)), w = Math.min(Math.ceil(e.w), c.width-x), h = Math.min(Math.ceil(e.h), c.height-y);
      if (w<1||h<1) continue;
      const d = ctx.getImageData(x,y,w,h).data;
      const lums = []; let sr=0,sg=0,sb=0,n=0;
      const step = Math.max(1, Math.floor(d.length/4/1500));
      for (let i=0;i<d.length;i+=4*step){ lums.push([L(d[i],d[i+1],d[i+2]), d[i],d[i+1],d[i+2]]); sr+=d[i];sg+=d[i+1];sb+=d[i+2];n++; }
      lums.sort((a,b)=>a[0]-b[0]);
      const mean = [sr/n,sg/n,sb/n];
      const tl = (bg) => { const a = e.color.a*e.op; const R=a*e.color.r+(1-a)*bg[0], G=a*e.color.g+(1-a)*bg[1], B=a*e.color.b+(1-a)*bg[2]; return L(R,G,B); };
      const ratio = (bg) => { const t = tl(bg), b = L(bg[0],bg[1],bg[2]); const hi=Math.max(t,b), lo=Math.min(t,b); return (hi+0.05)/(lo+0.05); };
      const lightText = tl(mean) > L(mean[0],mean[1],mean[2]);
      // worst-case bg: for light text, brightest 5% pixel; for dark text, darkest
      const wp = lightText ? lums[Math.floor(lums.length*0.95)] : lums[Math.floor(lums.length*0.05)];
      out.push({ id:e.id, text:e.text, cls:e.cls, tag:e.tag, fs:e.fs, fw:e.fw, ph:e.ph, mean: +ratio(mean).toFixed(2), worst: +ratio([wp[1],wp[2],wp[3]]).toFixed(2), x:Math.round(e.x), y:Math.round(e.y) });
    }
    return out;
  }, { b64, els });
  return res;
}
for (const [name,w,h] of [['desktop',1440,900],['mobile',375,812]]) {
  for (const stage of ['base','errors']) {
    const ctx = await browser.newContext({ viewport:{width:w,height:h} });
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil:'networkidle' });
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y=0;y<H;y+=Math.round(h*0.6)){ await page.evaluate(y=>scrollTo(0,y),y); await page.waitForTimeout(300); }
    if (stage==='errors') {
      await page.locator('form button[type=submit]').scrollIntoViewIfNeeded();
      await page.locator('form button[type=submit]').click(); await page.waitForTimeout(800);
    } else { await page.evaluate(()=>scrollTo(0,0)); }
    await page.waitForTimeout(1500);
    // freeze marquee/anim
    const r = await sample(page, stage);
    results[name+'-'+stage] = r;
    await ctx.close();
  }
}
await browser.close();
const fail = [];
for (const k in results) for (const r of results[k]) {
  const large = r.fs >= 24 || (r.fs >= 18.66 && r.fw >= 700);
  const th = large ? 3 : 4.5;
  if (r.mean < th || r.worst < th) fail.push({ k, ...r, th });
}
console.log('total', Object.values(results).reduce((a,b)=>a+b.length,0), 'fail', fail.length);
const seen = new Set();
for (const f of fail) { const key = f.k.split('-')[0]+f.text+f.cls; if (seen.has(key)) continue; seen.add(key); console.log(JSON.stringify(f)); }
