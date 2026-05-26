export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || a.length !== b.length) {
    return 0;
  }

  let dotProduct = 0;
  let magnitudeSquaredA = 0;
  let magnitudeSquaredB = 0;

  for (let index = 0; index < a.length; index += 1) {
    const valueA = a[index];
    const valueB = b[index];

    if (
      valueA === undefined ||
      valueB === undefined ||
      !Number.isFinite(valueA) ||
      !Number.isFinite(valueB)
    ) {
      return 0;
    }

    dotProduct += valueA * valueB;
    magnitudeSquaredA += valueA * valueA;
    magnitudeSquaredB += valueB * valueB;
  }

  if (magnitudeSquaredA === 0 || magnitudeSquaredB === 0) {
    return 0;
  }

  const similarity = dotProduct / Math.sqrt(magnitudeSquaredA * magnitudeSquaredB);

  return Math.max(-1, Math.min(1, similarity));
}
