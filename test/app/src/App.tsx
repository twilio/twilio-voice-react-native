import * as React from 'react';
import { Button, SafeAreaView } from 'react-native';
import { CallSuite } from './CallSuite';
import { PreflightTestSuite } from './PreflightTestSuite';

const defaultSuite = 'none';

export default function App() {
  const [selectedSuite, setSelectedSuite] =
    React.useState<'call' | 'preflightTest' | 'none'>(defaultSuite);

  const suiteSelector = React.useMemo(() => {
    return (
      <SafeAreaView>
        <Button onPress={() => setSelectedSuite('call')} title="CALL SUITE" />
        <Button onPress={() => setSelectedSuite('preflightTest')} title="PREFLIGHT TEST SUITE" />
      </SafeAreaView>
    );
  }, []);

  if (selectedSuite === 'none') {
    return suiteSelector;
  }

  if (selectedSuite === 'call') {
    return <CallSuite />;
  }

  if (selectedSuite === 'preflightTest') {
    return <PreflightTestSuite />;
  }

  return null;
}
