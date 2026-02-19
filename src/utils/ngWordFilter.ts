import ngWordsRaw from '../data/ng-words-ja.txt?raw';

const builtInNGWords: string[] = ngWordsRaw
  .split('\n')
  .map((w) => w.trim())
  .filter((w) => w.length > 0);

export function containsNGWord(text: string, sessionNGWords: string[]): boolean {
  const allWords = [...builtInNGWords, ...sessionNGWords];
  if (allWords.length === 0) return false;
  const lowerText = text.toLowerCase();
  return allWords.some((word) => {
    if (word.trim() === '') return false;
    return lowerText.includes(word.toLowerCase());
  });
}

export function getBuiltInNGWordCount(): number {
  return builtInNGWords.length;
}
