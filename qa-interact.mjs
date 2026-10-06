import { chromium } from 'playwright';
const BASE='http://127.0.0.1:4410/'; const out='qa-screenshots';
const browser = await chromium.launch();
const R = {};
// 1 wheel/preventDefault hijack probe + form
{
  const ctx = await browser.newContext({ viewport:{width:1440,height:900} });
  const page = await ctx.newPage();
  const errs=[]; page.on('pageerror',e=>errs.push(e.message)); page.on('console',m=>m.type()==='error'&&errs.push(m.text()));
  await page.addInitScript(() => { window.__pd = 0; const o = Event.prototype.preventDefault; Event.prototype.preventDefault = function(){ if (['wheel','touchmove','scroll'].includes(this.type) && this.cancelable) window.__pd++; return o.call(this); }; });
  await page.goto(BASE,{waitUntil:'networkidle'});
  await page.mouse.move(700,400); for (let i=0;i<10;i++){ await page.mouse.wheel(0,300); await page.waitForTimeout(80); }
  await page.waitForTimeout(500);
  R.scrollY_after_wheel = await page.evaluate(()=>scrollY); R.wheelPreventDefaults = await page.evaluate(()=>window.__pd);
  await page.evaluate(()=>document.querySelector('#reservas').scrollIntoView()); await page.waitForTimeout(1500);
  const sub = page.locator('form button[type=submit]');
  await sub.click(); await page.waitForTimeout(600);
  R.errorsEmpty = await page.locator('form [role=alert]').allInnerTexts();
  await page.locator('form').screenshot({path:`${out}/form-errors.png`});
  await page.fill('#res-name','Ana'); await page.fill('#res-email','bad'); await page.fill('#res-phone','abc');
  await sub.click(); await page.waitForTimeout(500);
  R.errorsPartial = await page.locator('form [role=alert]').allInnerTexts();
  // valid fill
  await page.fill('#res-email','ana@example.com'); await page.fill('#res-phone','+34600111222');
  const opts = await page.locator('#res-party option').evaluateAll(o=>o.map(x=>x.value));
  await page.selectOption('#res-party', opts[3]);
  const d = new Date(Date.now()+5*864e5); // find a open day: try several
  const optsT = await page.locator('#res-time option').evaluateAll(o=>o.map(x=>x.value)); R.timeOpts = optsT.length;
  const iso = d.toISOString().slice(0,10); await page.fill('#res-date', iso);
  await page.selectOption('#res-time', optsT[2] || optsT[1]);
  await page.check('#res-privacy');
  await sub.click(); await page.waitForTimeout(1500);
  R.afterValidSubmit = await page.locator('form').innerText().then(t=>t.slice(0,300)).catch(()=> 'form gone');
  R.sectionTextAfter = await page.locator('#reservas').innerText().then(t=>t.slice(0,400));
  await page.locator('#reservas').screenshot({path:`${out}/form-after-submit.png`});
  R.errs=errs;
  await ctx.close();
}
// 2 reduced motion
{
  const ctx = await browser.newContext({ viewport:{width:1440,height:900}, reducedMotion:'reduce' });
  const page = await ctx.newPage(); const errs=[]; page.on('pageerror',e=>errs.push(e.message));
  await page.goto(BASE,{waitUntil:'networkidle'}); await page.waitForTimeout(1500);
  const H = await page.evaluate(()=>document.documentElement.scrollHeight);
  for (let y=0;y<H;y+=500){ await page.evaluate(y=>scrollTo(0,y),y); await page.waitForTimeout(120); }
  R.reduced = await page.evaluate(()=>{ const bad=[]; document.querySelectorAll('main *').forEach(el=>{const cs=getComputedStyle(el); if(el.textContent.trim() && el.children.length===0 && el.getBoundingClientRect().width>0 && parseFloat(cs.opacity)<0.05 && !el.closest('figcaption')) bad.push(el.tagName+'.'+(el.className+'').slice(0,40));}); return {bad:bad.slice(0,10), jsAnim:document.documentElement.classList.contains('js-anim'), canvases:document.querySelectorAll('canvas').length}; });
  await page.evaluate(()=>scrollTo(0,0)); await page.waitForTimeout(400);
  await page.screenshot({path:`${out}/reduced-hero.png`}); R.reducedErrs=errs; await ctx.close();
}
// 3 hero state at various times + gallery caption on touch
{
  const ctx = await browser.newContext({ viewport:{width:375,height:812}, hasTouch:true, isMobile:true });
  const page = await ctx.newPage(); await page.goto(BASE,{waitUntil:'networkidle'});
  await page.evaluate(()=>document.querySelector('#galeria')?.scrollIntoView()); await page.waitForTimeout(1500);
  R.mobileGalleryCaps = await page.evaluate(()=>[...document.querySelectorAll('#galeria figcaption')].map(f=>getComputedStyle(f).opacity+'|'+f.textContent.trim().slice(0,30)));
  await ctx.close();
}
console.log(JSON.stringify(R,null,1));
await browser.close();
