import * as React from 'react';
import { StyleSheet, View } from 'react-native';

export interface GridProps {
  gridComponents: JSX.Element[][];
}

const mapCell = (cell: JSX.Element, idx: number) => (
  <View key={idx} style={styles.expand}>
    {cell}
  </View>
);

const mapRow = (row: JSX.Element[], idx: number) => (
  <View key={idx} style={styles.row}>
    {row.map(mapCell)}
  </View>
);

export default function Grid(props: GridProps) {
  return <>{props.gridComponents.map(mapRow)}</>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  expand: {
    flex: 1,
  },
});
