import { Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { updateSessionSettings } from '../../services/sessionService';
import type { SessionSettings as SessionSettingsType } from '../../types';
import { NGWordManager } from './NGWordManager';

interface SessionSettingsProps {
  sessionId: string;
  settings: SessionSettingsType;
}

export function SessionSettings({ sessionId, settings }: SessionSettingsProps) {
  const [maxCommentLength, setMaxCommentLength] = useState(settings.maxCommentLength);
  const [rateLimitSeconds, setRateLimitSeconds] = useState(settings.rateLimitSeconds);
  const [scrollSpeedSeconds, setScrollSpeedSeconds] = useState(settings.scrollSpeedSeconds);
  const [backgroundColor, setBackgroundColor] = useState(settings.backgroundColor);
  const [defaultCommentColor, setDefaultCommentColor] = useState(settings.defaultCommentColor);

  const handleSave = async () => {
    await updateSessionSettings(sessionId, {
      maxCommentLength,
      rateLimitSeconds,
      scrollSpeedSeconds,
      backgroundColor,
      defaultCommentColor,
    });
    toast.success('設定を保存しました');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-xs text-gray-600">最大文字数</span>
          <input
            type="number"
            value={maxCommentLength}
            onChange={(e) => setMaxCommentLength(Number(e.target.value))}
            min={1}
            max={500}
            className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs text-gray-600">レート制限(秒)</span>
          <input
            type="number"
            value={rateLimitSeconds}
            onChange={(e) => setRateLimitSeconds(Number(e.target.value))}
            min={0}
            max={60}
            className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs text-gray-600">スクロール速度(秒)</span>
          <input
            type="number"
            value={scrollSpeedSeconds}
            onChange={(e) => setScrollSpeedSeconds(Number(e.target.value))}
            min={1}
            max={30}
            className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs text-gray-600">背景色</span>
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="mt-1 h-8 w-full cursor-pointer rounded border border-gray-300"
          />
        </label>
        <label className="block">
          <span className="text-xs text-gray-600">デフォルトコメント色</span>
          <input
            type="color"
            value={defaultCommentColor}
            onChange={(e) => setDefaultCommentColor(e.target.value)}
            className="mt-1 h-8 w-full cursor-pointer rounded border border-gray-300"
          />
        </label>
      </div>

      <NGWordManager sessionId={sessionId} ngWords={settings.ngWords} />

      <button
        onClick={handleSave}
        className="flex items-center gap-1 rounded-lg bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
      >
        <Save className="h-4 w-4" />
        設定を保存
      </button>
    </div>
  );
}
