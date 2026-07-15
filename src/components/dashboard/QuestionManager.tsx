import { FileText, Send, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useCommentControl } from '../../hooks/useCommentControl';
import { useQuestions } from '../../hooks/useQuestions';
import {
  activateQuestion,
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

  /* activate=true: 即出題 / false: ⑤下書き保存 */
  const handleCreate = async (activate: boolean) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      await createQuestion(sessionId, trimmed, activate);
      setText('');
      toast.success(activate ? '質問を出題しました' : '下書きを保存しました');
    } catch {
      toast.error(activate ? '質問の出題に失敗しました' : '下書きの保存に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  /* ⑤下書きを出題（active 化）する */
  const handleActivate = async (questionId: string, questionText: string) => {
    if (activeQuestion) {
      toast.error('先に出題中の質問を締め切ってください');
      return;
    }
    try {
      await activateQuestion(sessionId, questionId, questionText);
      toast.success('質問を出題しました');
    } catch {
      toast.error('質問の出題に失敗しました');
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
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCreate(true);
        }}
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="新しい質問を入力..."
          disabled={submitting}
          maxLength={200}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
        />
        <div className="mt-2 flex gap-2">
          {/* ⑤下書き保存（出題中でも準備できる） */}
          <button
            type="button"
            onClick={() => handleCreate(false)}
            disabled={!text.trim() || submitting}
            className="flex items-center gap-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <FileText className="h-4 w-4" /> 下書き保存
          </button>
          <button
            type="submit"
            disabled={!!activeQuestion || !text.trim() || submitting}
            title={activeQuestion ? '出題中の質問を締め切ってください' : undefined}
            className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            <Send className="h-4 w-4" /> 出題
          </button>
        </div>
        {activeQuestion && (
          <p className="mt-1.5 text-xs text-gray-400">
            出題中の質問を締め切ると、下書きを出題できます
          </p>
        )}
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
              className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`shrink-0 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    q.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : q.status === 'draft'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {q.status === 'active' ? '受付中' : q.status === 'draft' ? '下書き' : '締切'}
                </span>
                <span className="text-sm text-gray-700 truncate">{q.text}</span>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {/* ⑤下書きは出題できる */}
                {q.status === 'draft' && (
                  <button
                    onClick={() => handleActivate(q.id, q.text)}
                    disabled={!!activeQuestion}
                    title={activeQuestion ? '出題中の質問を締め切ってください' : '出題する'}
                    className="flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-40"
                  >
                    <Send className="h-3.5 w-3.5" /> 出題
                  </button>
                )}
                <button
                  onClick={() => handleDelete(q.id)}
                  className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
