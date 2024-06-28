'use strict';

/**
 * This script is used to generate Typescript error classes from the
 * `@twilio/voice-errors` repository for usage within the SDK.
 */

const fs = require('fs');
const VoiceErrors = require('@twilio/voice-errors');
const { ERRORS } = require('./errors');

let output = `/**
 * This is a generated file. Any modifications here will be overwritten.
 * See scripts/errors.js.
 */
import { TwilioError } from './TwilioError';
\n`;

const escapeQuotes = (str) => str.replace("'", "\\'");
const generateStringArray = (arr) =>
  arr
    ? `[
      ${arr.map((value) => `'${escapeQuotes(value)}'`).join(',\n      ')},
    ]`
    : '[]';

const generateDocstring = (content) => [
  '/**',
  ...content.map((c) => ` * ${c}`),
  ' */',
];

const generateDefinition = ([code, subclassName, errorName, error]) => `\
  /**
   * @public
   * ${subclassName}Errors.${errorName} error.
   * Error code \`${code}\`.
   */
  export class ${errorName} extends TwilioError {
    ${generateDocstring(error.causes ?? ['Not applicable.']).join('\n    ')}
    causes: string[] = ${generateStringArray(error.causes)};
    ${generateDocstring([error.description]).join('\n    ')}
    description: string = '${escapeQuotes(error.description)}';
    ${generateDocstring([error.explanation]).join('\n    ')}
    explanation: string = '${escapeQuotes(error.explanation)}';
    ${generateDocstring([error.name]).join('\n    ')}
    name: string = '${escapeQuotes(errorName)}';
    ${generateDocstring(error.solutions ?? ['Not applicable.']).join('\n    ')}
    solutions: string[] = ${generateStringArray(error.solutions)};

    constructor(message: string) {
      super(message, ${code});
      Object.setPrototypeOf(this, ${subclassName}Errors.${errorName}.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = \`\${this.name} (\${this.code}): \${msg}\`;
    }
  }`;

const generateNamespace = (name, contents) => `/**
 * @public
 * ${name} errors.
 */
export namespace ${name}Errors {
${contents}
}\n\n`;

const generateMapEntry = ([code, fullName]) => `[${code}, ${fullName}]`;

const sorter = ([codeA], [codeB]) => codeA - codeB;

const mapEntries = [];
const namespaceDefinitions = new Map();

for (const topClass of VoiceErrors) {
  for (const subclass of topClass.subclasses) {
    const subclassName = subclass.class.replace(' ', '');

    if (!namespaceDefinitions.has(subclassName)) {
      namespaceDefinitions.set(subclassName, []);
    }

    const definitions = namespaceDefinitions.get(subclassName);
    for (const error of subclass.errors) {
      const code =
        topClass.code * 1000 + (subclass.code || 0) * 100 + error.code;
      const errorName = error.name.replace(' ', '');

      const fullName = `${subclassName}Errors.${errorName}`;
      if (ERRORS.includes(fullName)) {
        definitions.push([code, subclassName, errorName, error]);
        mapEntries.push([code, fullName]);
      }
    }
  }
}

for (const [subclassName, definitions] of namespaceDefinitions.entries()) {
  if (definitions.length) {
    output += generateNamespace(
      subclassName,
      definitions.sort(sorter).map(generateDefinition).join('\n\n')
    );
  }
}

output += `/**
 * @internal
 */
export const errorsByCode: ReadonlyMap<number, typeof TwilioError> = new Map([
  ${mapEntries.sort(sorter).map(generateMapEntry).join(',\n  ')},
]);

Object.freeze(errorsByCode);\n`;

fs.writeFileSync('./src/error/generated.ts', output, 'utf8');
