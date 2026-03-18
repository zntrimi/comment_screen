import { HelpCircle } from 'lucide-react';

interface ActiveQuestionProps {
  text: string;
}

export function ActiveQuestion({ text }: ActiveQuestionProps) {
  return (
    <div className="rounded-xl border border-yellow-600/40 bg-yellow-900/30 p-3">
      <div className="flex items-start gap-2">
        <HelpCircle className="h-5 w-5 shrink-0 text-yellow-400 mt-0.5" />
        <div className="min-w-0">
          <span className="inline-block rounded bg-yellow-600 px-1.5 py-0.5 text-[10px] font-bold text-white mb-1">
            質問
          </span>
          <p className="text-sm font-medium text-yellow-100">{text}</p>
          <p className="text-xs text-yellow-400/80 mt-1">コメント欄から回答してください</p>
        </div>
      </div>
    </div>
  );
}
