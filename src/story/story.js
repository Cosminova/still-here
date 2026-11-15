/**
 * Still Here: a narrated journey to the machines NASA left behind.
 *
 * Drives the engine through the same surface the capture scripts use
 * (window.cosminova): set the clock, fly to a craft, and turn slowly round it
 * while the machine tells its story. Nothing in the engine knows the story
 * exists, so "Explore freely" simply hands the full explorer back.
 *
 * It opens on a reconstruction of Surveyor 3 landing (intro.js), and every
 * page can direct the camera, the music and the clock (scenes.js).
 */
import { CHAPTERS, REGIONS } from './chapters/index.js';
import { findLitDate } from './lighting.js';
import { buildInteractive } from './interactive.js';
import { playIntro } from './intro.js';
import { createLogbook } from './logbook.js';
import { createPartExplorer } from './part-explorer.js';
import { loadBadges, loadVisited, withBadge, withVisited } from './progress.js';
import { createReadAloud } from './read-aloud.js';
import { createDirector } from './scenes.js';
import { AU_KM, LIGHT_KMS, formatKm, formatLightTime } from './space-facts.js';
import { createStoryUi } from './story-ui.js';

const FLIGHT_MS = Object.freeze({ first: 2500, sameRegion: 3600, newRegion: 7000 });
const DRIFT_RATE = 0.02;
const LIVE_REFRESH_MS = 1000;
const OPENING_CHAPTER = 'surveyor3';

const craftKeyOf = (target) => (target.startsWith('craft:') ? target.slice(6) : null);
const nameOf = (chapter) => (chapter.status ? chapter.speaker : chapter.title);

