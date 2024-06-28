/**
 * =============================================================================
 * NOTE(mhuynh): if tests fail in this file, ensure that errors have been
 * generated. Try `yarn run build:errors`.
 * =============================================================================
 */

import { errorsByCode } from '../../error/generated';
import { TwilioErrors } from '../../index';

jest.mock('../../common');

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

const getNamesFromExport = () => {
  return Object.values(TwilioErrors).reduce<{
    namespaced: string[];
    nonNamespaced: string[];
  }>(
    (reduction, errorOrNamespace) => {
      switch (typeof errorOrNamespace) {
        case 'function':
          return {
            ...reduction,
            nonNamespaced: [...reduction.nonNamespaced, errorOrNamespace.name],
          };
        case 'object':
          const errorNames = Object.values(errorOrNamespace).map(
            (errorConstructorOrConstant) => {
              switch (typeof errorConstructorOrConstant) {
                case 'function':
                  return errorConstructorOrConstant.name;
              }
            }
          );
          return {
            ...reduction,
            namespaced: [...reduction.namespaced, ...errorNames],
          };
      }
    },
    {
      nonNamespaced: [],
      namespaced: [],
    }
  );
};

describe('generated errors', () => {
  it('contains all the expected error classes', () => {
    const ErrorNamespaces = Object.entries(TwilioErrors).filter(([k]) => {
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

  for (const [code, ErrorClass] of errorsByCode.entries()) {
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
    expect(errorsByCode).toBeInstanceOf(Map);
  });

  it('contains "undefined" for an error code that does not exist', () => {
    expect(errorsByCode.get(999999)).toBeUndefined();
  });

  it('contains an entry for every exported error', () => {
    const namesFromMap = Array.from(errorsByCode.values()).map(
      (errorConstructor) => errorConstructor.name
    );

    expect(namesFromMap.sort()).toStrictEqual(
      getNamesFromExport().namespaced.sort()
    );
  });
});
