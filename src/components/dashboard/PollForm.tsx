import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { createPoll } from '../../services/pollService';
import type { PollStatus } from '../../types';

interface PollFormProps {
  sessionId: string;
}

export function PollForm({ sessionId }: PollFormProps) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canAddOption = options.length < 4;
  const canRemoveOption = options.length > 2;

  const handleOptionChange = (index: number, value: string) => {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  };

  const addOption = () => {
    if (canAddOption) setOptions((prev) => [...prev, '']);
  };

  const removeOption = (index: number) => {
    if (canRemoveOption) setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (status: PollStatus) => {
    const trimmedQuestion = question.trim();
    const trimmedOptions = options.map((o) => o.trim()).filter((o) => o);

    if (!trimmedQuestion) {
      toast.error('質問を入力してください');
      return;
    }
    if (trimmedOptions.length < 2) {
      toast.error('選択肢を2つ以上入力してください');
      return;
    }

    setIsSubmitting(true);
    try {
      await createPoll(sessionId, {
        question: trimmedQuestion,
        options: trimmedOptions,
        status,
      });
      setQuestion('');
      setOptions(['', '']);
      toast.success(status === 'open' ? '投票を公開しました' : '下書きを保存しました');
    } catch {
      toast.error('投票の作成に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border bg-white p-4 space-y-3">
      <h3 className="text-sm font-bold text-gray-900">新しい投票を作成</h3>

      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="質問を入力..."
        maxLength={200}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />

      <div className="space-y-2">
        {options.map((option, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-4 shrink-0">{i + 1}.</span>
            <input
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(i, e.target.value)}
              placeholder={`選択肢 ${i + 1}`}
              maxLength={100}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
            />
            {canRemoveOption && (
              <button
                type="button"
                onClick={() => removeOption(i)}
                className="rounded p-1 text-gray-400 hover:text-red-500"
              >
                <Minus className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}

        {canAddOption && (
          <button
            type="button"
            onClick={addOption}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
          >
            <Plus className="h-3.5 w-3.5" /> 選択肢を追加
          </button>
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => handleSubmit('draft')}
          disabled={isSubmitting}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          下書き保存
        </button>
        <button
          onClick={() => handleSubmit('open')}
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-500 disabled:opacity-50"
        >
          作成して公開
        </button>
      </div>
    </div>
  );
}
