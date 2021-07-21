import * as React from 'react';
import { StyleSheet, View } from 'react-native';

export interface GridProps {
  gridComponents: JSX.Element[][];
  horizontalGapSize?: number;
  verticalGapSize?: number;
}

export default function Grid(props: GridProps) {
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
        },
        expand: {
          flex: 1,
        },
        gapBottom: {
          marginBottom: props.verticalGapSize,
        },
        gapRight: {
          marginRight: props.horizontalGapSize,
        },
      }),
    [props.verticalGapSize, props.horizontalGapSize]
  );

  const mapCell = React.useCallback(
    (cell: JSX.Element, idx: number, arr: Array<any>) => (
      <View
        key={idx}
        style={
          idx < arr.length - 1
            ? [styles.expand, styles.gapRight]
            : styles.expand
        }
      >
        {cell}
      </View>
    ),
    [styles]
  );

  const mapRow = React.useCallback(
    (row: JSX.Element[], idx: number, arr: Array<any>) => (
      <View
        key={idx}
        style={
          idx < arr.length - 1 ? [styles.row, styles.gapBottom] : styles.row
        }
      >
        {row.map(mapCell)}
      </View>
    ),
    [styles, mapCell]
  );

  return <>{props.gridComponents.map(mapRow)}</>;
}
