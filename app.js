const ASSET_BASE_PATH = './';
const MATCH_DATA_PATH = `${ASSET_BASE_PATH}matches.json`;
const ROSTER_DATA_PATH = `${ASSET_BASE_PATH}rosters.json`;
const AUDIO_TRACKS = [
  `${ASSET_BASE_PATH}audio/Shakira_-_Waka_Waka_original_(mp3.pm).mp3`,
  `${ASSET_BASE_PATH}audio/Timbaland_ft._Keri_Hilson_and_D.o.e_-_The_Way_I_Are_(mp3.pm).mp3`,
  `${ASSET_BASE_PATH}audio/K_naan_-_Wavin_Flag_original_(mp3.pm).mp3`
];
const DEFAULT_MATCH_TIME = '18:00';
const TIME_ZONE_LABELS = {
  IST: 'Asia/Kolkata',
  'USA Eastern': 'America/New_York',
  'USA Central': 'America/Chicago',
  'USA Mountain': 'America/Denver',
  'USA Pacific': 'America/Los_Angeles',
  Australia: 'Australia/Sydney',
  Japan: 'Asia/Tokyo'
};

const DOM = {
  pages: null,
  matchGrid: null,
  loadingState: null,
  audioPlayPause: null,
  audioStatus: null,
  rosterTitle: null,
  rosterContent: null,
  detailBody: null,
  initialized: false
};

let matchData = [];
let rosterData = {};
let hasUserInteracted = false;

function initDOMCache() {
  if (DOM.initialized) return;
  DOM.pages = document.querySelectorAll('.page');
  DOM.matchGrid = document.getElementById('matchGrid');
  DOM.loadingState = document.getElementById('loadingState');
  DOM.audioPlayPause = document.getElementById('audioPlayPause');
  DOM.audioStatus = document.getElementById('audioStatus');
  DOM.rosterTitle = document.getElementById('rosterTitle');
  DOM.rosterContent = document.getElementById('rosterContent');
  DOM.detailBody = document.getElementById('detailBody');
  DOM.initialized = true;
}

function showLoading(message) {
  initDOMCache();
  if (DOM.loadingState) {
    DOM.loadingState.hidden = false;
    DOM.loadingState.textContent = message;
  }
}

function hideLoading() {
  initDOMCache();
  if (DOM.loadingState) {
    DOM.loadingState.hidden = true;
    DOM.loadingState.textContent = '';
  }
}

const StateManager = {
  historyStack: [],
  currentPage: 'IntroPage',
  goBack() {
    const previousPage = this.historyStack.pop();
    if (previousPage) {
      navigate(previousPage);
    }
  }
};

function navigate(pageId) {
  initDOMCache();
  const currentPage = StateManager.currentPage;
  if (currentPage && currentPage !== pageId) {
    StateManager.historyStack.push(currentPage);
  }

  const pages = DOM.pages || document.querySelectorAll('.page');
  pages.forEach((page) => {
    const isActive = page.id === pageId;
    page.classList.toggle('active', isActive);
    page.setAttribute('aria-hidden', (!isActive).toString());
  });

  StateManager.currentPage = pageId;
}

class AudioController {
  constructor(trackUrls = []) {
    this.trackUrls = Array.isArray(trackUrls) ? trackUrls.slice() : [];
    this.audio = null;
    this.currentIndex = 0;
    this.isPlaying = false;
  }

  init() {
    if (this.audio) return;
    this.audio = document.createElement('audio');
    this.audio.preload = 'metadata';
    this.audio.loop = false;
    this.audio.controls = false;
    this.audio.style.display = 'none';
    document.body.appendChild(this.audio);

    this.audio.addEventListener('ended', () => {
      this.currentIndex = (this.currentIndex + 1) % this.trackUrls.length;
      this.audio.src = this.trackUrls[this.currentIndex];
      this.audio.play().catch(() => {});
      this.updateStatus();
    });

    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.updateStatus();
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.updateStatus();
    });

    this.audio.addEventListener('error', () => {
      console.warn('Audio error', this.audio.error);
      this.updateStatus();
    });

    if (this.trackUrls.length) {
      this.audio.src = this.trackUrls[this.currentIndex];
    }
  }

  async preloadTracks() {
    this.init();
    const probes = this.trackUrls.map((src) => new Promise((resolve) => {
      const probe = document.createElement('audio');
      probe.preload = 'metadata';
      probe.src = src;
      probe.addEventListener('canplaythrough', () => resolve(true), { once: true });
      probe.addEventListener('error', () => resolve(false), { once: true });
      setTimeout(() => resolve(false), 4000);
    }));
    return Promise.all(probes);
  }

  async play() {
    if (!this.audio) this.init();
    if (!this.trackUrls.length) return;
    this.audio.src = this.trackUrls[this.currentIndex];
    try {
      await this.audio.play();
    } catch (error) {
      console.warn('Audio playback prevented', error);
    }
    this.updateStatus();
  }

  pause() {
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
    }
    this.updateStatus();
  }

  async toggle() {
    if (!this.audio) this.init();
    if (this.audio.paused) {
      await this.play();
    } else {
      this.pause();
    }
  }

  updateStatus() {
    initDOMCache();
    if (DOM.audioStatus) {
      DOM.audioStatus.textContent = this.audio && !this.audio.paused ? 'Audio: playing' : 'Audio: paused';
    }
    if (DOM.audioPlayPause) {
      DOM.audioPlayPause.textContent = this.audio && !this.audio.paused ? 'Pause' : 'Play';
    }
  }
}

