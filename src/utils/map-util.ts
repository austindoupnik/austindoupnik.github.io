export function get<K, V>(values: Map<K, V>, key: K, error: (key: K) => unknown): V {
  const value = values.get(key);
  if (value === undefined) {
    throw error(key);
  }
  return value;
}