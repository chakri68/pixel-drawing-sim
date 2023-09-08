export function asyncSleep<T>(delay: number): Promise<T> {
  return new Promise((resolve) => setTimeout(resolve, delay));
}
