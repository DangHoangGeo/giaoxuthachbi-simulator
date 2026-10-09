import {get} from '/Users/danghoang/Desktop/giaoxuthachbi_work/web/node_modules/@vercel/blob/dist/index.js';
import {writeFile} from 'node:fs/promises';
const result=await get('review/model.json',{access:'private',useCache:false,headers:{'Accept-Encoding':'identity'}});
if(result?.statusCode!==200)throw Error('Owner read failed');
await result.stream.cancel();
const r=await fetch(result.blob.url,{signal:AbortSignal.timeout(15000)});
if(![401,403,404].includes(r.status)) throw Error('Anonymous private storage not denied');
const record={checkedAt:new Date().toISOString(),anonymousPrivateStore:r.status,bodyPublished:false};
await writeFile('/private/tmp/thachbi-private-cloud/deployed/storage-denial.json',JSON.stringify(record,null,2)+'\n');console.log(record);
