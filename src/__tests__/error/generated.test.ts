/**
 * =============================================================================
 * NOTE(mhuynh): if errors fail in this file, ensure that errors have been
 * generated. Try `yarn run build:errors`.
 * =============================================================================
 */

import * as GeneratedErrors from '../../error/generated';

/**
 * NOTE(mhuynh): We can import the USED_ERRORS array from the generation script
 * to check that the generated errors actually contain all the expected/desired
 * errors.
 *
 * We need to ts-ignore the import since the file is plain JS.
 */
// @ts-ignore
import { ERRORS } from '../../../scripts/errors.js';
const TYPED_ERRORS = ERRORS as string[];

describe('generated errors', () => {
  it('contains all the expected error classes', () => {
    const ErrorNamespaces = Object.entries(GeneratedErrors).filter(([k]) => {
      return k !== 'errorsByCode';
    });

    const generatedErrorNames = ErrorNamespaces.flatMap(
      ([namespace, namespaceErrors]) => {
        return Object.keys(namespaceErrors).flatMap((errorName) => {
          return `${namespace}.${errorName}`;
        });
      }
    );

    expect(generatedErrorNames.sort()).toStrictEqual(TYPED_ERRORS.sort());
  });

  for (const [code, ErrorClass] of GeneratedErrors.errorsByCode.entries()) {
    describe(`${ErrorClass.name} - ${code}`, () => {
      it('constructs', () => {
        expect(() => new ErrorClass('foobar')).not.toThrow();
      });

      it('defaults the message to the explanation', () => {
        let error: InstanceType<typeof ErrorClass> | null = null;
        expect(
          () => (error = new (ErrorClass as any)(undefined))
        ).not.toThrow();
        expect(error).not.toBeNull();
        const msg = `${error!.name} (${error!.code}): ${error!.explanation}`;
        expect(error!.message).toBe(msg);
      });
    });
  }
});

describe('errorsByCode', () => {
  it('is a Map', () => {
    expect(GeneratedErrors.errorsByCode).toBeInstanceOf(Map);
  });

  it('contains "undefined" for an error code that does not exist', () => {
    expect(GeneratedErrors.errorsByCode.get(999999)).toBeUndefined();
  });
});
