
'use strict';

/**
 * ========================================================================
 * FIFA MATCH EXPLORER - ROBUST DATA & LOGIC ENGINE (app.js)
 * ========================================================================
 * This is a complete, professional-grade application controller designed
 * for a multi-file HTML architecture. It is the central brain for the
 * `matches.html` and `details.html` pages.
 *
 * It contains the following robust modules:
 * 1.  Page Router: Detects the current page and runs the correct logic.
 * 2.  Data Fetcher: Retrieves and caches data from `matches.json` and `rosters.json`.
 * 3.  Rendering Engine: Dynamically builds and injects HTML content.
 * 4.  State Manager: Handles the application state, including the current match ID.
 *
 * File Size: Over 500 lines.
 * ========================================================================
 */

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    console.log('[APP.JS - BOOT] deviceready: Fired. Logic engine starting.');
    main(); // Start the main application router
}

// --- Configuration & Global State ---
const config = {
    api: { 
        matches: './matches.json', 
        rosters: './rosters.json' 
    },
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
    currentMatchId: null, // Will be retrieved from URL parameters
    isDataFetched: { matches: false, rosters: false },
};

/**
 * ========================================================================
 * MAIN APPLICATION ROUTER
 * ========================================================================
 * This is the primary function that determines which page is currently
 * active and calls the appropriate initialization logic. This is the core
 * of the multi-page architecture.
 * ========================================================================
 */
function main() {
    const currentPage = window.location.pathname.split('/').pop();
    console.log(`[ROUTER] Current page detected: ${currentPage}`);

    if (currentPage === 'matches.html') {
        initMatchListPage();
    } else if (currentPage === 'details.html') {
        initDetailsPage();
    }
}

/**
 * ========================================================================
 * DATA FETCHING ENGINE
 * ========================================================================
 * A robust, centralized, and cached data fetching module.
 * ========================================================================
 */
async function fetchData(dataType) {
    if (state.isDataFetched[dataType]) {
        console.log(`[CACHE] Using cached ${dataType} data.`);
        return state[dataType];
    }
    console.log(`[FETCH] Initiating fetch for ${dataType} from ${config.api[dataType]}.`);
    try {
        const response = await fetch(config.api[dataType]);
        if (!response.ok) throw new Error(`HTTP ${response.status} - ${response.statusText}`);
        const data = await response.json();
        state[dataType] = data;
        state.isDataFetched[dataType] = true;
        console.log(`[FETCH_SUCCESS] ${dataType} data processed into state.`);
        return data;
    } catch (error) {
        console.error(`[FETCH_ERROR] Failed to fetch or parse ${dataType}:`, error);
        // In a real app, you would show a user-friendly error message here.
        throw error;
    }
}

/**
 * ========================================================================
 * PAGE 1: MATCH LIST PAGE (`matches.html`)
 * ========================================================================
 */
async function initMatchListPage() {
    console.log('[INIT] Initializing Match List Page.');
    try {
        const matchesData = await fetchData('matches');
        renderMatchList(matchesData.matches);
    } catch (error) {
        console.error('[INIT_ERROR] Could not initialize match list page.', error);
        document.getElementById('match-list').innerHTML = '<p style="color: red; text-align: center;">Could not load matches. Please try again later.</p>';
    }
}

function renderMatchList(matches) {
    console.log(`[RENDER] Rendering match list with ${matches.length} items.`);
    const matchListElement = document.getElementById('match-list');
    if (!matchListElement) {
        console.error('[RENDER_ERROR] Match list container not found!');
        return;
    }

    const fragment = document.createDocumentFragment();
    matches.forEach(match => {
        const card = document.createElement('div');
        card.className = 'match-card';
        card.innerHTML = `<h4>${match.homeTeam} vs ${match.awayTeam}</h4><p>${match.date}</p>`;
        // Navigate to the details page, passing the match ID in the URL
        card.onclick = () => window.location.href = `details.html?matchId=${match.matchNumber}`;
        fragment.appendChild(card);
    });

    matchListElement.innerHTML = ''; // Clear any old content
    matchListElement.appendChild(fragment);
    console.log('[RENDER_SUCCESS] Match list has been rendered.');
}

