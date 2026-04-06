export function buildOrgMap(organisationen) {
   const map = new Map();
   for (const org of organisationen) {
      map.set(org.nr, org);
   }
   return map;
}

export function getStatementText(s) {
   if ("dokument" in s) return s.dokument;
   return s.stellungnahme;
}

export function highlightAll(text, query) {
   if (!text || !query || query.length < 2) return null;
   const lower = text.toLowerCase();
   const q = query.toLowerCase();
   if (!lower.includes(q)) return null;

   const parts = [];
   let lastIdx = 0;
   let matchIdx = lower.indexOf(q);
   while (matchIdx !== -1) {
      if (matchIdx > lastIdx) parts.push({ text: text.slice(lastIdx, matchIdx), hl: false });
      parts.push({ text: text.slice(matchIdx, matchIdx + query.length), hl: true });
      lastIdx = matchIdx + query.length;
      matchIdx = lower.indexOf(q, lastIdx);
   }
   if (lastIdx < text.length) parts.push({ text: text.slice(lastIdx), hl: false });
   return parts;
}

export function highlightParts(text, query, contextChars = 100) {
   if (!text || !query || query.length < 2) return null;
   const lower = text.toLowerCase();
   const q = query.toLowerCase();
   const idx = lower.indexOf(q);
   if (idx === -1) return null;

   const start = Math.max(0, idx - contextChars);
   const end = Math.min(text.length, idx + query.length + contextChars);
   const snippet = (start > 0 ? "\u2026" : "") + text.slice(start, end) + (end < text.length ? "\u2026" : "");

   const parts = [];
   let lastIdx = 0;
   const snippetLower = snippet.toLowerCase();
   let matchIdx = snippetLower.indexOf(q);
   while (matchIdx !== -1) {
      if (matchIdx > lastIdx) parts.push({ text: snippet.slice(lastIdx, matchIdx), hl: false });
      parts.push({ text: snippet.slice(matchIdx, matchIdx + query.length), hl: true });
      lastIdx = matchIdx + query.length;
      matchIdx = snippetLower.indexOf(q, lastIdx);
   }
   if (lastIdx < snippet.length) parts.push({ text: snippet.slice(lastIdx), hl: false });
   return parts;
}
