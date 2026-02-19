import { Plus } from 'lucide-react';
import { useState } from 'react';

interface SessionFormProps {
  onSubmit: (name: string) => void;
}

export function SessionForm({ onSubmit }: SessionFormProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setName('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="セッション名を入力..."
        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={!name.trim()}
        className="flex items-center gap-1 rounded-lg bg-blue-500 px-4 py-2 text-sm text-white disabled:opacity-50 hover:bg-blue-600 transition-colors"
      >
        <Plus className="h-4 w-4" />
        作成
      </button>
    </form>
  );
}
