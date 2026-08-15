import { strict as assert } from 'node:assert';
import { basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import describeDefaultExport from './default-export.js';
import {
  moduleLoadCount,
  topicName,
  uppercaseTopicName,
} from './named-exports.js';

const moduleFilePath = fileURLToPath(import.meta.url);
const moduleFolderPath = dirname(moduleFilePath);

console.log('ESM basics');
console.log('==========');
console.log('');

console.log('1. named exports');
console.log(`   topicName -> ${topicName}`);
console.log(
  `   uppercaseTopicName(topicName) -> ${uppercaseTopicName(topicName)}`,
);
console.log('');

console.log('2. default export');
console.log(`   describeDefaultExport() -> ${describeDefaultExport()}`);
console.log('');

console.log('3. import.meta.url');
console.log(`   import.meta.url -> ${import.meta.url}`);
console.log(`   fileURLToPath(import.meta.url) -> ${moduleFilePath}`);
console.log(`   dirname(...) -> ${moduleFolderPath}`);
console.log('');

console.log('4. dynamic import and module cache');
const firstDynamicImport = await import('./named-exports.js');
const secondDynamicImport = await import('./named-exports.js');

console.log(
  `   firstDynamicImport.topicName -> ${firstDynamicImport.topicName}`,
);
console.log(
  `   firstDynamicImport === secondDynamicImport -> ${
    firstDynamicImport === secondDynamicImport
  }`,
);
console.log(`   moduleLoadCount -> ${moduleLoadCount}`);
console.log('');

assert.equal(topicName, 'esm modules');
assert.equal(uppercaseTopicName(topicName), 'ESM MODULES');
assert.equal(
  describeDefaultExport(),
  'default export can be renamed on import',
);
assert.equal(basename(moduleFilePath), 'index.ts');
assert.equal(firstDynamicImport, secondDynamicImport);
assert.equal(moduleLoadCount, 1);

console.log('All ESM observations matched the assertions.');
