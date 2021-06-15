import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import { Voice } from 'twilio-voice-react-native';

export default function App() {
  const [result, setResult] = React.useState<string | undefined>();

  React.useEffect(() => {
    const voice = new Voice('foobar');
    const run = async () => {
      setResult(await voice.getVersion());
    };
    run();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Result: {result}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
