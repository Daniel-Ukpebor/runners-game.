const {chromium}=require('playwright-core');
const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||(fs.existsSync('/usr/bin/google-chrome')?'/usr/bin/google-chrome':'/usr/bin/chromium'),headless:true,args:['--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const [width,height] of [[1366,768],[1440,900],[844,390],[390,844]]){
  const page=await browser.newPage({viewport:{width,height},hasTouch:width<1000,isMobile:width<1000});const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto('http://127.0.0.1:8765/');await page.locator('#scene canvas').waitFor();
  await page.waitForTimeout(1500);await page.locator('[data-tab="customize"]').click();
  await page.locator('[data-hair="3"]').click();await page.locator('[data-gear="0"]').click();
  const stage=page.locator('#avatar-preview'),bounds=await stage.boundingBox();
  await page.mouse.move(bounds.x+bounds.width*.6,bounds.y+bounds.height*.6);await page.mouse.down();await page.mouse.move(bounds.x+bounds.width*.8,bounds.y+bounds.height*.5,{steps:8});await page.mouse.up();
  await stage.focus();await page.keyboard.press('ArrowRight');
  if(!await page.locator('#customize-panel').evaluate(e=>e.classList.contains('customize-focused')))throw Error('Preview key exited studio');
  const before=await page.evaluate(()=>localStorage.getItem('runners.style'));await page.mouse.wheel(0,-120);
  if(width===390){
   const cdp=await page.context().newCDPSession(page),x=bounds.x+bounds.width/2,y=bounds.y+bounds.height*.55;
   const zoom0=await page.evaluate(()=>window.__runnersStudioDiagnostic().zoom);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x-55,y,id:1},{x:x+55,y,id:2}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-45,y,id:1},{x:x+45,y,id:2}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-25,y,id:1},{x:x+25,y,id:2}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   const zoom1=await page.evaluate(()=>window.__runnersStudioDiagnostic().zoom);if(Math.abs(zoom1-zoom0)<.1)throw Error('Real touch pinch failed');
  }
  if(before!==await page.evaluate(()=>localStorage.getItem('runners.style')))throw Error('Camera altered cosmetics');
  for(const id of ['studio-back','studio-race']){const r=await page.locator('#'+id).boundingBox();if(!r||r.y<0||r.y+r.height>height||r.x<0||r.x+r.width>width)throw Error(id+' clipped at '+width+'x'+height);}
  const overlap=await page.evaluate(()=>{const a=document.querySelector('#studio-actions').getBoundingClientRect(),b=document.querySelector('#studio-controls').getBoundingClientRect();return b.bottom>a.top+1});if(overlap)throw Error('Actions overlap options');
  fs.mkdirSync('test-results',{recursive:true});await page.screenshot({path:`test-results/studio-${width}x${height}.png`});
  await page.locator('#studio-back').click();await page.waitForTimeout(900);await page.screenshot({path:`test-results/menu-${width}x${height}.png`});
  await page.locator('#start').click();await page.locator('#story-overlay:not([hidden])').waitFor();await page.locator('#story-skip').click();await page.waitForTimeout(400);
  const hud=['#time','#best','#pickup','#sound-hud','#pause','#stunt-hud'],rects=[];
  for(const selector of hud){if(!await page.locator(selector).isVisible())throw Error('HUD element hidden: '+selector);rects.push([selector,await page.locator(selector).boundingBox()]);}
  for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++){const [an,a]=rects[i],[bn,b]=rects[j];if(a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y)throw Error('HUD overlap '+an+' '+bn+' at '+width+'x'+height);}
  await page.screenshot({path:`test-results/hud-${width}x${height}.png`});
  if(errors.length)throw Error(errors.join('\n'));console.log('Studio layout, orbit isolation and keyboard PASS',width,height);await page.close();
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
