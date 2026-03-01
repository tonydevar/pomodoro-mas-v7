# Design Decisions - Pomodoro Timer (pomodoro-mas-v7)

## Overview
Modern glassmorphism design with smooth animations and mobile-first responsive approach.

## Visual Design

### Color Scheme
- **Background**: Deep dark (#0f0f23) with subtle gradient orbs
- **Session Colors**:
  - Work: Coral red (#ff6b6b)
  - Short Break: Teal (#4ecdc4)
  - Long Break: Lavender (#a29bfe)
- **Glass Effect**: Semi-transparent white overlays with backdrop blur

### Typography
- Font: Inter (system fallback stack)
- Timer: Large, bold numerals (5rem desktop, 3.5rem mobile)
- Labels: Uppercase with letter-spacing for clarity

### Components

#### Timer Circle
- SVG-based progress ring with smooth stroke-dashoffset animation
- Glowing drop-shadow filter matching session color
- Centered time display with tabular numerals

#### Session Indicator
- Three dots showing progress toward long break
- Active state highlights current session type with glow effect

#### Glass Cards
- 12px backdrop blur
- Subtle white border (10-15% opacity)
- Hover state increases opacity

#### Controls
- Primary action (Start/Pause) in session color
- Secondary actions (Reset, Skip) as ghost buttons
- Floating animation on running state

### Animations
- Background: Slow-moving gradient orbs (20s cycle)
- Timer: Subtle pulse when running
- Buttons: Float animation on active state
- Settings: Smooth expand/collapse

## Responsive Breakpoints
- Mobile: < 480px (default)
- Tablet/Desktop: > 480px

## Accessibility
- Reduced motion media query support
- Focus-visible outlines for keyboard navigation
- High contrast text on dark background

## Design Rationale
1. Dark theme reduces eye strain during focused work sessions
2. Glassmorphism adds depth without visual clutter
3. Distinct session colors provide instant visual feedback
4. Progress ring clearly shows time remaining at a glance
5. Floating animations provide subtle confirmation of timer state