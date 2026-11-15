/**
 * Reading the story aloud with the browser's own speech synthesis.
 *
 * Off until asked for: a voice starting unprompted is startling, and in a
 * classroom of thirty screens it is worse. The narrator is pitched lower than
 * the machines so the two voices can be told apart without looking.
 */
const PITCH = Object.freeze({ narrator: 0.85, machine: 1.15 });
const RATE = 0.95;

export function createReadAloud() {
  const synth = window.speechSynthesis;
  const supported = Boolean(synth && window.SpeechSynthesisUtterance);
  let enabled = false;

  function stop() {
    if (supported) synth.cancel();
  }

  function speak(text, by = 'machine') {
    if (!supported || !enabled || !text) return;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = RATE;
    utterance.pitch = PITCH[by] ?? 1;
    utterance.onerror = (event) => {
      if (event.error !== 'canceled' && event.error !== 'interrupted') {
        console.warn('[story] speech failed', event.error);
      }
    };
    synth.speak(utterance);
  }

  return {
    supported,
    get enabled() {
      return enabled;
    },
    setEnabled(on) {
      enabled = supported && Boolean(on);
      if (!enabled) stop();
      return enabled;
    },
    speak,
    stop,
  };
}
