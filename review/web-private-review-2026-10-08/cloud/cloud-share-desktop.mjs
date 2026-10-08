import { chromium, request, expect } from '/Users/danghoang/Desktop/giaoxuthachbi_work/web/node_modules/@playwright/test/index.mjs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const root='/Users/danghoang/Desktop/giaoxuthachbi_work';
const secret=JSON.parse(await readFile(root+'/.env.private-review-access','utf8'));
const base=process.env.REVIEW_BASE || 'http://127.0.0.1:3133';
const out='/private/tmp/thachbi-private-cloud/'+(process.env.REVIEW_BASE?'deployed':'desktop');
await mkdir(out,{recursive:true});
const shareResponse=JSON.parse(await readFile('/private/tmp/thachbi-private-cloud/share-response.json','utf8'));
const shareQuery='?_vercel_share='+encodeURIComponent(Object.keys(shareResponse.protectionBypass)[0]);
const extraHTTPHeaders={};
const result={base,started:new Date().toISOString(),checks:[],errors:[],expectedDenialLogs:[]}; let phase='render';
const anonymous=await request.newContext({baseURL:base,extraHTTPHeaders});
for(const path of ['/vi/review','/vi/review/model','/en/review?_rsc=probe']){
 const r=await anonymous.get(path+(path.includes('?')?'&'+shareQuery.slice(1):shareQuery)); expect(r.status()).toBe(401);expect(r.headers()['cache-control']).toContain('no-store');result.checks.push({path,status:r.status()});
}
await anonymous.dispose();
const browser=await chromium.launch({channel:'chrome',headless:false});
const context=await browser.newContext({viewport:{width:1440,height:1000},httpCredentials:{username:secret.username,password:secret.password,origin:base}});
if(process.env.REVIEW_BASE) await context.route('**/*',route=>{ const headers={...route.request().headers()}; if(new URL(route.request().url()).origin===base) Object.assign(headers,extraHTTPHeaders); else delete headers['x-vercel-trusted-oidc-idp-token']; return route.continue({headers}); });
const page=await context.newPage();page.setDefaultTimeout(30000);
page.on('pageerror',e=>result.errors.push(e.message));
page.on('console',m=>{if(m.type()==='error'){if(phase==='denial' && m.text().includes('401'))result.expectedDenialLogs.push(m.text());else result.errors.push(m.text());}});
let requests=0;page.on('request',r=>{if(new URL(r.url()).pathname.endsWith('/review/model'))requests++;});
try {
 console.log("Navigating private review");
 const response=await page.goto(base+'/vi/review'+shareQuery);expect(response.status()).toBe(200);
 await expect(page.getByRole('heading',{name:'Mô hình nhà thờ đầy đủ chi tiết'})).toBeVisible();
 expect(requests).toBe(0);await expect(page.locator('canvas')).toHaveCount(0);
 console.log("Private page authenticated; starting model");
 const start=Date.now();await page.getByRole('button',{name:'Mở mô hình 3D',exact:true}).click();
 await Promise.race([expect(page.getByRole('button',{name:'Gian chính',exact:true})).toBeVisible({timeout:180000}),page.getByRole('button',{name:'Thử lại',exact:true}).waitFor({timeout:180000}).then(()=>{throw Error('Model entered failure state')})]);
 console.log("Model ready"); result.loadMs=Date.now()-start;expect(requests).toBe(1);await expect(page.locator('canvas')).toHaveCount(1);
 await page.getByRole('combobox',{name:'Không khí'}).selectOption('day');
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 await page.screenshot({path:out+'/full-exterior-day.png',fullPage:true});
 await page.getByRole('button',{name:'Gian chính',exact:true}).click();
 await page.screenshot({path:out+'/full-nave-day.png',fullPage:true});
 await page.getByRole('combobox',{name:'Không khí'}).selectOption('night');
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 await page.screenshot({path:out+'/full-nave-night.png',fullPage:true});
 await page.getByRole('button',{name:'Cung thánh',exact:true}).click();
 await page.screenshot({path:out+'/full-sanctuary-night.png',fullPage:true});
 await page.getByRole('button',{name:'Đóng 3D',exact:true}).click();
 await expect(page.locator('canvas')).toHaveCount(0);
 const a=await context.request.head(base+'/vi/review/model',{headers:extraHTTPHeaders});expect(a.status()).toBe(200);expect(a.headers()['content-type']).toBe('application/octet-stream');if(!process.env.REVIEW_BASE)expect(a.headers()['content-length']).toBe('53230983');
 const range=await context.request.get(base+'/vi/review/model',{headers:{...extraHTTPHeaders,Range:'bytes=0-31'}});expect(range.status()).toBe(416);
 // Re-entry was separately exercised locally; this cloud run verifies one complete source-hash-checked load.
 phase='denial'; await page.route('**/vi/review/access',r=>r.fulfill({status:401,body:'Denied',headers:{'Cache-Control':'private, no-store'}}));
 await page.evaluate(()=>window.dispatchEvent(new Event('pageshow')));
 await expect(page.locator('main').getByRole('alert')).toContainText('Phiên xem đã đóng');
 await expect(page.locator('canvas')).toHaveCount(0);
 result.checks.push({authenticatedPage:200,head:200,range:416,modelRequests:requests,reentry:false,closeDisposes:true,denialAfterClose:true,shareLinkWithoutVercelAccount:true});
 result.browser=await browser.version();result.finished=new Date().toISOString();
 expect(result.errors).toEqual([]);
 await writeFile(out+'/results.json',JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify(result,null,2));
} catch(error) { result.failure=String(error); await writeFile(out+'/failure.json',JSON.stringify(result,null,2)+'\n'); await page.screenshot({path:out+'/failure.png',fullPage:true}).catch(()=>{}); console.error(String(error)); throw error; } finally {await context.close();await browser.close();}
