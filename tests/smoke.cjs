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
 const startRect=await page.locator('#start').boundingBox();
 if(!startRect||startRect.y+startRect.height>390)throw Error('START button is not visible in iPhone landscape');
 if(await page.locator('.race-row').count()!==0)throw Error('Race cards should render only on Races tab');
 await page.locator('[data-tab="races"]').click();
 if(await page.locator('.race-row').count()!==3)throw Error('Expected 3 distinct racing chapters');
 if(!(await page.locator('[data-race="1"]').isDisabled()))throw Error('Chapter 2 should require chapter 1 completion');
 await page.locator('[data-tab="upgrades"]').click();
 if(await page.locator('.upgrade-row').count()!==3)throw Error('Upgrade workshop failed to render');
 await page.locator('[data-tab="customize"]').click();
 await page.locator('[data-build="1"]').click();
 await page.locator('[data-hair="4"]').click();
 await page.locator('[data-haircolor="3"]').click();
 await page.waitForTimeout(450);
 await page.screenshot({path:'test-results/runners-customize.png'});
 if(!(await page.locator('#avatar-preview canvas').count()))throw Error('Live 3D avatar preview failed');
 const previewRect=await page.locator('#avatar-preview').boundingBox();
 if(previewRect.y<0||previewRect.y+previewRect.height>390)throw Error('3D avatar preview is clipped off iPhone landscape screen');
 const style=await page.evaluate(()=>JSON.parse(localStorage.getItem('runners.style')));
 if(style.build!==1||style.hair!==4||style.haircolor!==3)throw Error('Runner customization not persisting');
 await page.locator('[data-tab="story"]').click();
 await page.locator('#start').click({timeout:7000});
 await page.locator('#story-overlay:not([hidden])').waitFor();
 await page.screenshot({path:'test-results/runners-flashback.png'});
 await page.locator('#story-next').click();
 await page.locator('#story-skip').click();

 await page.waitForTimeout(700);
 const after=await page.evaluate(()=>({
   splashHidden:document.querySelector('#splash').hidden,
   controlsVisible:!document.querySelector('#controls').hidden,
   timer:document.querySelector('#time').textContent
 }));
 console.log('AFTER START:',JSON.stringify(after));
 if(!after.splashHidden||!after.controlsVisible||Number(after.timer.split(':').at(-1))<=0)throw Error('Start button failed');
 console.log('AUDIO CONTEXT:',await page.evaluate(()=>window.__runnersDiagnostics().audio));
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
 await page.locator('#pause').click();
 if((await page.locator('#modal-secondary').textContent())!=='RESTART RACE')throw Error('Restart button mislabeled');
 await page.locator('#modal-secondary').click();
 await page.keyboard.down('w');
 await page.waitForFunction(()=>window.__runnersDiagnostics().z>5.5,null,{timeout:13000});
 const preJump=await page.evaluate(()=>window.__runnersDiagnostics());
 await page.keyboard.press('Space');
 await page.waitForFunction(()=>window.__runnersDiagnostics().z>14,null,{timeout:13000});
 await page.keyboard.up('w');
 const postJump=await page.evaluate(()=>window.__runnersDiagnostics());
 console.log('ROOFTOP JUMP:',JSON.stringify({preJump,postJump}));
 if(postJump.z<12)throw Error('Jump failed to clear the first rooftop gap');
 await page.locator('#pause').click();
 await page.locator('#modal-tertiary').click();
 const menu=await page.evaluate(()=>({visible:!document.querySelector('#splash').hidden,hudHidden:document.querySelector('#hud').hidden}));
 if(!menu.visible||!menu.hudHidden)throw Error('MAIN MENU did not return to the actual home screen');
 await page.locator('[data-tab="races"]').click();
 await page.locator('[data-race="0"]').click();
 await page.locator('#start').click();
 await page.waitForTimeout(450);
 if(await page.locator('#story-overlay').isVisible())throw Error('Already watched cutscene played again without being asked');
 await page.keyboard.down('w');await page.waitForTimeout(600);await page.keyboard.up('w');
 await page.evaluate(()=>window.__runnersTestApi.complete());
 await page.waitForFunction(()=>!document.querySelector('#modal').hidden,{timeout:10000});
 const finishData=await page.evaluate(()=>({
   wallet:window.__runnersDiagnostics().wallet,
   title:document.querySelector('#modal-title').textContent,
   nextUnlocked:!document.querySelector('[data-race="1"]')?.disabled,
   result:document.querySelector('#modal-text').textContent
 }));
 console.log('FINISH REWARDS:',JSON.stringify(finishData));
 if(finishData.wallet<60||!finishData.result.includes('CREDITS'))throw Error('Finishing did not earn progression rewards');
 await page.locator('#modal-secondary').click();
 await page.locator('[data-tab="races"]').click();
 if(await page.locator('[data-race="1"]').isDisabled())throw Error('Completing chapter 1 failed to unlock chapter 2');
 await page.locator('[data-tab="upgrades"]').click();
 await page.locator('[data-buy="pace"]').click();
 const balance=await page.evaluate(()=>({wallet:window.__runnersDiagnostics().wallet,upgrade:JSON.parse(localStorage.getItem('runners.save.v3')).upgrades.pace}));
 if(balance.upgrade!==1)throw Error('Upgrade did not persist');
 await page.locator('[data-tab="races"]').click();
 await page.locator('[data-race="0"]').click();
 await page.locator('#start').click();
 await page.waitForTimeout(300);
 const ghost=await page.locator('#ghost-indicator').textContent();
 console.log('REPLAY SHADOW:',ghost);
 if(!ghost.includes('YOUR SHADOW'))throw Error('Last race shadow replay was not saved');
 await page.locator('#pause').click();
 await page.locator('#modal-tertiary').click();
 await page.locator('[data-tab="races"]').click();
 await page.locator('[data-race="1"]').click();
 await page.locator('#start').click();
 await page.locator('#story-overlay:not([hidden])').waitFor();
 await page.screenshot({path:'test-results/runners-chapter2.png'});
 await page.locator('#story-skip').click();
 if((await page.evaluate(()=>window.__runnersDiagnostics().level))!=='market')throw Error('Chapter 2 race not selected');
 await page.waitForTimeout(300);
 await page.evaluate(()=>window.__runnersTestApi.complete());
 await page.waitForFunction(()=>!document.querySelector('#modal').hidden);
 await page.locator('#modal-secondary').click();
 await page.locator('[data-tab="races"]').click();
 if(await page.locator('[data-race="2"]').isDisabled())throw Error('Chapter 3 did not unlock');
 await page.locator('[data-race="2"]').click();
 await page.locator('#start').click();
 await page.locator('#story-overlay:not([hidden])').waitFor();
 await page.locator('#story-skip').click();
 await page.waitForTimeout(400);
 if((await page.evaluate(()=>window.__runnersDiagnostics().level))!=='nightline')throw Error('Nightline route failed');
 if(await page.locator('#error').isVisible())throw Error('Nightline render crashed');
 await page.screenshot({path:'test-results/runners-nightline.png'});

 if(errors.length)throw Error('JS runtime error(s): '+errors.join(' | '));
 console.log('SMOKE TEST PASSED: render, start, movement, responsive layout');
 await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
