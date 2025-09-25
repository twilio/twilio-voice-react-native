import * as React from 'react';
import { DefaultSuite } from './DefaultSuite';
import { PreflightTestSuite } from './PreflightTestSuite';
import { suite } from './e2e-tests-config';

export default function App() {
  switch (suite as string) {
    case 'preflightTest':
      return <PreflightTestSuite />;
    default:
      return <DefaultSuite />;
  }
}
