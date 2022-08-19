var RNFS = require('react-native-fs');
const tokenString = RNFS.readFile('./e2e-tests-token.txt', 'utf-8');

export function generateAccessToken() {
  console.log(tokenString);
  return tokenString;
}
