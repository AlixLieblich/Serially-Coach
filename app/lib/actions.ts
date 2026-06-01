'use server';

import { lookupSerial as lookupSerialInDb } from './serial';

export async function lookupSerial(serial: string): Promise<string> {
  return lookupSerialInDb(serial);
}
