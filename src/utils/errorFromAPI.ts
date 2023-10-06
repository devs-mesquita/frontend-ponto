export default function errorFromApi<T>(
  error: any, // eslint-disable-line
  key: string,
): error is T {
  return key in error;
}
