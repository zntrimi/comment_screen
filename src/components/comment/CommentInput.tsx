import { Send } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import type { CommentFontSize, CommentPosition, SessionSettings } from '../../types';
import { containsNGWord } from '../../utils/ngWordFilter';

interface CommentInputProps {
  settings: SessionSettings;
  canPost: boolean;
  remaining: number;
  onSubmit: (data: {
    text: string;
    color: string;
    position: CommentPosition;
    fontSize: CommentFontSize;
  }) => void;
}

export function CommentInput({
  settings,
  canPost,
  remaining,
  onSubmit,
}: CommentInputProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    if (containsNGWord(trimmed, settings.ngWords)) {
      toast.error('不適切な表現が含まれています');
      return;
    }

    onSubmit({
      text: trimmed,
      color: '#FFFFFF',
      position: 'scroll',
      fontSize: 'medium',
    });
    setText('');
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={settings.maxCommentLength}
          placeholder="コメントを送ろう！"
          autoFocus
          className="flex-1 rounded-xl bg-gray-800 border border-gray-700 px-4 py-3 text-base text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!canPost || !text.trim()}
          className="flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-white disabled:opacity-30 hover:bg-blue-500 active:scale-95 transition-all min-w-[56px]"
        >
          {remaining > 0 ? (
            <span className="text-sm font-bold">{remaining}</span>
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>
    </form>
  );
}
