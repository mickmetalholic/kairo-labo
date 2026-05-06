const graphName = 'main-graph';

export function getLogseqPage(id: string): string {
  return `kairo-${id}`;
}

export function getLogseqUrl(id: string): string {
  return `logseq://graph/${graphName}?page=${encodeURIComponent(getLogseqPage(id))}`;
}
