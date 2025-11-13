const defaultNames = ['Diego', 'Emiliano', 'Juan', 'Lautaro', 'Yassel', 'Lucas', 'Nathalia', 
  'Ernesto', 'Yordanis', 'Renzo', 'Valerie', 'Yandy', 'Yinett', 'Alejandro', 'Rodrigo'];
const maxNames = 60;

const state = {
  names: [],
  colors: [],
  startAngle: Math.random() * Math.PI * 2,
  arc: 0,
  spinning: false,
  spinStartTime: 0,
  spinTotalTime: 0,
  spinAngleStart: 0,
  chronometerStart: Date.now(),
  chronoActive: false,
  lastTickIndex: null,
  activeIndex: null,
  currentSpeaker: null,
  history: [],
};

const elements = {
  canvas: document.getElementById('wheel'),
  clock: document.getElementById('clock'),
  chrono: document.getElementById('chrono'),
  namesList: document.getElementById('names-list'),
  namesInput: document.getElementById('names'),
  addBtn: document.getElementById('add'),
  clearBtn: document.getElementById('clear'),
  spinBtn: document.getElementById('spin'),
  alert: document.getElementById('alert'),
  audioTick: document.getElementById('audio-tick'),
  audioSpin: document.getElementById('audio-spin'),
  audioWin: document.getElementById('audio-win'),
  audioLast: document.getElementById('audio-last'),
  summary: document.getElementById('summary'),
  summaryBody: document.getElementById('summary-body'),
  chronoCard: document.getElementById('chrono-card'),
  chronoCardValue: document.getElementById('chrono-card-value'),
};

const context = elements.canvas.getContext('2d');
const radius = elements.canvas.width / 2 - 20;
const textRadius = radius - 70;

const paletteOffset = Math.random() * 360;

function init() {
  createStars();
  defaultNames.forEach(name => addName(name, false));
  drawWheel();
  hideSummary();
  stopChronometer();
  updateClockDisplay();

  elements.addBtn.addEventListener('click', handleAddNames);
  elements.namesInput.addEventListener('keyup', event => {
    if (event.key === 'Enter') {
      handleAddNames();
    }
  });
  elements.clearBtn.addEventListener('click', clearNames);
  elements.spinBtn.addEventListener('click', spin);
  window.addEventListener('keydown', event => {
    if (event.code === 'Space') {
      event.preventDefault();
      spin();
    }
  });

  tickClock();
}

function handleAddNames() {
  const raw = elements.namesInput.value.trim();
  if (!raw) return;

  if (!elements.summary.hidden) {
    resetSession();
  }

  const candidates = raw
    .split(/[;,]/)
    .map(name => name.trim().toUpperCase())
    .filter(Boolean);

  let added = 0;
  for (const candidate of candidates) {
    if (state.names.includes(candidate)) continue;
    if (state.names.length >= maxNames) {
      setAlert('Ya agregaste demasiados nombres.');
      break;
    }
    addName(candidate);
    added += 1;
  }

  if (added) {
    setAlert('');
    drawWheel();
  }

  elements.namesInput.value = '';
  elements.namesInput.focus();
}

function addName(name, render = true) {
  state.names.push(name);
  state.colors.push(generateColor(state.names.length));
  renderNameTag(name);
  if (render) {
    drawWheel();
  }
}

function renderNameTag(name) {
  const div = document.createElement('div');
  div.className = 'names__item';
  div.innerHTML = `<span>${name}</span>`;
  div.title = 'Quitar';
  div.addEventListener('click', () => removeName(name));
  elements.namesList.appendChild(div);
}

function removeName(name) {
  const index = state.names.indexOf(name);
  if (index === -1) return;
  removeSpeakerAt(index);
  play(elements.audioTick);
  drawWheel();
}

function clearNames() {
  state.names = [];
  state.colors = [];
  elements.namesList.innerHTML = '';
  setActiveName(-1);
  resetSession();
  state.chronoActive = false;
  state.lastTickIndex = null;
  elements.chrono.textContent = '';
  elements.chrono.classList.remove('time--alert');
  setAlert('');
  drawWheel();
}

function setAlert(message) {
  if (!message) {
    elements.alert.hidden = true;
    elements.alert.textContent = '';
    return;
  }
  elements.alert.hidden = false;
  elements.alert.textContent = message;
}

function drawWheel() {
  const { names } = state;
  const arc = names.length ? (Math.PI * 2) / names.length : 0;
  state.arc = arc;

  context.clearRect(0, 0, elements.canvas.width, elements.canvas.height);
  context.save();
  context.translate(elements.canvas.width / 2, elements.canvas.height / 2);

  if (!names.length) {
    drawEmptyWheel();
    context.restore();
    return;
  }

  names.forEach((name, index) => {
    const angle = state.startAngle + index * arc;
    context.beginPath();
    context.fillStyle = state.colors[index];
    context.moveTo(0, 0);
    context.arc(0, 0, radius, angle, angle + arc, false);
    context.fill();

    context.save();
    context.fillStyle = '#0b0d11';
    context.rotate(angle + arc / 2);
    context.textAlign = 'right';
    context.font = 'bold 16px Ubuntu, sans-serif';
    context.fillText(name, textRadius, 10);
    context.restore();

    if (state.activeIndex === index) {
      context.save();
      context.lineWidth = 6;
      context.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      context.beginPath();
      context.arc(0, 0, radius - 6, angle, angle + arc);
      context.stroke();
      context.restore();
    }
  });

  drawPointer();
  context.restore();
}

