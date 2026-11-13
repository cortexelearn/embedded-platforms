import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const names = ['AI','MBA','AM','MOTOR','EMBED','COPILOT','AGENTIC'].flatMap(n=>[n+'_LESSONS',n+'_FINAL_EXAM']);
export const readHTML = () => fs.readFileSync(path.join(root,'index.html'),'utf8');
export function script(html) { const m=html.match(/<script\s+type="text\/babel"[^>]*>([\s\S]*?)<\/script>/); if(!m) throw Error('Missing Babel script'); return m[1]; }
// Arrays are isolated before evaluation: no React, JSX, or app startup executes.
export function extract(html=readHTML()) { const src=script(html), out={}; for(const name of names) { const start=src.indexOf('const '+name+' = ['); if(start<0) throw Error('Missing '+name); const end=src.indexOf('\n];',start); if(end<0) throw Error('Unterminated '+name); out[name]=JSON.parse(JSON.stringify(vm.runInNewContext(src.slice(start,end+3)+';'+name,{}, {timeout:2000}))); } return out; }
export const hash = a=>createHash('sha256').update(JSON.stringify(a)).digest('hex');
export function functions(html=readHTML()) { const src=script(html); const start=src.indexOf('function shuffleArray('), end=src.indexOf('function FinalExamView(',start); if(start<0||end<0) throw Error('Exam helper boundaries missing'); const ctx=vm.createContext({}); vm.runInContext(src.slice(start,end)+';globalThis.build=buildExamAttempt',ctx); return (pool,seed)=>{ctx.pool=pool;ctx.seed=seed>>>0;vm.runInContext('Math.random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296}',ctx);return JSON.parse(JSON.stringify(ctx.build(pool)));}; }
export function safeFunction(html=readHTML()) { const m=script(html).match(/function safeLessonIndex\([^]*?\n}/); if(!m) throw Error('safeLessonIndex missing');return vm.runInNewContext('('+m[0]+')'); }
export function direct(url) { return process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(url); }
if(direct(import.meta.url)) { try {const a=extract();if(Object.keys(a).length!==14)throw Error('Expected 14 arrays');for(const [name,v]of Object.entries(a))console.log(JSON.stringify({repo:path.basename(root),array:name,length:v.length,sha256:hash(v)}));console.log('PASS extract: 14 arrays');}catch(e){console.error('FAIL extract:',e.message);process.exitCode=1;} }
