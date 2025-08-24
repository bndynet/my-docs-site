export function getBlockInCode(code, type) {
  const blocks = getBlocksInCode(code, type);
  if (blocks && blocks.length > 0) {
    return blocks[0];
  }
  return undefined;
}

export function getBlocksInCode(code, type) {
  const regex = new RegExp(`///${type}\\s*([\\s\\S]*?)(?=///\\w+|$)`, 'gi');
  const matches: string[] = [];
  let match;
  while ((match = regex.exec(code)) !== null) {
    matches.push(match[1].trim());
  }
  return matches;
}
