export const COLOR_PRESETS = [
  '#FFFFFF',
  '#FF0000',
  '#FF8800',
  '#FFFF00',
  '#00FF00',
  '#00FFFF',
  '#0088FF',
  '#FF00FF',
] as const;

export const FONT_SIZE_MAP = {
  small: 48,
  medium: 64,
  large: 84,
} as const;

export const LANE_HEIGHT = 72;

// オーバーレイの基準解像度（高さ）。フォントサイズ・レーン位置はこの高さを前提に
// 定義しており、実際の表示高さとの比率でスケールさせて解像度非依存にする。
export const REFERENCE_HEIGHT = 1080;

export const POLL_OPTION_COLORS = [
  '#3B82F6', // blue
  '#F59E0B', // amber
  '#10B981', // green
  '#EF4444', // red
] as const;

export const REACTION_EMOJIS = ['👍', '❤️', '😂', '👏', '🎉', '😮'] as const;

export const REACTION_FLOAT_DURATION_MS = 2500;
