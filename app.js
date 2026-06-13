'use strict';

/**
 * ------------------------------------------------------------------------
 * FIFA Match Explorer - Core Application Logic for Single-HTML-File App
 * ------------------------------------------------------------------------
 * This script is architected to power a multi-page experience within a
 * single HTML file, specifically for a Cordova environment targeting
 * Android 15. It handles initialization, page navigation, data fetching,
 * and dynamic content rendering.
 * ------------------------------------------------------------------------
 */

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    console.log('Device is ready. Application initializing...');

    // --- Configuration & State ---
    const config = {
        api: { matches: 'matches.json', rosters: 'rosters.json' },
        timezones: {
            'IST': 'Asia/Kolkata',
            'USA Eastern': 'America/New_York',
            'USA Central': 'America/Chicago',
            'USA Mountain': 'America/Denver',
            'USA Pacific': 'America/Los_Angeles',
            'Australia': 'Australia/Sydney',
            'Japan': 'Asia/Tokyo',
            'UTC': 'UTC'
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
        },
        logoContainer: document.querySelector('.logo-container'),
        matchList: document.querySelector('.match-list'),
        detailsTitle: document.getElementById('details-title'),
        detailsContent: document.getElementById('details-content'),
        viewRosterBtn: document.getElementById('view-roster-btn'),
        rosterModal: document.getElementById('roster-modal'),
        rosterContent: document.getElementById('roster-content'),
    };

    // --- Global Page Navigation ---
    window.showPage = async function(pageId, options = {}) {
        console.log(`Navigating to: ${pageId}`);
        
        // Hide all pages before showing the target one
        Object.values(dom.pages).forEach(page => page.classList.remove('active'));

        const targetPage = dom.pages[pageId.replace('page-', '')];
        if (targetPage) {
            targetPage.classList.add('active');
        } else {
            console.error(`Navigation Error: Page "${pageId}" not found.`);
            return;
        }

        // Handle page-specific logic
        if (pageId === 'page-matches' && !state.isDataFetched.matches) {
            await fetchData('matches');
            renderMatchList();
        } else if (pageId === 'page-details' && options.matchId) {
            state.currentMatchId = options.matchId;
            if (!state.isDataFetched.matches) await fetchData('matches');
            renderMatchDetails();
        }
    };

    // --- Data Fetching ---
    async function fetchData(dataType) {
        if (state.isDataFetched[dataType]) return;
        try {
            console.log(`Fetching ${dataType} data...`);
            const response = await fetch(config.api[dataType]);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            state[dataType] = await response.json();
            state.isDataFetched[dataType] = true;
            console.log(`${dataType} data fetched successfully.`);
        } catch (error) {
            console.error(`Failed to fetch ${dataType}:`, error);
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
            card.onclick = () => showPage('page-details', { matchId: match.matchNumber });
            dom.matchList.appendChild(card);
        });
        console.log('Match list rendered.');
    }

    function renderMatchDetails() {
        const match = (state.matches.matches || []).find(m => m.matchNumber === state.currentMatchId);
        if (!match) return;

        dom.detailsTitle.textContent = `${match.homeTeam} vs ${match.awayTeam}`;
        const timeList = Object.entries(config.timezones).map(([label, zone]) => {
            try {
                const date = new Date(`${match.date} ${match.time || '00:00'} UTC`);
                const time = date.toLocaleTimeString('en-US', { timeZone: zone, hour: '2-digit', minute: '2-digit' });
                return `<li><strong>${label}:</strong> ${time}</li>`;
            } catch (e) {
                return `<li><strong>${label}:</strong> Invalid Time</li>`;
            }
        }).join('');
        dom.detailsContent.innerHTML = `<p><strong>Stadium:</strong> ${match.stadium}</p><ul>${timeList}</ul>`;
        console.log('Match details rendered.');
    }

    async function renderRoster() {
        if (!state.isDataFetched.rosters) await fetchData('rosters');
        const match = (state.matches.matches || []).find(m => m.matchNumber === state.currentMatchId);
        if (!match) return;
        
        const getTeamRosterHTML = (teamName) => {
            const teamKey = teamName.toUpperCase().replace(' ', ' '); // Adjust key if needed
            const roster = state.rosters[teamKey];
            if (!roster) return '<p>Roster not available.</p>';
            const playing11 = (roster.playing11 || []).map(p => `<li>${p}</li>`).join('');
            const subs = (roster.substitutes || []).map(p => `<li>${p}</li>`).join('');
            return `<h4>${teamName}</h4><h5>Playing 11</h5><ul>${playing11}</ul><h5>Substitutes</h5><ul>${subs}</ul>`;
        };

        dom.rosterContent.innerHTML = getTeamRosterHTML(match.homeTeam) + '<hr>' + getTeamRosterHTML(match.awayTeam);
        dom.rosterModal.classList.add('active');
        console.log('Roster rendered.');
    }

    // --- Event Listeners ---
    function initEventListeners() {
        // Splash Screen Transition
        dom.logoContainer.addEventListener('click', () => {
            console.log('Splash screen transition initiated.');
            dom.logoContainer.classList.add('animate');
            // After animation, hide splash and show matches
            setTimeout(() => {
                dom.pages.splash.style.display = 'none'; // Hard hide after transition
                showPage('page-matches');
            }, 2000); 
        });

        // View Roster Button
        dom.viewRosterBtn.addEventListener('click', renderRoster);
        console.log('Core event listeners initialized.');
    }

    // --- App Initialization ---
    console.log('Initializing application logic.');
    initEventListeners();
    // Start on the splash page by default
    showPage('page-splash');
}
