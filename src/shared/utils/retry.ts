export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: { retries?: number; delay?: number },
): Promise<T> {
  const retries = options?.retries ?? 3;
  const delay = options?.delay ?? 1000;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, delay * attempt));
    }
  }

  throw new Error("Unreachable");
}
