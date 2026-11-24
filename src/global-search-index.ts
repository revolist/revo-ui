export interface SearchEntry {
  id: string;
  label: string;
  description: string;
  href: string;
  kind: string;
  keywords?: string;
}

const words = (value: string) =>
  value
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .match(/[a-z0-9]+/g) ?? [];

function oneEditApart(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0,
    j = 0,
    edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length === b.length && a[i] === b[j + 1] && a[i + 1] === b[j]) {
      i += 2;
      j += 2;
    } else if (a.length > b.length) i++;
    else if (a.length < b.length) j++;
    else {
      i++;
      j++;
    }
  }
  return edits + Number(i < a.length || j < b.length) <= 1;
}

/** Rank all query terms, including out-of-order words and a single typo per word. */
export function searchEntries(
  entries: readonly SearchEntry[],
  query: string,
  limit = 12,
): SearchEntry[] {
  const terms = words(query);
  if (!terms.length) return entries.slice(0, limit);
  const queryText = terms.join(' ');
  return entries
    .map((entry, index) => {
      const labelWords = words(entry.label);
      const label = labelWords.join(' ');
      const otherWords = words(`${entry.description} ${entry.keywords ?? ''}`);
      let score =
        label === queryText ? 120 : label.startsWith(queryText) ? 80 : 0;
      for (const term of terms) {
        let best = 0;
        for (const token of labelWords) {
          if (token === term) best = Math.max(best, 35);
          else if (token.startsWith(term)) best = Math.max(best, 25);
          else if (token.includes(term)) best = Math.max(best, 15);
          else if (term.length >= 4 && oneEditApart(term, token))
            best = Math.max(best, 10);
        }
        for (const token of otherWords) {
          if (token === term) best = Math.max(best, 8);
          else if (token.startsWith(term)) best = Math.max(best, 5);
          else if (term.length >= 4 && oneEditApart(term, token))
            best = Math.max(best, 2);
        }
        if (!best) return { entry, score: -1, index };
        score += best;
      }
      return { entry, score, index };
    })
    .filter((item) => item.score >= 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((item) => item.entry);
}
