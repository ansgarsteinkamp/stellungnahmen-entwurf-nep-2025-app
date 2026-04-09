/**
 * Compute theme-based similarity data for organisations.
 *
 * Each organisation gets a Set of theme indices it participates in.
 * Pairwise Jaccard similarity = |intersection| / |union|.
 */

export function buildThemeSets(themen) {
   const map = new Map(); // orgNr (int) → Set of theme indices
   for (let i = 0; i < themen.length; i++) {
      for (const nr of themen[i].organisationen) {
         if (!map.has(nr)) map.set(nr, new Set());
         map.get(nr).add(i);
      }
   }
   return map;
}

export function jaccard(setA, setB) {
   if (!setA || !setB || setA.size === 0 || setB.size === 0) return 0;
   let intersection = 0;
   for (const v of setA) {
      if (setB.has(v)) intersection++;
   }
   const union = setA.size + setB.size - intersection;
   return union === 0 ? 0 : intersection / union;
}

export function computeSimilarityMatrix(organisationen, themen) {
   const themeSets = buildThemeSets(themen);
   const orgNrs = organisationen.map(o => parseInt(o.nr));
   const n = orgNrs.length;
   const matrix = Array.from({ length: n }, () => new Float32Array(n));

   for (let i = 0; i < n; i++) {
      matrix[i][i] = 1;
      for (let j = i + 1; j < n; j++) {
         const sim = jaccard(themeSets.get(orgNrs[i]), themeSets.get(orgNrs[j]));
         matrix[i][j] = sim;
         matrix[j][i] = sim;
      }
   }

   return { matrix, orgNrs, themeSets };
}
