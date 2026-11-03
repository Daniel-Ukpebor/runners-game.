const {chromium}=require('playwright-core');const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||(fs.existsSync('/usr/bin/google-chrome')?'/usr/bin/google-chrome':'/usr/bin/chromium'),args:['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1366,height:768}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://127.0.0.1:8765');await page.waitForFunction(()=>window.__runnersDiagnostics?.().character.state==='ready');
 const status=await page.evaluate(()=>window.__runnersDiagnostics().character);if(status.skinnedMeshes<1||status.clips.length<9)throw Error('Rig or animation clips missing');
 await page.locator('#movement-preview').click();await page.keyboard.down('w');await page.waitForTimeout(1000);await page.keyboard.up('w');
 let practice=await page.evaluate(()=>window.__runnersDiagnostics());if(practice.z<=-3||practice.z>5)throw Error('Safe movement preview failed');await page.locator('#movement-preview').click();
 await page.locator('[data-tab="customize"]').click();await page.locator('[data-build="1"]').click();await page.locator('[data-hair="3"]').click();await page.locator('[data-face="2"]').click();await page.locator('[data-outfit="1"]').click();await page.locator('[data-gear="1"]').click();await page.waitForTimeout(500);
 const rig=await page.evaluate(()=>window.__runnersDiagnostics().rig);if(!rig||Math.abs(rig.chestWidth-.88)>.01||Math.abs(rig.hipsWidth-1.09)>.01||rig.hair.filter(Boolean).length!==1||!rig.hair[3]||rig.pack||rig.sleeves||!rig.faceWeights.some(w=>w>0))throw Error('Appearance is not applied to actual rig: '+JSON.stringify(rig));
 fs.mkdirSync('test-results',{recursive:true});await page.screenshot({path:'test-results/rigged-loadout.png'});
 await page.locator('#studio-back').click();await page.locator('#start').click();await page.locator('#story-overlay:not([hidden])').waitFor();await page.waitForTimeout(1100);await page.screenshot({path:'test-results/rigged-cinematic.png'});await page.locator('#story-skip').click();
 const diag=()=>page.evaluate(()=>window.__runnersDiagnostics());
 const place=async(x,y,z)=>{await page.evaluate(([x,y,z])=>window.__runnersTestApi.place(x,y,z),[x,y,z]);};
 async function driveUntil(z,timeout=12000){await page.keyboard.down('w');try{await page.waitForFunction(z=>window.__runnersDiagnostics().z>=z,z,{timeout});}catch(e){console.log('TRAVERSAL FAILURE',await diag());throw e;}await page.keyboard.up('w');}
 // Walk into the market through its entry, traverse continuous lower surfaces,
 // then steer onto the exit ramp while maintaining saved cosmetics.
 await place(-11.7,.7,4);await driveUntil(25);let d=await diag();if(d.y>-.5||d.lane!=='market')throw Error('Market ramp did not descend to physical lower ground: '+JSON.stringify(d));
 await driveUntil(70,45000);await page.screenshot({path:'test-results/market-route.png'});await driveUntil(140,45000);d=await diag();if(d.z<140||d.y<-1.5)throw Error('Market passage is not connected');
 await page.keyboard.down('a');await page.waitForFunction(()=>window.__runnersDiagnostics().x>-5,null,{timeout:5000});await page.keyboard.up('a');await driveUntil(161);d=await diag();if(d.y<.8)throw Error('Market exit failed to rejoin rooftop height');
 console.log('PASS lower market route, descending and ascending ramps');
 await page.keyboard.press('KeyR');await place(-17,-1,72);
 await page.mouse.move(400,400);await page.mouse.down();await page.mouse.move(803,400,{steps:8});await page.mouse.up();await page.waitForTimeout(1000);
 d=await diag();if(d.camera.x < -19.5)throw Error('Camera penetrated market house: '+JSON.stringify(d.camera));console.log('PASS camera retracts before building wall');
 await page.keyboard.press('KeyR');await place(11,1,54);await page.keyboard.down('w');await page.waitForFunction(()=>window.__runnersDiagnostics().z>=57.5);await page.keyboard.press('Space');await page.waitForFunction(()=>window.__runnersDiagnostics().z>=66);await page.keyboard.up('w');d=await diag();if(d.x<10||d.z<64)throw Error('Scaffold first gap failed');
 await driveUntil(72.9);await page.keyboard.press('Space');d=await diag();if(d.vault<=0)throw Error('Scaffold barrier did not demand vault');
 await page.keyboard.down('w');await page.waitForFunction(()=>window.__runnersDiagnostics().z>81.5);await page.keyboard.press('Space');await page.waitForFunction(()=>window.__runnersDiagnostics().z>90);await page.keyboard.up('w');
 await place(11,1,106);await page.keyboard.press('Space');d=await diag();if(d.climb<=0)throw Error('Contextual pipe climb did not begin');await page.waitForFunction(()=>window.__runnersDiagnostics().climb===0);d=await diag();if(d.y<2.3||d.z<109)throw Error('Climb did not mount ledge');
 await driveUntil(130);d=await diag();if(d.y<2.3||d.z<130)throw Error('Upper skywalk not supported: '+JSON.stringify(d));await page.screenshot({path:'test-results/scaffold-route.png'});
 console.log('PASS scaffold gaps, vault, contextual climb, upper surface');
 // The same position without a jump must fall through a real gap.
 await page.keyboard.press('KeyR');await place(11,1,59);await driveUntil(62);await page.keyboard.up('w');await page.waitForTimeout(850);d=await diag();if(d.y>=.9&&d.z>=59)throw Error('Scaffold gap is cosmetic: '+JSON.stringify(d));
 console.log('PASS scaffold gap has fall consequence');
 await page.keyboard.press('KeyR');await page.keyboard.down('w');await page.waitForTimeout(800);await page.keyboard.up('w');await page.screenshot({path:'test-results/rigged-gameplay.png'});
 await page.locator('#pause').click();await page.locator('#modal-tertiary').click();await page.screenshot({path:'test-results/rigged-menu.png'});
 await page.reload();await page.waitForFunction(()=>window.__runnersDiagnostics?.().character.state==='ready');const style=await page.evaluate(()=>JSON.parse(localStorage.getItem('runners.style')));if(style.hair!==3||style.face!==2||style.outfit!==1||style.gear!==1)throw Error('Rig customization persistence failed');
 if(errors.length)throw Error(errors.join('\n'));console.log('PASS rig, all clips, cosmetics persistence, no JS exceptions');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