function drawEmptyWheel() {
  context.beginPath();
  context.arc(0, 0, radius, 0, Math.PI * 2);
  context.fillStyle = 'rgba(255,255,255,0.05)';
  context.fill();
  drawPointer();
}

function drawPointer() {
  context.fillStyle = '#f4f4f7';
  context.beginPath();
  context.moveTo(-14, -radius - 22);
  context.lineTo(14, -radius - 22);
  context.lineTo(0, -radius + 18);
  context.closePath();
  context.fill();

  context.fillRect(-6, -radius - 36, 12, 14);
}

function spin() {
  if (state.spinning) return;

  finalizeCurrentSpeaker();
  removeActiveSpeaker();
  stopChronometer();

  if (state.names.length === 0) {
    if (state.history.length) {
      showSummary();
      setAlert('Todos los participantes ya hablaron.');
    } else {
      setAlert('No hay participantes en la ruleta.');
    }
    return;
  }

  hideSummary();
  setAlert('');
  state.spinning = true;
  state.spinAngleStart = Math.random() * 10 + 20;
  state.spinStartTime = performance.now();
  state.spinTotalTime = Math.random() * 2500 + 4500;
  state.lastTickIndex = null;

  // Detener y reiniciar el audio para que suene solo una vez
  elements.audioSpin.pause();
  elements.audioSpin.currentTime = 0;
  elements.audioSpin.loop = false;
  play(elements.audioSpin, 0.35, false);
  requestAnimationFrame(updateSpin);
}

function updateSpin(timestamp) {
  const elapsed = timestamp - state.spinStartTime;

  if (elapsed >= state.spinTotalTime) {
    finishSpin();
    return;
  }

  const spinAngle =
    state.spinAngleStart -
    easeOutCubic(elapsed, 0, state.spinAngleStart, state.spinTotalTime);

  state.startAngle += (spinAngle * Math.PI) / 180;
  drawWheel();
  handleTick();
  requestAnimationFrame(updateSpin);
}

function finishSpin() {
  state.spinning = false;
  elements.audioSpin.pause();
  elements.audioSpin.loop = false;
  elements.audioSpin.currentTime = 0;

  const index = getCurrentIndex();
  const winner = state.names[index];
  if (!winner) return;

  drawWheel();
  setActiveName(index);
  state.currentSpeaker = winner;
  startChronometer();
  highlightWinner(winner);

  if (state.names.length === 1) {
    play(elements.audioLast, 0.3);
  } else {
    play(elements.audioWin, 0.2);
  }
}

function highlightWinner(winner) {
  context.save();
  context.fillStyle = '#ffffff';
  context.font = 'bold 28px Ubuntu, sans-serif';
  context.textAlign = 'center';
  context.shadowColor = 'rgba(0,0,0,0.6)';
  context.shadowBlur = 8;
  context.fillText(winner, elements.canvas.width / 2, elements.canvas.height / 2 + 10);
  context.restore();
}

function handleTick() {
  if (!state.names.length) return;
  const index = getCurrentIndex();
  if (Number.isNaN(index)) return;
  if (state.lastTickIndex !== index) {
    state.lastTickIndex = index;
    play(elements.audioTick, 0.25, true);
  }
}

function finalizeCurrentSpeaker() {
  if (!state.currentSpeaker || !state.chronoActive) {
    return;
  }
  const duration = Date.now() - state.chronometerStart;
  state.history.push({ name: state.currentSpeaker, duration });
  stopChronometer();
  state.currentSpeaker = null;
}

function removeSpeakerAt(index) {
  if (index == null || index < 0 || index >= state.names.length) {
    return null;
  }
  const [removedName] = state.names.splice(index, 1);
  state.colors.splice(index, 1);
  const item = elements.namesList.children[index];
  if (item) {
    item.remove();
  }

  if (state.activeIndex !== null) {
    if (state.activeIndex === index) {
      setActiveName(-1);
      stopChronometer();
    } else if (index < state.activeIndex) {
      const newIndex = Math.max(0, state.activeIndex - 1);
      setActiveName(state.names.length ? newIndex : -1);
    } else if (state.activeIndex >= state.names.length) {
      if (state.names.length) {
        setActiveName(state.names.length - 1);
      } else {
        setActiveName(-1);
        stopChronometer();
      }
    } else {
      setActiveName(state.activeIndex);
    }
  }

  return removedName ?? null;
}

