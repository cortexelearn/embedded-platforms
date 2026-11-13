import {createRequire} from 'node:module';
import path from 'node:path';import {pathToFileURL} from 'node:url';
export async function optional(name){for(const base of [import.meta.url,...(process.env.COURSE_TEST_NODE_MODULES?[pathToFileURL(path.join(path.resolve(process.env.COURSE_TEST_NODE_MODULES),'..','optional.mjs')).href]:[])])try{return await import(createRequire(base).resolve(name));}catch(e){if(e.code!=='MODULE_NOT_FOUND'&&e.code!=='ERR_MODULE_NOT_FOUND')throw e;}return null;}
