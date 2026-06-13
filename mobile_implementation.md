# FIFA Match Explorer - Android Implementation Guide

This document outlines the final steps for building the APK.

## Project Structure
- `index.html`: Main UI with logo and page containers.
- `app.js`: Application logic and AudioController.
- `styles.css`: Mobile-optimized styling.
- `config.xml`: Native Android configuration.
- `audio/`: Directory containing the 3-song loop.
- `matches.json` & `rosters.json`: Local data sources.

## APK Build Steps (Cordova)
1. Install Cordova: `npm install -g cordova`
2. Create project: `cordova create fifa_app com.fifa.matchexplorer "Match Explorer"`
3. Add platform: `cordova platform add android`
4. Copy all project files into the `www/` folder.
5. Build: `cordova build android`

## Key Mobile Features
- **Audio Persistence**: The AudioController is hardcoded to run continuously in the background using the Cordova background preference.
- **Local Data**: Hardcoded paths ensure JSON data is fetched from the local assets folder rather than a remote server.
- **Portrait Lock**: The UI is locked to portrait mode for a consistent mobile experience.