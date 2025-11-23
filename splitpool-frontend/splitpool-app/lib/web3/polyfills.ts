// polyfills.ts
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

import { Buffer } from 'buffer';
if (!(global as any).Buffer) {
  (global as any).Buffer = Buffer;
}

import process from 'process';
if (!(global as any).process) {
  (global as any).process = process;

  // Algunas libs esperan process.env
  (global as any).process.env = (global as any).process.env || {};
}