function removeActiveSpeaker() {
  if (state.activeIndex === null) {
    return;
  }
  removeSpeakerAt(state.activeIndex);
  drawWheel();
  state.currentSpeaker = null;
}

function showSummary() {
  if (!state.history.length) {
    hideSummary();
    return;
  }
  updateSummaryTable();
  elements.summary.hidden = false;
}

function hideSummary() {
  if (!elements.summary) return;
  elements.summary.hidden = true;
  if (elements.summaryBody) {
    elements.summaryBody.innerHTML = '';
  }
}

function updateSummaryTable() {
  if (!elements.summaryBody) return;
  elements.summaryBody.innerHTML = '';

  state.history.forEach((entry, idx) => {
    const row = document.createElement('tr');

    const orderCell = document.createElement('td');
    orderCell.textContent = idx + 1;

    const nameCell = document.createElement('td');
    nameCell.textContent = entry.name;

    const timeCell = document.createElement('td');
    timeCell.textContent = formatDuration(entry.duration);

    row.append(orderCell, nameCell, timeCell);
    elements.summaryBody.appendChild(row);
  });
}

function resetSession() {
  state.history = [];
  state.currentSpeaker = null;
  state.activeIndex = null;
  state.lastTickIndex = null;
  stopChronometer();
  hideSummary();
}

function formatDuration(durationMs) {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function startChronometer() {
  if (!elements.chrono) return;
  state.chronoActive = true;
  state.chronometerStart = Date.now();
  elements.chrono.textContent = '+ 00:00';
  elements.chrono.classList.add('is-active');
  elements.chrono.classList.remove('time--alert');
  if (elements.chronoCard && elements.chronoCardValue) {
    elements.chronoCard.hidden = false;
    elements.chronoCardValue.textContent = '00:00';
    elements.chronoCardValue.classList.remove('is-alert');
  }
}

function stopChronometer() {
  if (!elements.chrono) return;
  state.chronoActive = false;
  elements.chrono.textContent = '';
  elements.chrono.classList.remove('time--alert', 'is-active');
  if (elements.chronoCard && elements.chronoCardValue) {
    elements.chronoCard.hidden = true;
    elements.chronoCardValue.textContent = '00:00';
    elements.chronoCardValue.classList.remove('is-alert');
  }
}

function updateClockDisplay(date = new Date()) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const target = document.getElementById('clock-display');
  if (target) {
    target.textContent = `${hours}:${minutes}:${seconds}`;
  }
}

function getCurrentIndex() {
  if (!state.names.length || !state.arc) return 0;
  const degrees = (state.startAngle * 180) / Math.PI + 90;
  const arcd = (state.arc * 180) / Math.PI;
  return Math.floor((360 - (degrees % 360)) / arcd) % state.names.length;
}

function easeOutCubic(t, b, c, d) {
  return c * ((t = t / d - 1) * t * t + 1) + b;
}

function tickClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  elements.clock.textContent = `${hours}:${minutes}`;
  updateClockDisplay(now);

  if (state.chronoActive) {
    const diff = Date.now() - state.chronometerStart;
    const totalSeconds = Math.floor(diff / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = String(totalSeconds % 60).padStart(2, '0');
    elements.chrono.textContent = `+ ${String(mins).padStart(2, '0')}:${secs}`;
    if (elements.chronoCardValue) {
      elements.chronoCardValue.textContent = `${String(mins).padStart(2, '0')}:${secs}`;
    }

    if (totalSeconds >= 90) {
      elements.chrono.classList.add('time--alert');
      if (elements.chronoCardValue) {
        elements.chronoCardValue.classList.add('is-alert');
      }
    } else {
      elements.chrono.classList.remove('time--alert');
      if (elements.chronoCardValue) {
        elements.chronoCardValue.classList.remove('is-alert');
      }
    }
  }

  requestAnimationFrame(tickClock);
}

function play(audio, volume = 1, resetIfPlaying = false) {
  if (!audio) return;
  if (resetIfPlaying && !audio.paused) {
    audio.currentTime = 0;
  }
  audio.volume = volume;
  audio.play().catch(() => {});
}

function generateColor(index) {
  const hue = (paletteOffset + index * 37) % 360;
  const saturation = 68;
  const lightness = 55;
  return `hsl(${hue}deg ${saturation}% ${lightness}%)`;
}

function createStars() {
  const starsContainer = document.getElementById('stars');
  const total = 180;
  for (let i = 0; i < total; i += 1) {
    const star = document.createElement('span');
    star.className = 'star';
    const size = Math.random() * 2 + 1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.opacity = (Math.random() * 0.4 + 0.4).toFixed(2);
    starsContainer.appendChild(star);
  }
}

function setActiveName(index) {
  const items = Array.from(elements.namesList.children);
  items.forEach((item, idx) => {
    item.classList.toggle('names__item--active', idx === index);
  });
  const inRange = typeof index === 'number' && index >= 0 && index < state.names.length;
  state.activeIndex = inRange ? index : null;
  state.currentSpeaker = inRange ? state.names[index] : null;
}

init();

