const { chromium } = require('playwright-core');
const fs = require('fs');
(async () => {
 const browser = await chromium.launch({
  executablePath:'/usr/bin/google-chrome',
  headless:true,
  args:['--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']
 });
 const page=await browser.newPage({viewport:{width:844,height:390},deviceScaleFactor:1,hasTouch:true,isMobile:true});
 let errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 page.on('console',msg=>{if(msg.type()==='error')console.log('BROWSER CONSOLE: '+msg.text().slice(0,350))});
 await page.goto('http://127.0.0.1:8765/',{waitUntil:'load'});
 await page.waitForTimeout(4500);
 const init=await page.evaluate(()=>({
   hasCanvas:!!document.querySelector('#scene canvas'),
   canvasWidth:document.querySelector('#scene canvas')?.width,
   introVisible:!document.querySelector('#splash').hidden,
   errorVisible:!document.querySelector('#error').hidden
 }));
 console.log('INIT:',JSON.stringify(init));
 if(!init.hasCanvas||init.errorVisible||!init.introVisible)throw Error('Game failed initial render');
 fs.mkdirSync('test-results',{recursive:true});
 await page.screenshot({path:'test-results/runners-title.png'});
 await page.locator('#start').click({timeout:7000});
 await page.waitForTimeout(700);
 const after=await page.evaluate(()=>({
   splashHidden:document.querySelector('#splash').hidden,
   controlsVisible:!document.querySelector('#controls').hidden,
   timer:document.querySelector('#time').textContent
 }));
 console.log('AFTER START:',JSON.stringify(after));
 if(!after.splashHidden||!after.controlsVisible||parseFloat(after.timer)<=0)throw Error('Start button failed');
 await page.keyboard.down('w');
 await page.waitForTimeout(1300);
 await page.keyboard.up('w');
 const move=await page.evaluate(()=>({progress:parseFloat(document.querySelector('#progress-fill').style.width),timer:document.querySelector('#time').textContent}));
 console.log('MOVEMENT:',JSON.stringify(move));
 if(move.progress<1)throw Error('Movement did not advance player');
 const before=await page.evaluate(()=>window.__runnersDiagnostics());
 const stick=await page.locator('#stick').boundingBox(),sx=stick.x+stick.width/2,sy=stick.y+stick.height/2;
 await page.mouse.move(sx,sy);await page.mouse.down();await page.mouse.move(sx+39,sy);
 await page.waitForTimeout(550);await page.mouse.up();
 const afterStick=await page.evaluate(()=>window.__runnersDiagnostics());
 console.log('JOYSTICK RIGHT:',JSON.stringify({before,afterStick}));
 if(afterStick.x>before.x-.5)throw Error('Joystick right did not steer screen-right (world -X)');
 await page.screenshot({path:'test-results/runners-landscape.png'});
 await page.setViewportSize({width:390,height:844});
 await page.waitForTimeout(400);
 await page.screenshot({path:'test-results/runners-portrait.png'});
 if(errors.length)throw Error('JS runtime error(s): '+errors.join(' | '));
 console.log('SMOKE TEST PASSED: render, start, movement, responsive layout');
 await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
