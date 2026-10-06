import { chromium } from 'playwright';
const BASE = 'http://127.0.0.1:4410/';
const out = 'qa-screenshots';
const browser = await chromium.launch();
const report = {};
for (const [name, w, h] of [['desktop',1440,900],['tablet',768,1024],['mobile',375,812]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const errs = [], bad = [];
  page.on('console', m => { if (['error','warning'].includes(m.type())) errs.push(m.type()+': '+m.text()); });
  page.on('pageerror', e => errs.push('pageerror: '+e.message));
  page.on('response', r => { if (r.status() >= 400) bad.push(r.status()+' '+r.url()); });
  page.on('requestfailed', r => bad.push('FAILED '+r.url()));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${out}/${name}-hero.png` });
  // scroll through
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += Math.round(h*0.6)) { await page.evaluate(y => window.scrollTo(0,y), y); await page.waitForTimeout(350); }
  await page.waitForTimeout(1500);
  const info = await page.evaluate(() => {
    const de = document.documentElement;
    const hidden = [];
    document.querySelectorAll('main *, footer *').forEach(el => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (r.width>0 && r.height>0 && el.textContent.trim() && (parseFloat(cs.opacity) < 0.05 || (cs.clipPath!=='none' && /inset\(\s*100|polygon\(0/.test(cs.clipPath))) && cs.visibility!=='hidden')
        hidden.push(el.tagName+'.'+(el.className||'').toString().slice(0,50)+' op='+cs.opacity+' clip='+cs.clipPath);
    });
    const wide = [];
    document.querySelectorAll('body *').forEach(el => { const r = el.getBoundingClientRect(); if (r.right > innerWidth+1 && r.width>0 && getComputedStyle(el).position!=='fixed') wide.push(el.tagName+'.'+(el.className||'').toString().slice(0,40)+' r='+Math.round(r.right)); });
    const imgs = [...document.images].map(i => ({src:i.currentSrc.slice(0,70), w:i.getAttribute('width'), h:i.getAttribute('height'), loading:i.loading, nat:i.naturalWidth, alt:i.alt, ar:getComputedStyle(i).aspectRatio, parentAR:getComputedStyle(i.parentElement).aspectRatio, ph:i.parentElement.getBoundingClientRect().height}));
    return { sw: de.scrollWidth, cw: de.clientWidth, h1: document.querySelectorAll('h1').length,
      headings: [...document.querySelectorAll('h1,h2,h3,h4')].map(e=>e.tagName+': '+e.textContent.trim().replace(/\s+/g,' ').slice(0,50)),
      canvases: [...document.querySelectorAll('canvas')].map(c=>c.width+'x'+c.height), hidden: hidden.slice(0,15), wide: wide.slice(0,10), imgs,
      sections: [...document.querySelectorAll('main > section, footer, header, nav')].map((e,i)=>e.tagName+'#'+(e.id||i)) };
  });
  report[name] = { errs, bad, ...info };
  await page.evaluate(() => window.scrollTo(0,0)); await page.waitForTimeout(500);
  await page.screenshot({ path: `${out}/${name}-full.png`, fullPage: true });
  const secs = await page.$$('main > section, footer');
  let i = 0;
  for (const s of secs) { await s.scrollIntoViewIfNeeded(); await page.waitForTimeout(900); const id = (await s.getAttribute('id')) || i; try { await s.screenshot({ path: `${out}/${name}-sec-${i}-${id}.png` }); } catch(e){} i++; }
  await ctx.close();
}
console.log(JSON.stringify(report, null, 1));
await browser.close();
