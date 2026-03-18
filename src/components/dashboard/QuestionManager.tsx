import { Send, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useCommentControl } from '../../hooks/useCommentControl';
import { useQuestions } from '../../hooks/useQuestions';
import {
  closeActiveQuestion,
  createQuestion,
  deleteQuestion,
} from '../../services/commentControlService';

interface QuestionManagerProps {
  sessionId: string;
}

export function QuestionManager({ sessionId }: QuestionManagerProps) {
  const { activeQuestion } = useCommentControl(sessionId);
  const { questions } = useQuestions(sessionId);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const sorted = [...questions].reverse();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      await createQuestion(sessionId, trimmed);
      setText('');
      toast.success('質問を作成しました');
    } catch {
      toast.error('質問の作成に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async () => {
    if (!activeQuestion) return;
    try {
      await closeActiveQuestion(sessionId, activeQuestion.id);
      toast.success('質問を締め切りました');
    } catch {
      toast.error('質問の締め切りに失敗しました');
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm('この質問を削除しますか？')) return;
    try {
      await deleteQuestion(sessionId, questionId);
      toast.success('質問を削除しました');
    } catch {
      toast.error('質問の削除に失敗しました');
    }
  };

  return (
    <div className="space-y-4">
      {/* Active question banner */}
      {activeQuestion && (
        <div className="rounded-lg border border-green-300 bg-green-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <span className="inline-block rounded bg-green-600 px-2 py-0.5 text-xs font-bold text-white mb-1">
                質問中
              </span>
              <p className="text-sm font-medium text-green-900">
                {activeQuestion.text}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="flex items-center gap-1 rounded-lg border border-green-300 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100"
            >
              <X className="h-3.5 w-3.5" /> 締め切り
            </button>
          </div>
        </div>
      )}

      {/* New question form */}
      <form onSubmit={handleCreate}>
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={activeQuestion ? '質問を締め切ってから次の質問を作成できます' : '新しい質問を入力...'}
            disabled={!!activeQuestion || submitting}
            maxLength={200}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
          />
          <button
            type="submit"
            disabled={!!activeQuestion || !text.trim() || submitting}
            className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            <Send className="h-4 w-4" /> 出題
          </button>
        </div>
      </form>

      {/* Question history */}
      {sorted.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-8">
          まだ質問はありません
        </p>
      ) : (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-gray-500 uppercase">質問履歴</h3>
          {sorted.map((q) => (
            <div
              key={q.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`shrink-0 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    q.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {q.status === 'active' ? '受付中' : '締切'}
                </span>
                <span className="text-sm text-gray-700 truncate">{q.text}</span>
              </div>
              <button
                onClick={() => handleDelete(q.id)}
                className="shrink-0 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
