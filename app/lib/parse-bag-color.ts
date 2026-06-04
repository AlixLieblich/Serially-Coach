export function parseBagColorId(
  value: FormDataEntryValue | null,
): number | null {
  const raw = String(value ?? '').trim();
  if (!raw) return null;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}
