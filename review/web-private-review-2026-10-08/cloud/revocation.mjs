import {get,put} from '/Users/danghoang/Desktop/giaoxuthachbi_work/web/node_modules/@vercel/blob/dist/index.js';
import {readFile,writeFile} from 'node:fs/promises';
const secret=JSON.parse(await readFile('/Users/danghoang/Desktop/giaoxuthachbi_work/.env.private-review-access','utf8'));
const base='https://giaoxuthachbi-simulator-8kojnh22k-danghoanggeos-projects.vercel.app';
const headers={Authorization:'Basic '+Buffer.from(secret.username+':'+secret.password).toString('base64'),'x-vercel-trusted-oidc-idp-token':process.env.VERCEL_OIDC_TOKEN};
const original=await get('review/access.json',{access:'private',useCache:false,headers:{'Accept-Encoding':'identity'}});
if(original?.statusCode!==200)throw Error('Policy read failed');
const policy=await new Response(original.stream).text();
const options={access:'private',addRandomSuffix:false,allowOverwrite:true,contentType:'application/json'};
const report={checkedAt:new Date().toISOString(),checks:[]};
try {
 await put('review/access.json',JSON.stringify({...JSON.parse(policy),enabled:false}),options);
 for(const path of ['/vi/review','/vi/review/model','/vi/review/access']) {
 const r=await fetch(base+path,{headers,signal:AbortSignal.timeout(15000)});if(r.status!==401)throw Error('Revocation failed');await r.body?.cancel();report.checks.push({path,disabledPolicy:r.status});
 }
} finally {await put('review/access.json',policy,options);}
const restored=await fetch(base+'/vi/review/access',{headers,signal:AbortSignal.timeout(15000)});
if(restored.status!==204)throw Error('Restoration verification failed');
report.restored=204;
await writeFile('/private/tmp/thachbi-private-cloud/deployed/revocation.json',JSON.stringify(report,null,2)+'\n');console.log(report);