export function startStory(api) {
  if (!api?.controls || !api.universe || !api.craftField) {
    console.error('[story] the engine surface is not ready; staying in the explorer');
    return null;
  }

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const voice = createReadAloud();
  const director = createDirector(api, { reducedMotion });
  const parts = createPartExplorer(api, {
    reducedMotion,
    speak: (words) => voice.speak(words, 'narrator'),
    onFocus: () => takeOver(),
  });
  let visited = loadVisited();
  let badges = loadBadges();
  let index = 0;
  let step = 0;
  let exploring = false;
  let arrived = false;
  let arrivalTimer = 0;
  let flightToken = 0;
  let driftFrame = 0;
  let tookOver = false;
  let intro = null;
  // The date the current page is shown at, and the one a look ahead has moved
  // the clock to, if any.
  let chapterDate = new Date();
  let pageDate = chapterDate;
  let futureDate = null;

  const sound = {
    get on() {
      return Boolean(api.ambient) && !api.ambient.muted;
    },
    toggle() {
      const ambient = api.ambient;
      if (!ambient) return false;
      ambient.setMuted(!ambient.muted);
      if (!ambient.muted) ambient.start?.();
      ui.setSound(!ambient.muted);
      return !ambient.muted;
    },
  };

  const interactiveContext = {
    api,
    chapters: CHAPTERS,
    visited: () => visited,
    earn: () => {
      badges = withBadge(badges, CHAPTERS[index].id);
      ui.setBadges(badges.size);
    },
    speak: (words) => voice.speak(words, 'narrator'),
    today: () => pageDate,
    onHorizon: (date) => {
      if (!date) return;
      futureDate = date;
      api.setDate(date);
      refreshLive();
    },
    onToday: () => backToToday(),
    onReplayIntro: () => startIntro(),
    onLogbook: () => logbook.open(visited, index, badges),
    onExplore: () => explore(),
  };

  const ui = createStoryUi({
    regions: REGIONS,
    onNext: next,
    onBack: back,
    onVoice: toggleVoice,
    onSound: () => sound.toggle(),
    onReplayIntro: () => startIntro(),
    onLogbook: () => logbook.open(visited, index, badges),
    onExplore: explore,
    onReturn: resume,
    buildExtra: (page) => buildInteractive(page, interactiveContext),
  });
  const logbook = createLogbook({
    chapters: CHAPTERS,
    onJump: (target) => goTo(target),
    onRestart: () => startIntro({ index: 0, step: 0 }),
  });
  ui.setVoice(false, voice.supported);
  ui.setSound(sound.on);
  ui.setBadges(badges.size);

  function backToToday() {
    if (!futureDate) return;
    futureDate = null;
    api.setDate(pageDate);
    refreshLive();
  }

  // ---------------------------------------------------------------- camera

  function litDate(chapter, around) {
    return chapter.site ? findLitDate(api.universe, chapter.site, around) : around;
  }

  function chooseDate(chapter) {
    if (chapter.date) return new Date(chapter.date);
    return litDate(chapter, new Date());
  }

  function flightTime(chapter, previous) {
    if (!previous) return FLIGHT_MS.first;
    return previous.region === chapter.region ? FLIGHT_MS.sameRegion : FLIGHT_MS.newRegion;
  }

  function stopDrift() {
    if (driftFrame) cancelAnimationFrame(driftFrame);
    driftFrame = 0;
  }

  /** Turns slowly round whatever has been arrived at, until someone grabs the view. */
  function startDrift() {
    stopDrift();
    if (reducedMotion) return;
    let previous = performance.now();
    const turn = (now) => {
      const dt = Math.min((now - previous) / 1000, 0.1);
      previous = now;
      if (!tookOver && !exploring) api.controls.yaw += DRIFT_RATE * dt;
      driftFrame = requestAnimationFrame(turn);
    };
    driftFrame = requestAnimationFrame(turn);
  }

  function arrive() {
    arrived = true;
    ui.setFlying(null);
    director.arrived();
    startDrift();
    playScene();
  }

  /**
   * Goes to a chapter's machine. Leaving one stop for another first draws the
   * camera back, with the reason for the next stop on the card, so a flight
   * reads as a change of place rather than a cut.
   */
  function fly(chapter, previous, { inPlace = false } = {}) {
    clearTimeout(arrivalTimer);
    stopDrift();
    director.cancel();
    director.unstage();
    parts.release({ restore: false });
    tookOver = false;
    arrived = false;
    futureDate = null;
    chapterDate = chooseDate(chapter);
    pageDate = chapterDate;
    const token = ++flightToken;
    const go = () => {
      if (token !== flightToken) return;
      try {
        api.setDate(chapterDate);
        api.setRate(1);
        if (inPlace) {
          arrive();
          return;
        }
        const duration = flightTime(chapter, previous);
        ui.setFlying(nameOf(chapter), chapter.bridge);
        api.travel(chapter.target, { duration });
        arrivalTimer = setTimeout(arrive, duration + 300);
      } catch (error) {
        ui.setFlying(null);
        console.error(`[story] could not fly to ${chapter.target}`, error);
      }
    };
    if (previous && previous !== chapter && !inPlace) {
      ui.setFlying(nameOf(chapter), chapter.bridge);
      director.pullBack().then(go);
    } else {
      go();
    }
  }

  /** What the page asks of the camera, the music and the clock, once arrived. */
  function playScene() {
    if (!arrived || exploring || intro) return;
    const chapter = CHAPTERS[index];
    const page = chapter.pages[step];
    const scene = page.scene ?? {};
    if (page.kind !== 'future') {
      const wanted = scene.date === 'now' ? litDate(chapter, new Date()) : scene.date ? new Date(scene.date) : chapterDate;
      if (wanted.getTime() !== pageDate.getTime() || futureDate) {
        futureDate = null;
        pageDate = wanted;
        api.setDate(wanted);
      }
    }
    // A page that moves the camera frames the whole machine again.
    if (scene.shot) parts.release({ restore: false });
    director.play({ mood: 'curious', ...scene }, craftKeyOf(chapter.target));
    refreshLive();
  }

  // ------------------------------------------------------------ live facts

  function liveLine(chapter) {
    if (chapter.live !== 'sunDistance') return null;
    const item = api.craftField.get(craftKeyOf(chapter.target));
    const sun = api.universe.get('sun');
    const earth = api.universe.get('earth');
    if (!item?.present || !sun || !earth) return null;
    const fromSun = item.position.distanceTo(sun.position);
    const fromEarth = item.position.distanceTo(earth.position);
    const au = (fromSun / AU_KM).toFixed(fromSun > 10 * AU_KM ? 0 : 1);
    const when = futureDate ? `In ${futureDate.getUTCFullYear()}` : 'Right now';
    return `${when}: ${formatKm(fromSun)} from the Sun (${au} times Earth's distance). A radio message from here would take ${formatLightTime(fromEarth / LIGHT_KMS)} to reach Earth.`;
  }

  function refreshLive() {
    ui.setClock(api.state.date);
    ui.setLive(exploring ? null : liveLine(CHAPTERS[index]));
  }
  const liveTimer = setInterval(refreshLive, LIVE_REFRESH_MS);

  // --------------------------------------------------------------- story

  function nextLabel(chapter) {
    if (step < chapter.pages.length - 1) return 'Next';
    const following = CHAPTERS[index + 1];
    return following ? `Fly to ${nameOf(following)}` : 'Explore freely';
  }

  function render() {
    const chapter = CHAPTERS[index];
    const page = chapter.pages[step];
    if (page.kind !== 'future') backToToday();
    ui.render({
      chapter,
      index,
      total: CHAPTERS.length,
      step,
      steps: chapter.pages.length,
      page,
      nextLabel: nextLabel(chapter),
      canGoBack: index > 0 || step > 0,
    });
    voice.speak(page.text, page.by);
    playScene();
    refreshLive();
  }

  function stopIntro() {
    if (!intro) return;
    const playing = intro;
    intro = null;
    parts.setEnabled(true);
    ui.setHidden(false);
    playing.skip?.();
  }

  function goTo(target, { atEnd = false, atStep = null, inPlace = false } = {}) {
    stopIntro();
    const previous = CHAPTERS[index];
    index = Math.max(0, Math.min(CHAPTERS.length - 1, target));
    const chapter = CHAPTERS[index];
    const last = chapter.pages.length - 1;
    step = atStep !== null ? Math.max(0, Math.min(last, atStep)) : atEnd ? last : 0;
    visited = withVisited(visited, chapter.id);
    fly(chapter, previous === chapter ? null : previous, { inPlace });
    render();
  }

  function next() {
    if (ui.finishTyping()) return;
    if (step < CHAPTERS[index].pages.length - 1) {
      step += 1;
      render();
    } else if (index < CHAPTERS.length - 1) {
      goTo(index + 1);
    } else {
      explore();
    }
  }

  function back() {
    if (step > 0) {
      step -= 1;
      render();
    } else if (index > 0) {
      goTo(index - 1, { atEnd: true });
    }
  }

  function toggleVoice() {
    const on = voice.setEnabled(!voice.enabled);
    ui.setVoice(on, voice.supported);
    if (on) render();
  }

  /**
   * Plays the opening landing, then comes back to `resumeAt` (by default the
   * page it was started from). The opening ends at Surveyor 3, so returning to
   * its chapter needs no flight.
   */
  function startIntro(resumeAt = { index, step }) {
    if (intro) return;
    voice.stop();
    logbook.close();
    clearTimeout(arrivalTimer);
    stopDrift();
    director.dispose();
    parts.setEnabled(false);
    arrived = false;
    flightToken += 1;
    ui.setHidden(true);
    ui.setFlying(null);
    const token = {};
    intro = token;
    const handle = playIntro(api, {
      reducedMotion,
      sound,
      onDone: () => {
        if (intro !== token) return;
        intro = null;
        parts.setEnabled(true);
        ui.setHidden(false);
        const inPlace = CHAPTERS[resumeAt.index]?.id === OPENING_CHAPTER;
        index = resumeAt.index;
        goTo(resumeAt.index, { atStep: resumeAt.step, inPlace });
        ui.focusNext();
      },
    });
    token.skip = handle.skip;
  }

  function explore() {
    stopIntro();
    exploring = true;
    voice.stop();
    director.dispose();
    ui.setExploring(true);
    ui.setLive(null);
    api.setUiVisible(true);
    api.setSkyPicking?.(true);
  }

  function resume() {
    exploring = false;
    api.setSkyPicking?.(false);
    api.setUiVisible(false);
    ui.setExploring(false);
    fly(CHAPTERS[index], CHAPTERS[index]);
    render();
  }

  // --------------------------------------------------------------- input

  // Captured before the explorer's own shortcuts, which bind the arrows to the
  // simulation clock; while the story is up they turn its pages instead.
  function onKey(event) {
    if (intro || exploring || event.metaKey || event.ctrlKey || event.altKey) return;
    const tag = event.target?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    let handled = true;
    if (logbook.isOpen) {
      if (event.key === 'Escape') logbook.close();
      else handled = false;
    } else if (event.key === 'ArrowRight' || event.key === 'PageDown') next();
    else if (event.key === 'ArrowLeft' || event.key === 'PageUp') back();
    else handled = false;
    if (handled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
  window.addEventListener('keydown', onKey, true);
  function takeOver() {
    tookOver = true;
    director.cancel();
  }
  api.renderer.domElement.addEventListener('pointerdown', takeOver);
  api.renderer.domElement.addEventListener('wheel', takeOver, { passive: true });

  api.setUiVisible(false);
  // Until the reader chooses to explore, a click picks parts of the machine
  // and never flies off to a star behind it.
  api.setSkyPicking?.(false);
  const skipOpening = new URLSearchParams(window.location.search).get('intro') === '0';
  const opening = Math.max(0, CHAPTERS.findIndex((chapter) => chapter.id === OPENING_CHAPTER));
  if (skipOpening) goTo(opening);
  else startIntro({ index: opening, step: 0 });

  const controller = {
    goTo,
    next,
    back,
    explore,
    resume,
    replayIntro: () => startIntro(),
    get index() {
      return index;
    },
    get step() {
      return step;
    },
    get introPlaying() {
      return Boolean(intro);
    },
    chapters: CHAPTERS,
    dispose() {
      clearInterval(liveTimer);
      clearTimeout(arrivalTimer);
      stopIntro();
      stopDrift();
      director.dispose();
      parts.dispose();
      api.setSkyPicking?.(true);
      voice.stop();
      window.removeEventListener('keydown', onKey, true);
    },
  };
  window.stillHere = controller;
  return controller;
}
