import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { updateSessionSettings } from '../../services/sessionService';

interface NGWordManagerProps {
  sessionId: string;
  ngWords: string[];
}

export function NGWordManager({ sessionId, ngWords }: NGWordManagerProps) {
  const [newWord, setNewWord] = useState('');

  const handleAdd = async () => {
    const trimmed = newWord.trim();
    if (!trimmed || ngWords.includes(trimmed)) return;
    await updateSessionSettings(sessionId, {
      ngWords: [...ngWords, trimmed],
    });
    setNewWord('');
  };

  const handleRemove = async (word: string) => {
    await updateSessionSettings(sessionId, {
      ngWords: ngWords.filter((w) => w !== word),
    });
  };

  return (
    <div>
      <span className="text-xs text-gray-600">NGワード</span>
      <div className="mt-1 flex gap-2">
        <input
          type="text"
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          placeholder="NGワードを追加..."
          className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newWord.trim()}
          className="rounded bg-gray-200 p-1 text-gray-600 disabled:opacity-50 hover:bg-gray-300"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {ngWords.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {ngWords.map((word) => (
            <span
              key={word}
              className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-700"
            >
              {word}
              <button onClick={() => handleRemove(word)} className="hover:text-red-900">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
