import { readFileSync } from 'fs';
const tokenString = readFileSync('./e2e-tests-token.txt', 'utf-8');

export function generateAccessToken(identity: string) {
  return tokenString;
}
