import * as React from 'react';
import { Button, View } from 'react-native';
import { CallSuite } from './CallSuite';
import { PreflightTestSuite } from './PreflightTestSuite';

const defaultSuite = 'none';

export default function App() {
  const [selectedSuite, setSelectedSuite] =
    React.useState<'call' | 'preflightTest' | 'none'>(defaultSuite);

  const suiteSelector = React.useMemo(() => {
    return (
      <View>
        <Button onPress={() => setSelectedSuite('call')} title="Call Suite" />
        <Button onPress={() => setSelectedSuite('preflightTest')} title="Preflight Test Suite" />
      </View>
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