const audioController = new AudioController(AUDIO_TRACKS);

function loadJsonLocal(path) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', path, true);
    xhr.responseType = 'json';
    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 0) {
        const response = xhr.response || JSON.parse(xhr.responseText || '{}');
        resolve(response);
      } else {
        reject(new Error(`Unable to load ${path} (${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error(`Unable to load ${path}`));
    xhr.send();
  });
}

function normalizeTeamKey(teamCode) {
  if (!teamCode) return '';
  const normalized = teamCode.trim().toUpperCase();
  const aliasMap = {
    'KOREA REPUBLIC': 'REPUBLIC OF KOREA',
    'SOUTH KOREA': 'REPUBLIC OF KOREA',
    'SOUTH AFRICA': 'SOUTH AFRICA',
    'USA': 'USA'
  };
  return aliasMap[normalized] || normalized;
}

function parseDateString(dateString) {
  const monthMap = {
    JANUARY: 0, FEBRUARY: 1, MARCH: 2, APRIL: 3, MAY: 4, JUNE: 5,
    JULY: 6, AUGUST: 7, SEPTEMBER: 8, OCTOBER: 9, NOVEMBER: 10, DECEMBER: 11
  };
  const parts = dateString.trim().split(' ');
  if (parts.length < 3) {
    return { year: 1970, month: 0, day: 1 };
  }
  const [dayText, monthText, yearText] = parts;
  const day = parseInt(dayText, 10) || 1;
  const month = monthMap[monthText.toUpperCase()] ?? 0;
  const year = parseInt(yearText, 10) || 1970;
  return { year, month, day };
}

function convertTime(baseTime, dateString) {
  if (!baseTime) baseTime = DEFAULT_MATCH_TIME;
  const [hours, minutes] = baseTime.split(':').map((value) => parseInt(value, 10));
  const { year, month, day } = parseDateString(dateString || '1 January 1970');
  const utcStamp = Date.UTC(year, month, day, hours || 18, minutes || 0);
  const date = new Date(utcStamp);
  return Object.entries(TIME_ZONE_LABELS).reduce((converted, [label, zone]) => {
    converted[label] = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: zone
    }).format(date);
    return converted;
  }, {});
}

function buildTimeGrid(timeMap) {
  return Object.entries(timeMap).map(([zone, time]) => `
    <div class="time-entry">
      <span class="zone-label">${zone}</span>
      <span class="zone-value">${time}</span>
    </div>
  `).join('');
}

function getMatchBaseTime(match) {
  if (match && match.time) {
    return match.time;
  }
  const fallbackTimes = ['12:00', '15:00', '18:00', '21:00'];
  return fallbackTimes[(match.matchNumber || 0) % fallbackTimes.length] || DEFAULT_MATCH_TIME;
}

function createMatchCard(match) {
  const card = document.createElement('article');
  card.className = 'match-card';
  card.innerHTML = `
    <div class="match-title">${match.homeTeam} VS ${match.awayTeam}</div>
    <div class="match-meta">
      <span>${match.date}</span>
      <span>Match #${match.matchNumber}</span>
    </div>
  `;
  card.addEventListener('click', () => openMatchDetails(match));
  return card;
}

function renderMatches(matches) {
  initDOMCache();
  const container = DOM.matchGrid;
  if (!container) return;
  container.innerHTML = '';

  if (!matches || matches.length === 0) {
    container.innerHTML = '<div class="empty">No matches available.</div>';
    return;
  }

  const batchSize = 20;
  let index = 0;
  const renderChunk = () => {
    const fragment = document.createDocumentFragment();
    for (let count = 0; count < batchSize && index < matches.length; count += 1, index += 1) {
      fragment.appendChild(createMatchCard(matches[index]));
    }
    container.appendChild(fragment);
    if (index < matches.length) {
      requestAnimationFrame(renderChunk);
    }
  };
  renderChunk();
}

function showRoster(teamCode) {
  initDOMCache();
  const teamKey = normalizeTeamKey(teamCode);
  const roster = rosterData[teamKey];
  if (!DOM.rosterTitle || !DOM.rosterContent) return;

  DOM.rosterTitle.textContent = `Roster for ${teamCode}`;
  DOM.rosterContent.innerHTML = '';

  if (!roster) {
    DOM.rosterContent.innerHTML = `<div class="error-message">Roster information for ${teamCode} is unavailable.</div>`;
    navigate('RosterPage');
    return;
  }

  const sections = [
    { label: 'Playing 11', list: roster.playing11 || [] },
    { label: 'Substitutes', list: roster.substitutes || [] },
    { label: 'Reserves', list: roster.reserves || [] }
  ];

  const fragment = document.createDocumentFragment();
  sections.forEach((section) => {
    if (!section.list || section.list.length === 0) return;
    const sectionElement = document.createElement('div');
    sectionElement.className = 'roster-section';
    sectionElement.innerHTML = `
      <h3>${section.label}</h3>
      <ul>${section.list.map((player) => `<li>${player}</li>`).join('')}</ul>
    `;
    fragment.appendChild(sectionElement);
  });

  DOM.rosterContent.appendChild(fragment);
  navigate('RosterPage');
}

function openMatchDetails(match) {
  initDOMCache();
  if (!DOM.detailBody) return;

  const baseTime = getMatchBaseTime(match);
  const convertedTimes = convertTime(baseTime, match.date);
  DOM.detailBody.innerHTML = `
    <div class="detail-header">
      <button type="button" class="team-link" data-team="${match.homeTeam}">${match.homeTeam}</button>
      <span class="detail-vs">VS</span>
      <button type="button" class="team-link" data-team="${match.awayTeam}">${match.awayTeam}</button>
    </div>
    <div class="detail-info">
      <p><strong>Stadium:</strong> ${match.stadium}</p>
      <p><strong>Date:</strong> ${match.date}</p>
      <p><strong>Base time:</strong> ${baseTime} UTC</p>
    </div>
    <div class="time-grid">
      ${buildTimeGrid(convertedTimes)}
    </div>
  `;

  DOM.detailBody.querySelectorAll('.team-link').forEach((button) => {
    button.addEventListener('click', (event) => {
      const team = event.currentTarget.getAttribute('data-team');
      if (team) showRoster(team);
    });
  });

  navigate('MatchDetailPage');
}

function animateLogoTransition() {
  const logo = document.querySelector('.round-logo');
  if (!logo) {
    navigate('MatchListPage');
    return;
  }
  logo.classList.add('logo-transition');
  logo.addEventListener('animationend', () => navigate('MatchListPage'), { once: true });
}

function handleAudioButton() {
  if (!hasUserInteracted) {
    hasUserInteracted = true;
  }
  audioController.toggle().catch(() => {});
}

function handleHashChange() {
  const hash = location.hash.replace('#', '').toLowerCase();
  if (hash === '/matches') {
    navigate('MatchListPage');
  } else if (hash === '/roster') {
    navigate('RosterPage');
  } else if (hash === '/detail') {
    navigate('MatchDetailPage');
  } else {
    navigate('IntroPage');
  }
}

async function preloadData() {
  try {
    const [matches, rosters] = await Promise.all([
      loadJsonLocal(MATCH_DATA_PATH),
      loadJsonLocal(ROSTER_DATA_PATH),
      audioController.preloadTracks()
    ]);
    matchData = Array.isArray(matches.matches) ? matches.matches : [];
    rosterData = (rosters && typeof rosters === 'object') ? rosters : {};
    renderMatches(matchData);
  } catch (error) {
    console.warn('Offline data preload failed', error);
    displayError('Unable to load local match or roster data.');
  }
}

async function init() {
  initDOMCache();
  showLoading('Initializing offline app...');
  audioController.init();

  const logoBtn = document.getElementById('logoBtn');
  if (logoBtn) {
    logoBtn.addEventListener('click', () => {
      if (!hasUserInteracted) {
        hasUserInteracted = true;
        audioController.play().catch(() => {});
      }
      animateLogoTransition();
    });
  }

  document.querySelectorAll('.back-btn').forEach((btn) => btn.addEventListener('click', () => StateManager.goBack()));
  if (DOM.audioPlayPause) {
    DOM.audioPlayPause.addEventListener('click', handleAudioButton);
  }
  if (DOM.audioStatus) {
    DOM.audioStatus.textContent = 'Audio: ready';
  }

  window.addEventListener('hashchange', handleHashChange);
  if (!location.hash) {
    location.hash = '#/';
  } else {
    handleHashChange();
  }

  await preloadData();
  hideLoading();
}

function displayError(message) {
  initDOMCache();
  if (DOM.matchGrid) {
    DOM.matchGrid.innerHTML = `<div class="error-message">${message}</div>`;
  }
}

window.addEventListener('DOMContentLoaded', init);
