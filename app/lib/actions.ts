'use server';

import { lookupSerial as lookupSerialInDb } from './data';

export async function lookupSerial(serial: string): Promise<string> {
  return lookupSerialInDb(serial);
}
