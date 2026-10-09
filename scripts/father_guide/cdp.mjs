// Minimal CDP helper (Node 22 built-in WebSocket)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
export async function launch({port=9333, w=1920, h=1080, profile, extra=[]}={}) {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new','--enable-gpu','--use-angle=metal','--ignore-gpu-blocklist',
    `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
    `--window-size=${w},${h}`,'--hide-scrollbars','--no-first-run','--no-default-browser-check',
    '--autoplay-policy=no-user-gesture-required', ...extra, 'about:blank'], {stdio:'ignore'});
  let list;
  for (let i=0;i<60;i++){ try { list = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if(list.length) break; } catch{} await new Promise(r=>setTimeout(r,250)); }
  const page = list.find(t=>t.type==='page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r=>ws.addEventListener('open',r));
  let id=0; const pend=new Map(); const events=[];
  ws.addEventListener('message',e=>{const m=JSON.parse(e.data); if(m.id&&pend.has(m.id)){const {res,rej}=pend.get(m.id);pend.delete(m.id);m.error?rej(new Error(JSON.stringify(m.error))):res(m.result);} else events.push(m);});
  const send=(method,params={})=>new Promise((res,rej)=>{const i=++id;pend.set(i,{res,rej});ws.send(JSON.stringify({id:i,method,params}));});
  const api = {
    send, events, chrome,
    async eval(expr){ const r=await send('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true}); if(r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0,500)); return r.result.value; },
    async shot(file, opts={}){ const r=await send('Page.captureScreenshot',{format:opts.format||'png',quality:opts.quality,captureBeyondViewport:false, ...(opts.clip?{clip:opts.clip}:{})}); fs.writeFileSync(file,Buffer.from(r.data,'base64')); },
    async goto(url){ await send('Page.enable'); await send('Page.navigate',{url}); },
    async setViewport(w,h,dpr=1){ await send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:dpr,mobile:false}); },
    sleep:(ms)=>new Promise(r=>setTimeout(r,ms)),
    async click(x,y){ for (const t of ['mouseMoved','mousePressed','mouseReleased']) await send('Input.dispatchMouseEvent',{type:t,x,y,button:'left',clickCount:1,buttons:t==='mousePressed'?1:0}); },
    async key(type,key,code){ await send('Input.dispatchKeyEvent',{type,key,code,windowsVirtualKeyCode:{w:87,a:65,s:83,d:68,Escape:27}[key]||0}); },
    close(){ try{ws.close();}catch{} chrome.kill(); }
  };
  return api;
}
