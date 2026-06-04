import type { StyleColorOption } from '@/app/lib/definitions';

export default function BagColorSelect({
  id,
  name,
  colorOptions,
  defaultValue,
}: {
  id: string;
  name: string;
  colorOptions: StyleColorOption[];
  defaultValue?: number | null;
}) {
  return (
    <select
      id={id}
      name={name}
      defaultValue={defaultValue != null ? String(defaultValue) : ''}
      className="mb-3 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-black/50 focus:outline-none focus:ring-1 focus:ring-black/30"
    >
      <option value="">No color selected</option>
      {colorOptions.map((color) => (
        <option key={color.bag_color_id} value={color.bag_color_id}>
          {color.name}
        </option>
      ))}
    </select>
  );
}
