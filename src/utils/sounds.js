// Sound effects using Web Audio API
const AudioContext = window.AudioContext || window.webkitAudioContext;

// Play a simple tone
const playTone = (frequency, duration, startTime = 0) => {
  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + startTime + duration);

  oscillator.start(audioContext.currentTime + startTime);
  oscillator.stop(audioContext.currentTime + startTime + duration);
};

// Ta-dum sound for successful match (two ascending notes)
export const playMatchSound = () => {
  try {
    playTone(523.25, 0.15, 0);    // C5 - "ta"
    playTone(659.25, 0.3, 0.15);  // E5 - "dum"
  } catch (error) {
    console.log('Audio playback failed:', error);
  }
};

// Victory sound for game completion (triumphant chord)
export const playVictorySound = () => {
  try {
    // Play a chord progression
    playTone(523.25, 0.2, 0);     // C5
    playTone(659.25, 0.2, 0);     // E5
    playTone(783.99, 0.2, 0);     // G5

    playTone(659.25, 0.4, 0.2);   // E5
    playTone(783.99, 0.4, 0.2);   // G5
    playTone(1046.50, 0.4, 0.2);  // C6 - higher octave for triumph
  } catch (error) {
    console.log('Audio playback failed:', error);
  }
};
