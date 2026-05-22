export const DEFAULT_TRANSITION_DURATION_MS = 400;

export function getTransitionDurationMs(element, fallback = DEFAULT_TRANSITION_DURATION_MS) {
  const style = getComputedStyle(element);
  const durationStr = style.transitionDuration;
  const durations = durationStr.split(',').map(
    s => parseFloat(s)).filter(v => !isNaN(v)
  );
  if (durations.length === 0) return fallback;
  const maxSeconds = Math.max(...durations);
  return maxSeconds * 1000;
}