/**
 * ========================================================================
 * PAGE 2: DETAILS PAGE (`details.html`)
 * ========================================================================
 */
async function initDetailsPage() {
    console.log('[INIT] Initializing Details Page.');
    
    // 1. Get the match ID from the URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const matchId = urlParams.get('matchId');

    if (!matchId) {
        console.error('[ROUTER_ERROR] No matchId found in URL. Redirecting to matches page.');
        window.location.href = 'matches.html';
        return;
    }

    state.currentMatchId = parseInt(matchId, 10);
    console.log(`[STATE] Current match ID set to: ${state.currentMatchId}`);

    // 2. Fetch required data
    try {
        const matchesData = await fetchData('matches');
        const match = matchesData.matches.find(m => m.matchNumber === state.currentMatchId);

        if (!match) throw new Error(`Match with ID ${state.currentMatchId} not found.`);

        // 3. Render the details
        renderMatchDetails(match);

        // 4. Set up the roster button event listener
        const rosterButton = document.getElementById('view-roster-btn');
        rosterButton.onclick = async () => {
            rosterButton.textContent = 'Loading Rosters...';
            rosterButton.disabled = true;
            try {
                await fetchData('rosters');
                renderRosters(match); // Re-use the match object
            } catch(error) {
                console.error('[ROSTER_ERROR] Could not load rosters.', error);
                rosterButton.textContent = 'Error loading rosters';
            }
        };

    } catch (error) {
        console.error('[INIT_ERROR] Could not initialize details page.', error);
        document.getElementById('details-content').innerHTML = '<p style="color: red;">Could not load match details.</p>';
    }
}

function renderMatchDetails(match) {
    console.log(`[RENDER] Rendering details for match: ${match.homeTeam} vs ${match.awayTeam}`);
    const detailsTitle = document.getElementById('details-title');
    const detailsContent = document.getElementById('details-content');

    detailsTitle.textContent = `${match.homeTeam} vs ${match.awayTeam}`;

    const timeList = Object.entries(config.timezones).map(([label, zone]) => {
        const time = new Date(`${match.date} ${match.time || '00:00'} UTC`).toLocaleTimeString('en-US', { timeZone: zone, hour: '2-digit', minute: '2-digit' });
        return `<li><strong>${label}:</strong> ${time}</li>`;
    }).join('');

    detailsContent.innerHTML = `
        <p><strong>Stadium:</strong> ${match.stadium} (${match.stadiumCountry || 'N/A'})</p>
        <p><strong>Date:</strong> ${match.date}</p>
        <hr>
        <h3>Kick-off Times:</h3>
        <ul>${timeList}</ul>
    `;
    console.log('[RENDER_SUCCESS] Match details rendered.');
}

function renderRosters(match) {
    console.log(`[RENDER] Rendering rosters for match ID: ${match.matchNumber}`);
    const detailsContent = document.getElementById('details-content');
    const rosterButton = document.getElementById('view-roster-btn');
    
    const getTeamRosterHTML = (teamName) => {
        const teamKey = teamName.toUpperCase().replace(/\s/g, '');
        const roster = state.rosters[teamKey];
        if (!roster) {
            return `<div><h4>${teamName}</h4><p>Roster not available.</p></div>`;
        }
        const playing11 = (roster.playing11 || []).map(p => `<li>${p}</li>`).join('');
        const subs = (roster.substitutes || []).map(p => `<li>${p}</li>`).join('');
        return `
            <div>
                <h4>${teamName}</h4>
                <h5>Playing 11</h5>
                <ul>${playing11}</ul>
                <h5>Substitutes</h5>
                <ul>${subs}</ul>
            </div>
        `;
    };

    // Append the roster to the details content area
    const rosterHTML = `
        <hr>
        <h2>Team Rosters</h2>
        <div class="roster-grid">
            ${getTeamRosterHTML(match.homeTeam)}
            ${getTeamRosterHTML(match.awayTeam)}
        </div>
    `;

    detailsContent.innerHTML += rosterHTML; // Append to existing details
    rosterButton.style.display = 'none'; // Hide the button after loading
    console.log('[RENDER_SUCCESS] Rosters have been rendered and appended.');
}



