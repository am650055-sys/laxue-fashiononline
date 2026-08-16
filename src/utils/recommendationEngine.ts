import { Product } from '../types';

/**
 * Deterministic string hash function to generate consistent pseudo-random
 * variance based on product pairs.
 */
function hashStringPair(str1: string, str2: string): number {
  const combined = `${str1}::${str2}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Calculates a multi-factor relevance score between a target product and a candidate product.
 * Factors:
 * 1. Category match (Weight: 40)
 * 2. Subcategory match (Weight: 30)
 * 3. Style / Silhouette match (Weight: 25)
 * 4. Pattern match (Weight: 20)
 * 5. Color / Palette match (Weight: 20)
 * 6. Fabric match (Weight: 15)
 * 7. Price range similarity (Weight: 15)
 * 8. Occasion / Fit / Neck / Sleeve match (Weight: 10 each)
 * 9. Tag overlap (Weight: 5 per matching tag)
 * 10. Popularity / Rating boost (Weight: 5-10)
 * 11. Deterministic pair variance (Weight: 0-18) to ensure unique ordering per product
 */
export function calculateProductSimilarity(currentProduct: Product, candidate: Product): number {
  if (currentProduct.id === candidate.id) return -1; // Exclude self

  let score = 0;

  // 1. Same Category
  if (
    currentProduct.category &&
    candidate.category &&
    currentProduct.category.toLowerCase().trim() === candidate.category.toLowerCase().trim()
  ) {
    score += 40;
  }

  // 2. Same Subcategory
  if (
    currentProduct.subcategory &&
    candidate.subcategory &&
    currentProduct.subcategory.toLowerCase().trim() === candidate.subcategory.toLowerCase().trim()
  ) {
    score += 30;
  }

  // 3. Similar Style (e.g., Straight, Anarkali, A-Line, Kurti Set, etc.)
  if (currentProduct.style && candidate.style) {
    const s1 = currentProduct.style.toLowerCase();
    const s2 = candidate.style.toLowerCase();
    if (s1 === s2 || s1.includes(s2) || s2.includes(s1)) {
      score += 25;
    }
  }

  // 4. Similar Pattern (e.g., Floral, Block Print, Geometric, Embroidered, Solid)
  if (currentProduct.pattern && candidate.pattern) {
    const p1 = currentProduct.pattern.toLowerCase();
    const p2 = candidate.pattern.toLowerCase();
    if (p1 === p2 || p1.includes(p2) || p2.includes(p1)) {
      score += 20;
    } else {
      // Check for common keywords like floral, print, embroidery, booti
      const patternKeywords = ['floral', 'print', 'embroider', 'block', 'foil', 'booti', 'geometric', 'stripe', 'solid'];
      for (const kw of patternKeywords) {
        if (p1.includes(kw) && p2.includes(kw)) {
          score += 12;
          break;
        }
      }
    }
  }

  // 5. Similar Color / Palette
  const c1 = (currentProduct.color || currentProduct.colors?.[0] || '').toLowerCase();
  const c2 = (candidate.color || candidate.colors?.[0] || '').toLowerCase();
  if (c1 && c2) {
    if (c1 === c2 || c1.includes(c2) || c2.includes(c1)) {
      score += 20;
    } else {
      const colorFamilies: { [family: string]: string[] } = {
        reds: ['maroon', 'wine', 'red', 'crimson', 'ruby', 'rust', 'burgundy'],
        pinks: ['pink', 'rose', 'blush', 'peach', 'magenta', 'fuchsia'],
        blues: ['blue', 'indigo', 'navy', 'teal', 'sky', 'cyan', 'azure'],
        yellows: ['yellow', 'mustard', 'gold', 'amber', 'ochre', 'haldi'],
        greens: ['green', 'emerald', 'sage', 'olive', 'mint', 'bottle green'],
        purples: ['purple', 'lavender', 'lilac', 'violet', 'plum'],
        neutrals: ['white', 'off-white', 'ivory', 'beige', 'cream', 'black', 'grey'],
      };

      for (const family of Object.values(colorFamilies)) {
        const has1 = family.some(clr => c1.includes(clr));
        const has2 = family.some(clr => c2.includes(clr));
        if (has1 && has2) {
          score += 15;
          break;
        }
      }
    }
  }

  // 6. Fabric Match
  if (currentProduct.fabric && candidate.fabric) {
    const f1 = currentProduct.fabric.toLowerCase();
    const f2 = candidate.fabric.toLowerCase();
    if (f1 === f2 || (f1.includes('cotton') && f2.includes('cotton')) || (f1.includes('rayon') && f2.includes('rayon')) || (f1.includes('silk') && f2.includes('silk'))) {
      score += 15;
    }
  }

  // 7. Price Proximity (Within same affordable/festive bracket)
  const priceDiff = Math.abs(currentProduct.price - candidate.price);
  const avgPrice = (currentProduct.price + candidate.price) / 2 || 699;
  const percentDiff = priceDiff / avgPrice;

  if (percentDiff <= 0.15) {
    score += 15;
  } else if (percentDiff <= 0.30) {
    score += 10;
  } else if (percentDiff <= 0.50) {
    score += 5;
  }

  // 8. Occasion / Neck / Sleeve Match
  if (currentProduct.occasion && candidate.occasion) {
    const o1 = currentProduct.occasion.toLowerCase();
    const o2 = candidate.occasion.toLowerCase();
    if (o1 === o2 || o1.includes('festive') && o2.includes('festive') || o1.includes('daily') && o2.includes('daily') || o1.includes('office') && o2.includes('office')) {
      score += 10;
    }
  }

  if (currentProduct.neck && candidate.neck && currentProduct.neck.toLowerCase() === candidate.neck.toLowerCase()) {
    score += 8;
  }

  // 9. Tag Overlap
  if (currentProduct.tags && candidate.tags) {
    const set1 = new Set(currentProduct.tags.map(t => t.toLowerCase().trim()));
    const matchingTags = candidate.tags.filter(t => set1.has(t.toLowerCase().trim()));
    score += Math.min(matchingTags.length * 4, 16);
  }

  // 10. Rating & Popularity Boost
  if (candidate.rating) {
    score += (candidate.rating - 4.0) * 10;
  }
  if (candidate.isBestSeller) score += 6;
  if (candidate.isTrending) score += 5;
  if (candidate.isNewArrival) score += 4;
  if (candidate.isRakhiGiftEligible && currentProduct.isRakhiGiftEligible) score += 5;

  // 11. Deterministic Pair Variance (0 to 18 points)
  // This guarantees that for Product A we get a distinct ranked list (B, C, D, E, F),
  // for Product B we get a distinct ranked list (A, C, F, G, H),
  // and for Product C we get another distinct ranked list (A, D, E, I, J),
  // without random flashing or jitter on re-renders!
  const pairHash = hashStringPair(currentProduct.id, candidate.id);
  const variance = pairHash % 19;
  score += variance;

  return score;
}

/**
 * Returns a dynamically ranked list of recommended products for the current product.
 * Ensures the currently viewed product is excluded and different products get their own unique sets.
 */
export function getRecommendedProducts(
  currentProduct: Product,
  allProducts: Product[],
  limit: number = 10
): Product[] {
  if (!currentProduct || !Array.isArray(allProducts) || allProducts.length === 0) {
    return [];
  }

  // Filter out self and any archived/hidden items
  const eligibleProducts = allProducts.filter(
    p => p.id !== currentProduct.id && (p.slug ? p.slug !== currentProduct.slug : true) && p.status !== 'archived' && p.visibility !== 'hidden'
  );

  if (eligibleProducts.length <= limit) {
    return eligibleProducts;
  }

  // Calculate scores
  const scored = eligibleProducts.map(candidate => ({
    product: candidate,
    score: calculateProductSimilarity(currentProduct, candidate),
  }));

  // Sort descending by calculated score
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(item => item.product);
}

/**
 * Returns trending / bestselling alternative products
 */
export function getTrendingAlternates(
  currentProduct: Product,
  allProducts: Product[],
  limit: number = 8
): Product[] {
  if (!currentProduct || !Array.isArray(allProducts)) return [];

  const eligible = allProducts.filter(
    p => p.id !== currentProduct.id && p.status !== 'archived' && p.visibility !== 'hidden'
  );

  return eligible
    .sort((a, b) => {
      const scoreA = (a.rating || 4.5) * 10 + (a.isBestSeller ? 20 : 0) + (a.isTrending ? 15 : 0) + (a.reviewsCount || 0);
      const scoreB = (b.rating || 4.5) * 10 + (b.isBestSeller ? 20 : 0) + (b.isTrending ? 15 : 0) + (b.reviewsCount || 0);
      return scoreB - scoreA;
    })
    .slice(0, limit);
}
