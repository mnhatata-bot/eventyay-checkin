import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {dirname,join,resolve} from 'node:path';

const here=dirname(fileURLToPath(import.meta.url));
const sourcePath=process.env.CI_EVENTYAY_OFFLINE_SOURCE||join(here,'../src/offline/offlineActions.js');
const bytes=readFileSync(resolve(sourcePath));
const source=bytes.toString('utf8');
const originalImport="import { lookupBySecret } from '@/offline/memoryIndex'";
assert.ok(source.includes(originalImport),'Source alias changed; do not silently substitute another file');
const shim="const lookupBySecret=(index,secret)=>index.revokedSecrets.has(secret)?{status:'revoked'}:(!index.positionsBySecret.get(secret)||index.positionsBySecret.get(secret).canceled?{status:'missing'}:{status:'found',position:index.positionsBySecret.get(secret)})";
const url='data:text/javascript;base64,'+Buffer.from(source.replace(originalImport,shim)).toString('base64');
const api=await import(url);
const sha=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
const make=(status='p',listIds=[3])=>({positionsBySecret:new Map([['key',{orderStatus:status,listIds}]]),revokedSecrets:new Set(),pendingRedeems:[],pendingRegistrations:[]});

test('tested original vendor file exactly matches review branch blob',()=>assert.equal(sha,'c6aab70b24ea550f6631216526793f799187094c'));
test('missing and revoked tickets never enter',()=>{assert.equal(api.evaluateLocalRedeem(make(),'bad',{listId:3}).reason,'missing');const x=make();x.revokedSecrets.add('key');assert.equal(api.evaluateLocalRedeem(x,'key',{listId:3}).reason,'revoked')});
test('unpaid, missing and pending payment evidence always denied',()=>{for(const status of ['n','',null,'refunded','manual'])assert.equal(api.evaluateLocalRedeem(make(status),'key',{listId:3}).reason,'unpaid');const x=make();x.positionsBySecret.get('key').orderStatus=undefined;assert.equal(api.evaluateLocalRedeem(x,'key',{listId:3}).reason,'unpaid')});
test('wrong list, no list, malformed list fail closed',()=>{for(const listId of [undefined,0,99,'abc'])assert.equal(api.evaluateLocalRedeem(make(),'key',{listId}).reason,'list-not-authorized');assert.equal(api.evaluateLocalRedeem(make('p',[]),'key',{listId:3}).reason,'list-not-authorized')});
test('paid legacy snapshot still requires authenticated server verification',()=>{const result=api.evaluateLocalRedeem(make(),'key',{listId:3});assert.equal(result.ok,false);assert.equal(result.reason,'server-admission-verification-required');assert.throws(()=>api.applyLocalCheckin(),/server reconciliation/)});
test('legacy redemption queue preserved with no POST',async()=>{const x=make();api.enqueuePendingRedeem(x,{secret:'key'});const out=await api.flushPendingRedeems(x);assert.equal(out.flushed,0);assert.equal(out.requiresServerVerification,true);assert.equal(x.pendingRedeems.length,1)});
test('legacy registration queue preserved with no POST or mark-paid',async()=>{const x=make();api.enqueuePendingRegistration(x,{id:'p1'});const out=await api.flushPendingRegistrations(x);assert.equal(out.flushed,0);assert.equal(out.requiresIdempotentServerFlow,true);assert.equal(x.pendingRegistrations.length,1)});
test('queue processing never issues network operations',async()=>{const original=globalThis.fetch;let count=0;globalThis.fetch=async()=>{count++;throw Error('Network forbidden')};try{const x=make();x.pendingRedeems=[{}];x.pendingRegistrations=[{}];await api.flushPendingRedeems(x);await api.flushPendingRegistrations(x);assert.equal(count,0)}finally{globalThis.fetch=original}});
