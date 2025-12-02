import React from 'react';
import { Button, StyleSheet, View } from 'react-native';

import { useVoice } from '@/hooks/useVoice';

export function HomeScreen() {
  const {
    voiceConnect,
    callDisconnect,
    voiceStartPreflight,
    voiceRegister,
  } = useVoice();

  return (
    <View style={styles.container}>
      <View>
        <Button title='Register' onPress={voiceRegister} />
      </View>
      <View>
        <Button title='Voice Connect' onPress={voiceConnect} />
      </View>
      <View>
        <Button title='Call Disconnect' onPress={callDisconnect} />
      </View>
      <View>
        <Button title='Voice Start Preflight' onPress={voiceStartPreflight} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
});

export default HomeScreen;
