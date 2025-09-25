import * as React from 'react';
import { DefaultSuite } from './DefaultSuite';
import { PreflightTestSuite } from './PreflightTestSuite';

const { suite } = require('../e2e-tests-config.js');

export default function App() {
  switch (suite as string) {
    case 'preflightTest':
      return <PreflightTestSuite />;
    default:
      return <DefaultSuite />;
  }
}
