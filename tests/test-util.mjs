import assert from 'node:assert/strict';
export {assert};
export async function suite(name,body) { let pass=0,fail=0,skip=0;const t={check(label,fn){try{fn();pass++;}catch(e){fail++;console.error('FAIL',label,e.message);}},skip(label){skip++;console.log('SKIP',label);}};try{await body(t);}catch(e){fail++;console.error('FAIL',name,e.stack);}console.log(`${name}: ${pass} pass, ${fail} fail, ${skip} skip`);if(fail)process.exitCode=1; }
export const markers=s=>/`|\*\*|(^|[\s(])\*\S/.test(s);
