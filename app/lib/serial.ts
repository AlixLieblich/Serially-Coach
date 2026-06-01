import postgres from 'postgres';
import { MonthCode, Style, YearCode } from './definitions';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function fetchYears(): Promise<number[]> {
  try {
    const data = await sql<Pick<YearCode, 'year'>[]>`
      SELECT year FROM year_codes ORDER BY year
    `;
    return data.map((row) => row.year);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch years.');
  }
}

type ParsedSerial = {
  monthCode: string;
  yearCode: string;
  styleNumber: string;
};

function parseSerial(input: string): ParsedSerial | { error: string } {
  const trimmed = input.trim();
  const match = trimmed.match(/^([a-zA-Z])(\d)([a-zA-Z])-?(\d{4})$/);

  if (!match) {
    return {
      error:
        'Invalid format. Expected letter + number + letter + 4 digits (e.g. K8P-9870 or K8P9870).',
    };
  }

  const [, monthLetter, yearCode, , styleNumber] = match;
  return {
    monthCode: monthLetter.toUpperCase(),
    yearCode,
    styleNumber,
  };
}

export async function lookupSerial(serial: string): Promise<string> {
  const trimmed = serial.trim();
  if (!trimmed) {
    return 'Enter a serial number.';
  }

  const parsed = parseSerial(trimmed);
  if ('error' in parsed) {
    return parsed.error;
  }

  const { monthCode, yearCode, styleNumber } = parsed;

  try {
    const [monthRows, yearRows, styleRows] = await Promise.all([
      sql<Pick<MonthCode, 'month_name'>[]>`
        SELECT month_name FROM month_codes WHERE code = ${monthCode} LIMIT 1
      `,
      sql<Pick<YearCode, 'year'>[]>`
        SELECT year FROM year_codes WHERE code = ${yearCode} LIMIT 1
      `,
      sql<Pick<Style, 'style_name' | 'category'>[]>`
        SELECT style_name, category FROM styles WHERE style_number = ${styleNumber} LIMIT 1
      `,
    ]);

    const month = monthRows[0]?.month_name ?? `Unknown (code "${monthCode}")`;
    const year = yearRows[0]?.year ?? `Unknown (code "${yearCode}")`;
    const style = styleRows[0];

    const styleLine = style
      ? [style.style_name, style.category].filter(Boolean).join(' · ') ||
        styleNumber
      : `Unknown (style #${styleNumber})`;

    return `Month: ${month}\nYear: ${year}\nStyle: ${styleLine}`;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to look up serial.');
  }
}
