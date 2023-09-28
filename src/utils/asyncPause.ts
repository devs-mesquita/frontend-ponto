export const asyncPause = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  })
}