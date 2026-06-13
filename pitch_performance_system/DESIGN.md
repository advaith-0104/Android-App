---
name: Pitch Performance System
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#424655'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#727787'
  outline-variant: '#c2c6d8'
  surface-tint: '#0057ce'
  primary: '#0057cd'
  on-primary: '#ffffff'
  primary-container: '#0d6efd'
  on-primary-container: '#ffffff'
  inverse-primary: '#b1c5ff'
  secondary: '#b90c17'
  on-secondary: '#ffffff'
  secondary-container: '#de2e2c'
  on-secondary-container: '#fffbff'
  tertiary: '#0c5f9a'
  on-tertiary: '#ffffff'
  tertiary-container: '#3578b5'
  on-tertiary-container: '#fdfcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b1c5ff'
  on-primary-fixed: '#001946'
  on-primary-fixed-variant: '#00419e'
  secondary-fixed: '#ffdad6'
  secondary-fixed-dim: '#ffb4ab'
  on-secondary-fixed: '#410002'
  on-secondary-fixed-variant: '#93000d'
  tertiary-fixed: '#d0e4ff'
  tertiary-fixed-dim: '#9ccaff'
  on-tertiary-fixed: '#001d35'
  on-tertiary-fixed-variant: '#00497a'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
  text-primary: '#222222'
  text-secondary: '#444444'
  surface-translucent: rgba(255, 255, 255, 0.88)
  border-subtle: rgba(36, 41, 46, 0.08)
  warning-bg: '#fff3cd'
  error-bg: '#f8d7da'
typography:
  display-xl:
    fontFamily: Hanken Grotesk
    fontSize: 64px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  title-md:
    fontFamily: Hanken Grotesk
    fontSize: 1.25rem
    fontWeight: '700'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: '1.55'
  label-lg:
    fontFamily: Hanken Grotesk
    fontSize: 0.95rem
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 0.85rem
    fontWeight: '600'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-margin: 2rem
  container-margin-mobile: 1rem
  gutter: 1rem
  stack-lg: 1.5rem
  stack-md: 1.25rem
  stack-sm: 0.75rem
  touch-target: 3rem
---

## Brand & Style

The design system embodies the energy and precision of international football. It is built on a **Corporate / Modern** foundation with a distinct **Glassmorphic** overlay, reflecting a high-performance, mobile-native environment. 

The aesthetic is characterized by:
- **Athletic Dynamism:** Utilizing a vibrant "flag-wave" palette of red, white, and blue to evoke a sense of competition and global pride.
- **Precision Clarity:** High-contrast typography and generous negative space ensure critical match data is legible at a glance.
- **Tactile Responsiveness:** Deep, diffused shadows and background blurs create a layered interface that feels physically present and responsive to touch.
- **Mobile-Native Ergonomics:** Every interaction is optimized for thumb-reach and rapid navigation, prioritizing large tap targets and fluid transitions.

## Colors

This design system utilizes a high-contrast palette rooted in sporting tradition. 

- **Primary Blue:** Reserved for the most critical actions, active states, and navigation indicators.
- **Secondary Red:** Used for decorative elements like the flag-wave gradient and secondary brand accents.
- **Backgrounds:** The interface uses a tiered system of off-whites (`#f4f6f8` for the body and `#ffffff` for cards) to provide soft depth without the harshness of pure white.
- **Translucency:** Background blurs and high-opacity whites are used for floating controls (like audio or persistent filters) to maintain context while ensuring legibility.

## Typography

The system uses **Hanken Grotesk** to provide a sharp, contemporary, and athletic feel. The typography follows a "fluid first" approach.

- **Display & Headlines:** Use tight line heights and slight negative letter spacing for a high-impact, editorial look.
- **Body Text:** Designed for readability with a generous `1.6` line height to handle dense data like player rosters and match commentary.
- **Labels:** Team names and statistics are rendered in bold, uppercase, or high-weight variants to provide immediate visual hierarchy within data-heavy cards.

## Layout & Spacing

This design system uses a **fluid grid** model optimized for high-density information.

- **Grid:** A 12-column grid on desktop transitions to a single-column flow on mobile (breakpoint: `768px`).
- **Rhythm:** Spacing follows an 8px/16px base scale. Page-level margins are generous (32px) on desktop to frame the content, but collapse to 16px on mobile to maximize usable screen real estate.
- **Component Layout:** Use `gap: 1rem` for match card grids to ensure clear separation. Inside cards, use a 20px padding (`stack-md`) to ensure tap targets are comfortable for mobile users.

## Elevation & Depth

Hierarchy is established through a combination of **glassmorphism** and **ambient shadows**.

- **Surface Tiers:**
    - **Level 0 (Background):** `#f4f6f8` flat surface.
    - **Level 1 (Cards):** `#ffffff` with a subtle `1px` border (`border-subtle`).
    - **Level 2 (Floating):** Translucent surfaces with a `8px` backdrop blur and `16px` diffused shadows.
- **Interaction Depth:** On hover or active states, components should "lift" toward the user. Match cards increase their shadow spread and blur radius, while the logo uses a primary blue-tinted glow (`rgba(13, 110, 253, 0.3)`) to signal interactivity.

## Shapes

The shape language is **Rounded**, avoiding harsh corners to maintain an approachable and modern sporting feel.

- **Standard Containers:** Match cards and roster sections use an `18px` radius (`rounded-lg`).
- **Hero Elements:** Larger structural containers use `24px` (`rounded-xl`).
- **Interactive Elements:** Buttons and chips use **Pill-shaped** (999px) geometry. This distinguishes actions from informational containers and provides a clear touch-affordance.
- **Brand Identity:** The primary logo remains circular (`50%`) to stand out against the geometric grid.

## Components

### Buttons
- **Primary:** Pill-shaped, primary blue background, white text. Uses a `scale(0.98)` active state for haptic feedback.
- **Secondary/Action:** Pill-shaped, transparent background with a primary blue border.

### Cards (Match & Roster)
- Cards are white with an `18px` corner radius and a subtle `1px` border.
- **Hover State:** Cards should scale slightly (`scale(1.02)`) and increase shadow depth to indicate they are clickable.
- **Active State:** A `1px` solid primary blue border is applied to signify a "selected" or "current" match.

### Inputs & Audio Controls
- Fixed elements (like audio playback) use a glassmorphic style: `rgba(255, 255, 255, 0.96)` background with a `8px` blur.
- Inputs should have a minimum height of `48px` to ensure mobile touch compliance.

### Chips & Badges
- Use small, pill-shaped containers for match status (e.g., "LIVE", "FT").
- High-contrast background colors (red for Live, neutral for Finished) for immediate recognition.

### Interaction Logic
- All interactive components must include `touch-action: manipulation` to prevent 300ms mobile tap delays.
- Transitions should be snappy: `180ms ease` for structural changes and `150ms` for color/opacity shifts.