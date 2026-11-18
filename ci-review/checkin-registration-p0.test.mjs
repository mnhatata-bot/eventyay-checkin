import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {dirname,join,resolve} from 'node:path';
const here=dirname(fileURLToPath(import.meta.url));
const sourcePath=process.env.CI_EVENTYAY_REGISTRATION_SOURCE||join(here,'../src/stores/liveRegistration.js');
const bytes=readFileSync(resolve(sourcePath));
const source=bytes.toString('utf8');
const sha=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
const runtime="const defineStore=(_id,init)=>init;const ref=value=>({value});const useEventyayApi=()=>globalThis.__CI_CONTEXT;const createAuthorizedDeviceApi=()=>globalThis.__CI_CLIENT;const raiseIfDeviceApiError=()=>{};\n";
const code=runtime+source.split('\n').filter(line=>!line.startsWith('import ')).join('\n');
const mod=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
function boot(results=[{id:1,active:true,admission:true},{id:2,active:false},{id:3,active:true,admission:false}]){
 let reads=0,posts=0;
 globalThis.__CI_CONTEXT={url:'https://server.invalid',apitoken:'test',organizer:'org',eventSlug:'evt',refreshServerUrl(){}};
 globalThis.__CI_CLIENT={get:async path=>{assert.equal(path,'/api/v1/organizers/org/events/evt/products/');reads++;return {results}},post:async()=>{posts++;throw Error('unsafe POST')}};
 return {store:mod.useLiveRegistrationStore(),reads:()=>reads,posts:()=>posts};
}
test('exact patched registration store matches GitHub blob',()=>assert.equal(sha,'2a31340f8de056ec24d1326502cdd53a25f90044'));
test('device registration rejects before any order/payment API request',async()=>{const x=boot();await assert.rejects(x.store.registerAndMarkPaid({attendee_name:'Example'},1),/verified online server/);assert.equal(x.posts(),0);assert.equal(x.reads(),0)});
test('read-only products load and inactive entries are excluded',async()=>{const x=boot();const rows=await x.store.fetchProducts();assert.deepEqual(rows.map(z=>z.id),[1]);assert.equal(x.reads(),1);assert.equal(x.store.productsLoaded.value,true);assert.equal(x.store.isLoadingProducts.value,false)});
test('product cache and force refresh work',async()=>{const x=boot();await x.store.fetchProducts();await x.store.fetchProducts();assert.equal(x.reads(),1);await x.store.fetchProducts({force:true});assert.equal(x.reads(),2)});
test('cached snapshot restoration cannot issue a paid ticket',async()=>{const x=boot();x.store.restoreProductsFromSnapshot([{id:5,active:true}]);assert.equal(x.store.products.value[0].id,5);await assert.rejects(x.store.registerAndMarkPaid(),/payment authorization/);assert.equal(x.posts(),0)});
