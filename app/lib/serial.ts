import postgres from 'postgres';
import { MonthCode, SerialLookupResult, YearCode } from './definitions';

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

type StyleLookupRow = {
  style_name: string | null;
  category: string | null;
  production_start: number | null;
  production_end: number | null;
  colors: string[];
};

function formatProductionYear(year: number | null): string {
  return year != null ? String(year) : 'Unknown';
}

export async function lookupSerial(
  serial: string,
): Promise<SerialLookupResult | string> {
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
      sql<StyleLookupRow[]>`
        SELECT
          s.style_name,
          s.category,
          s.production_start,
          s.production_end,
          COALESCE(
            array_agg(DISTINCT bc.name ORDER BY bc.name)
              FILTER (WHERE bc.name IS NOT NULL),
            ARRAY[]::text[]
          ) AS colors
        FROM styles s
        LEFT JOIN style_colors sc ON sc.style_id = s.id
        LEFT JOIN bag_colors bc ON bc.bag_color_id = sc.color_id
        WHERE s.style_number = ${styleNumber}
        GROUP BY s.id, s.style_name, s.category, s.production_start, s.production_end
        LIMIT 1
      `,
    ]);

    const month = monthRows[0]?.month_name ?? `Unknown (code "${monthCode}")`;
    const year =
      yearRows[0]?.year != null
        ? String(yearRows[0].year)
        : `Unknown (code "${yearCode}")`;
    const style = styleRows[0];

    if (!style) {
      return {
        month,
        year,
        style: `Unknown (style #${styleNumber})`,
        category: 'Unknown',
        productionStart: 'Unknown',
        productionEnd: 'Unknown',
        colors: [],
      };
    }

    return {
      month,
      year,
      style: style.style_name ?? `Unknown (style #${styleNumber})`,
      category: style.category ?? 'Unknown',
      productionStart: formatProductionYear(style.production_start),
      productionEnd: formatProductionYear(style.production_end),
      colors: style.colors,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to look up serial.');
  }
}
