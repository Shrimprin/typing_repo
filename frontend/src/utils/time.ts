export const formatTime = (seconds: number): string => {
  const flooredSeconds = Math.floor(seconds);
  const minutes = Math.floor(flooredSeconds / 60);
  const remainingSeconds = flooredSeconds % 60;
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedRemainingSeconds = remainingSeconds.toString().padStart(2, '0');
  return `${formattedMinutes}:${formattedRemainingSeconds}`;
};
