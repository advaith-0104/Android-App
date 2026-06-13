'use strict';

/**
 * ------------------------------------------------------------------------
 * FIFA Match Explorer - Core Logic for 4-Page Single-HTML-File App
 * ------------------------------------------------------------------------
 * CRITICAL REFACTOR (FIXED): This script manages a 4-page structure within a
 * single HTML file for a Cordova environment on Android 15. It ensures
 * continuous background audio playback and adheres to the specified SPA-like
 * navigation model.
 * ------------------------------------------------------------------------
 */

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    console.log('[INFO] deviceready event fired. Application initializing...');

    // --- Audio Controller ---
    const audio = {
        player: document.getElementById('background-audio'),
        isPlaying: false,
        play: function() {
            if (this.player && this.player.paused) {
                this.player.play().then(() => {
                    this.isPlaying = true;
                    console.log('[SUCCESS] Background audio started successfully.');
                }).catch(error => {
                    console.error('[ERROR] Audio playback failed:', error);
                });
            } else if (this.player) {
                 console.log('[INFO] Audio is already playing.');
            }
        },
        init: function() {
            console.log('[INFO] Initializing audio...');
            if (this.player) {
                this.player.load();
            } else {
                console.error('[ERROR] Audio player element not found!');
            }
        }
    };

    // --- Configuration & State ---
    const config = {
        api: { matches: './matches.json', rosters: './rosters.json' },
        timezones: {
            'IST': 'Asia/Kolkata',
            'EST': 'America/New_York',
            'CST': 'America/Chicago',
            'MST': 'America/Denver',
            'PST': 'America/Los_Angeles',
            'GMT': 'UTC',
            'AEST': 'Australia/Sydney',
            'JST': 'Asia/Tokyo'
        }
    };

    const state = {
        matches: [],
        rosters: {},
        currentMatchId: null,
        isDataFetched: { matches: false, rosters: false },
    };

    // --- DOM Element Cache ---
    const dom = {
        pages: {
            splash: document.getElementById('page-splash'),
            matches: document.getElementById('page-matches'),
            details: document.getElementById('page-details'),
            roster: document.getElementById('page-roster'),
        },
        logoContainer: document.querySelector('.logo-container'),
        matchList: document.querySelector('.match-list'),
        detailsTitle: document.getElementById('details-title'),
        detailsContent: document.getElementById('details-content'),
        viewRosterBtn: document.getElementById('view-roster-btn'),
        rosterPageContent: document.getElementById('roster-page-content'),
        backToDetailsBtn: document.getElementById('back-to-details-btn')
    };

    // --- Global Page Navigation ---
    window.showPage = async function(pageId, dataId = null) {
        console.log(`[NAV] Attempting to navigate to: ${pageId} with dataID: ${dataId}`);
        
        if (dataId) {
            state.currentMatchId = dataId;
        }

        Object.values(dom.pages).forEach(page => page.classList.remove('active'));

        const targetPageKey = pageId.replace('page-', '');
        const targetPage = dom.pages[targetPageKey];

        if (targetPage) {
            targetPage.classList.add('active');
            console.log(`[NAV_SUCCESS] Page displayed: ${pageId}`);
        } else {
            console.error(`[NAV_ERROR] Page "${pageId}" not found in DOM cache.`);
            return;
        }

        // Handle page-specific logic
        switch(pageId) {
            case 'page-matches':
                if (!state.isDataFetched.matches) await fetchData('matches');
                renderMatchList();
                break;
            case 'page-details':
                if (!state.currentMatchId) {
                    console.error("[ERROR] showPage('page-details') called without a matchID.");
                    showPage('page-matches'); // Fallback
                    return;
                }
                if (!state.isDataFetched.matches) await fetchData('matches');
                renderMatchDetails();
                break;
            case 'page-roster':
                if (!state.currentMatchId) {
                    console.error("[ERROR] showPage('page-roster') called without a matchID.");
                    showPage('page-matches'); // Fallback
                    return;
                }
                if (!state.isDataFetched.rosters) await fetchData('rosters');
                renderRosterPage();
                break;
            default:
                console.log(`[NAV_INFO] No specific action for page: ${pageId}`);
        }
    };

    // --- Data Fetching ---
    async function fetchData(dataType) {
        if (state.isDataFetched[dataType]) {
            console.log(`[CACHE] Using cached ${dataType} data.`);
            return;
        }
        try {
            console.log(`[FETCH] Fetching ${dataType} data from ${config.api[dataType]}...`);
            const response = await fetch(config.api[dataType]);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            state[dataType] = await response.json();
            state.isDataFetched[dataType] = true;
            console.log(`[FETCH_SUCCESS] ${dataType} data fetched successfully.`);
        } catch (error) {
            console.error(`[FETCH_ERROR] Failed to fetch ${dataType}:`, error);
            state.isDataFetched[dataType] = false; // Allow retry
        }
    }

    // --- Rendering ---
    function renderMatchList() {
        dom.matchList.innerHTML = ''; // Clear previous content
        const matches = state.matches.matches || [];
        matches.forEach(match => {
            const card = document.createElement('div');
            card.className = 'match-card';
            card.innerHTML = `<h4>${match.homeTeam} vs ${match.awayTeam}</h4><p>${match.date}</p>`;
            card.onclick = () => showPage('page-details', match.matchNumber);
            dom.matchList.appendChild(card);
        });
        console.log(`[RENDER] Match list rendered with ${matches.length} items.`);
    }

    function renderMatchDetails() {
        const match = (state.matches.matches || []).find(m => m.matchNumber === state.currentMatchId);
        if (!match) {
             console.error(`[RENDER_ERROR] No match found for ID: ${state.currentMatchId}`);
             return;
        }
        dom.detailsTitle.textContent = `${match.homeTeam} vs ${match.awayTeam}`;
        const timeList = Object.entries(config.timezones).map(([label, zone]) => {
             const time = new Date(`${match.date} ${match.time || '00:00'} UTC`).toLocaleTimeString('en-US', { timeZone: zone, hour: '2-digit', minute: '2-digit' });
             return `<li><strong>${label}:</strong> ${time}</li>`;
        }).join('');
        dom.detailsContent.innerHTML = `<p><strong>Stadium:</strong> ${match.stadium} (${match.stadiumCountry || ''})</p><ul>${timeList}</ul>`;
        dom.viewRosterBtn.onclick = () => showPage('page-roster', state.currentMatchId);
        console.log(`[RENDER] Match details rendered for match ID: ${state.currentMatchId}.`);
    }

    function renderRosterPage() {
        const match = (state.matches.matches || []).find(m => m.matchNumber === state.currentMatchId);
        if (!match) {
            console.error(`[RENDER_ERROR] Cannot render roster, no match found for ID: ${state.currentMatchId}`);
            return;
        }
        const getTeamRosterHTML = (teamName) => {
            const teamKey = teamName.toUpperCase().replace(/\s/g, ''); // Fix: Handle multiple spaces
            const roster = state.rosters[teamKey];
            if (!roster) return `<p>Roster for ${teamName} not available.</p>`;
            const playing11 = (roster.playing11 || []).map(p => `<li>${p}</li>`).join('');
            const subs = (roster.substitutes || []).map(p => `<li>${p}</li>`).join('');
            return `<h4>${teamName}</h4><h5>Playing 11</h5><ul>${playing11}</ul><h5>Substitutes</h5><ul>${subs}</ul>`;
        };
        dom.rosterPageContent.innerHTML = getTeamRosterHTML(match.homeTeam) + '<hr>' + getTeamRosterHTML(match.awayTeam);
        console.log(`[RENDER] Roster page rendered for match ID: ${state.currentMatchId}.`);
    }

    // --- Event Listeners & Initialization ---
    function init() {
        console.log('[INIT] Initializing application and event listeners.');
        
        // 1. Initialize Audio
        audio.init();

        // 2. Splash Screen Logic
        dom.logoContainer.addEventListener('click', () => {
            console.log('[EVENT] Splash screen clicked. Starting transition and audio.');
            // Play audio on first user interaction
            audio.play();
            
            dom.logoContainer.classList.add('animate');
            setTimeout(() => {
                showPage('page-matches');
            }, 2000);
        }, { once: true }); // Ensure this only runs once

        // 3. Static Navigation Buttons
        dom.backToDetailsBtn.onclick = () => showPage('page-details', state.currentMatchId);

        console.log('[INIT_SUCCESS] Application initialized. Waiting for user interaction.');
    }

    // Start the main application logic
    init();
}
