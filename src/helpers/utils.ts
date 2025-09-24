export function toInteger(value: string | number): number {
  if (typeof value === 'number') {
    if (!Number.isInteger(value)) {
      throw new Error(`Invalid number: ${value}`);
    }
    return value;
  }
  if (typeof value === 'string' && /^\d+$/.test(value)) {
    return parseInt(value, 10);
  }
  throw new Error(`Invalid number: ${value}`);
}
