/**
 * Tests the real `src/common.ts`, not the mock in `src/__mocks__/common.ts`.
 *
 * Every other suite calls `jest.mock('../common')`, so until this file existed
 * the module was never loaded under test and reported no coverage at all. It is
 * also the module that decides how the native module is resolved, which is the
 * behaviour the 1.8.0 release changes, so it is the last place that should go
 * unexercised.
 */
