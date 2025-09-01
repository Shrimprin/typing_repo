export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedRemainingSeconds = remainingSeconds.toString().padStart(2, '0');
  return `${formattedMinutes}:${formattedRemainingSeconds}`;
};
