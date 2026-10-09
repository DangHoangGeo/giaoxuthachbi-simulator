import { chromium, expect } from '/Users/danghoang/Desktop/giaoxuthachbi_work/web/node_modules/@playwright/test/index.mjs';
import {readFile,writeFile} from 'node:fs/promises';
const root='/Users/danghoang/Desktop/giaoxuthachbi_work';
const secret=JSON.parse(await readFile(root+'/.env.private-review-access','utf8'));
const response=JSON.parse(await readFile('/private/tmp/thachbi-private-cloud/share-response.json','utf8'));
const [token,info]=Object.entries(response.protectionBypass)[0];
const base='https://giaoxuthachbi-simulator-8kojnh22k-danghoanggeos-projects.vercel.app';
const share=base+'/vi/review?_vercel_share='+encodeURIComponent(token);
const browser=await chromium.launch({channel:'chrome',headless:false});
const report={checkedAt:new Date().toISOString(),base,shareExpiresAt:new Date(info.expires*1000).toISOString(),checks:[]};
try {
 // API requests share their browser context cookie jar. No OIDC header is used anywhere.
 const anon=await browser.newContext();
 const r=await anon.request.get(share);expect(r.status()).toBe(401);expect(r.headers()['www-authenticate']).toContain('Thach Bi');report.checks.push({shareOnly:r.status(),parishChallenge:true});
 await anon.close();
 const wrong=await browser.newContext({httpCredentials:{username:'parish',password:'x'.repeat(43),origin:base}});
 const w=await wrong.request.get(share);expect(w.status()).toBe(401);report.checks.push({wrongPassword:w.status()});await wrong.close();
 const context=await browser.newContext({viewport:{width:1440,height:1000},httpCredentials:{username:secret.username,password:secret.password,origin:base}});
 const page=await context.newPage();
 const pageResponse=await page.goto(share);expect(pageResponse.status()).toBe(200);
 await expect(page.getByRole('heading',{name:'Mô hình nhà thờ đầy đủ chi tiết'})).toBeVisible();
 const head=await context.request.head(base+'/vi/review/model');expect(head.status()).toBe(200);expect(head.headers()['content-type']).toBe('application/octet-stream');expect(head.headers()['cache-control']).toContain('no-store');
 const accessStatus=await page.evaluate(async()=> (await fetch('/vi/review/access',{cache:'no-store'})).status);expect(accessStatus).toBe(204);
 report.checks.push({shareWithPassword:200,modelHead:200,modelBytes:53230983,access:204,vercelAccountRequired:false});
 await page.screenshot({path:'/private/tmp/thachbi-private-cloud/deployed/share-entry.png',fullPage:true});
 await context.close();
 await writeFile('/private/tmp/thachbi-private-cloud/deployed/share-results.json',JSON.stringify(report,null,2)+'\n');
 const handover=`PRIVATE — Thạch Bi Church / Gửi riêng cho Cha\n\nOpen this exact link in a private/incognito desktop browser window / Mở liên kết này trong cửa sổ ẩn danh trên máy tính:\n${share}\n\nUsername / Tên đăng nhập: ${secret.username}\nPassword / Mật khẩu: ${secret.password}\n\nNo Vercel account needed. Không cần tài khoản Vercel.\nClick “Mở mô hình 3D”. Tải khoảng 53 MB; nên dùng Wi-Fi ổn định.\nUse the camera buttons and mouse to inspect the church.\nClose all private browser windows when finished; “Đóng 3D” only closes the model.\n\nShare link expires / Liên kết hết hạn: ${report.shareExpiresAt}\nParish password expires / Mật khẩu hết hạn: ${secret.expiresAt}\n\nThis is a full-detail architectural model in development, not the complete engineering simulator or construction-approved design.\nMô hình kiến trúc đang phát triển; không phải hồ sơ được duyệt để thi công.\n\nKeep this file private; it contains access credentials. Do not add it to Git or the public website.\n`;
 await writeFile(root+'/.env.private-review-handover.txt',handover,{mode:0o600});
 console.log(JSON.stringify(report,null,2));
} catch(e) {console.error('Share flow failed:',String(e).replaceAll(token,'[redacted]'));process.exitCode=1;} finally {await browser.close();}
