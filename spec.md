# Specification: Pomodoro Timer Webapp (pomodoro-mas-v7)

## Project Overview
A clean, responsive Pomodoro timer web application designed to help users manage their work and break intervals effectively using the Pomodoro Technique.

## Features
- **Timer Engine**: 25-minute work intervals, 5-minute short breaks, and 15-minute long breaks.
- **Cycle Mode**: Automatic or manual transition between work/break sessions.
- **Visual Feedback**: Dynamic progress ring and favicon status updates.
- **Audio Alerts**: Subtle notification sound when a session ends.
- **Settings**: Customizable durations for work and break intervals.
- **Responsive Design**: Mobile-first approach, functional on all screen sizes.

## Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+).
- **Styling**: Modern CSS with Glassmorphism effects.
- **Assets**: Standard web fonts (Inter/System stack), SVG icons.

## File Structure
```text
/
├── index.html      # Main entry point
├── style.css       # UX-defined styling
├── app.js          # Core application logic
├── assets/         # Audio and image assets
└── spec.md         # This specification
```

## Data Model (Local State)
- `timerState`: 'work' | 'shortBreak' | 'longBreak' | 'idle'
- `timeLeft`: Integer (seconds)
- `settings`: { workDuration: 25, shortBreak: 5, longBreak: 15 }
- `sessionCount`: Integer (to track long break triggers)

## Edge Cases
- **Page Refresh**: State should persist via `localStorage` if possible.
- **Backgrounding**: Use `Web Workers` or robust timestamp comparison to ensure timer accuracy when the tab is inactive.
- **Audio Permissions**: Handle browsers blocking auto-play audio (require user interaction first).

## Testing Criteria
- Timer counts down correctly.
- Transitions between session types occur as expected.
- Reset functionality works.
- Settings updates are reflected in the timer (when not running).
- Mobile layout is usable and visually consistent.
