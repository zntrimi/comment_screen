import { COLOR_PRESETS } from '../../utils/constants';

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

export function ColorPicker({ selectedColor, onColorChange }: ColorPickerProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {COLOR_PRESETS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onColorChange(color)}
          className="w-8 h-8 rounded-full border-2 transition-transform"
          style={{
            backgroundColor: color,
            borderColor: selectedColor === color ? '#3B82F6' : '#D1D5DB',
            transform: selectedColor === color ? 'scale(1.2)' : 'scale(1)',
          }}
        />
      ))}
    </div>
  );
}
