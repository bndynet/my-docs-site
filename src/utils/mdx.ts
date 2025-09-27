export function getBlockInCode(code: string, type: string): string | undefined {
  const blocks = getBlocksInCode(code, type);
  if (blocks && blocks.length > 0) {
    return blocks[0];
  }
  return undefined;
}

export function getBlocksInCode(code: string, type: string): string[] {
  const regex = new RegExp(`///${type}\\s*([\\s\\S]*?)(?=///\\w+|$)`, 'gi');
  const matches: string[] = [];
  let match;
  while ((match = regex.exec(code)) !== null) {
    matches.push(match[1].trim());
  }
  return matches;
}

export function wrapJsxLiveCode(code: string) {
  const trimmed = code.trim();

  if (/\b(import|export|function|class|render)\b/.test(trimmed)) {
    return code;
  }

  return `function App() {\n${code}\n}`;
}
