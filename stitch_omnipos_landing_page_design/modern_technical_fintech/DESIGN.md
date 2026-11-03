---
name: Modern Technical FinTech
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434655'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#784b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#996100'
  on-tertiary-container: '#ffeedd'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 38px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.025em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 26px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.011em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: -0.006em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: -0.005em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
  tabular-stat:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 0.75rem
  gutter-md: 1rem
  margin: 1rem
  margin-md: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system establishes a high-precision, conversion-led SaaS aesthetic tailored for enterprise inventory logistics and point-of-sale management in Vietnam. 

### Emotional Impact & Personality
- **Surgical Precision:** Inspired by tools like Linear and Stripe, every pixel, hairline border, and numeric value communicates operational accuracy.
- **Institutional Reliability:** Balances modern SaaS velocity with the grounded, unyielding stability required for financial ledgers, transactional throughput, and stock tracking.
- **High-Density Utility:** Maximizes screen efficiency for 390px mobile viewports without sacrificing legibility or touch ergonomics.

### Aesthetic Foundation
The visual architecture blends **Modern SaaS Functionalism** with **Engineered Data Density**:
- **Structured Hierarchy:** Slate and crisp white surfaces framed by defined hairlines.
- **Dynamic Realism:** Rich mockups of physical and digital checkout environments, interactive VietQR overlays, and hardware-grade micro-indicators.
- **Deep Contrast Anchors:** Strategic high-contrast dark sections (`#0F172A`) frame critical dashboards and ledger feeds against light operational canvas backgrounds (`#F8FAFC`).

## Colors

The palette uses a crisp, high-contrast spectrum engineered for fast recognition under varying retail lighting conditions.

### Palette Architecture
- **Primary (`#2563EB`):** High-clarity Royal Blue for primary interactive states, confirmed actions, and active system focus. Uses deep `#1D4ED8` for active/hover states and soft `#EFF6FF` for selection washes and badge fills.
- **Success & Stock Surplus (`#10B981`):** Pure Emerald Green reserved strictly for confirmed payments, incoming inventory receipts, and positive delta values. Paired with `#ECFDF5` for subtle background containment.
- **Warning & Attention (`#F59E0B`):** Amber configured exclusively for critical alerts—low-stock warnings, offline terminal switches, and payment timeouts. Paired with `#FEF3C7`.
- **Neutral Canvas & Foundations:**
  - `Canvas App Base`: `#F8FAFC` (Slate 50)
  - `Surface Elevated`: `#FFFFFF`
  - `Dark Section Anchor`: `#0F172A` (Slate 900)
  - `Text Primary`: `#0F172A`
  - `Text Secondary`: `#475569`
  - `Text Muted`: `#94A3B8`
  - `Borders & Separators`: `#E2E8F0` (standard) and `#CBD5E1` (high-emphasis inputs)
  - `Glass Accent Stroke`: `rgba(255, 255, 255, 0.15)` inside dark operational frames.

## Typography

The typographic hierarchy couples the geometric structure of Plus Jakarta Sans for titles with the neutral legibility of Inter for continuous data processing.

### Typography Rules
- **Vietnamese Language Optimization:** Tightly tracked headings must retain adequate line-height to ensure diacritics (dấu ngã, hỏi, nặng) never collide with adjacent ascenders or descenders.
- **Tabular Numerics:** All currency (`₫`), barcode sequences, inventory counts, and metrics must enforce `font-feature-settings: "tnum" 1, "cv05" 1`. This aligns decimals and thousands separators perfectly across ledger lines.
- **Currency Standards:** Render currency values with full dot-separators and the lowercase Vietnamese dong indicator: `1.450.000đ`.

## Layout & Spacing

A compact 4-column layout model tailored specifically for 390px mobile viewports (expandable to 12 columns for tablet POS systems).

### Grid & Ergonomics
- **Base Canvas Unit:** 4px baseline rhythm.
- **Screen Margins:** Standard mobile screen inset of `16px` (`margin`), expanding to `24px` (`margin-md`) on larger surfaces.
- **Internal Bento Padding:** Card internal paddings strictly observe `12px` (`space-md`) for high density, stepping up to `16px` (`space-lg`) for major summary sections.
- **Touch Targets:** All interactive terminal buttons, list options, and toggles strictly maintain a minimum vertical touch footprint of 44px, despite compact visual padding.

## Elevation & Depth

Visual separation relies on sharp boundary definition rather than heavy, blurry drop shadows.

### Elevation Levels
- **Level 0 (App Canvas):** `#F8FAFC`, non-elevated.
- **Level 1 (Bento Cards & Table Rows):** `#FFFFFF` with a crisp `1px` border of `#E2E8F0` and an ambient hairline shadow: `0 1px 3px rgba(15, 23, 42, 0.04)`.
- **Level 2 (Active Terminal Dropdowns & Flyouts):** `#FFFFFF` framed with `border: 1px solid #CBD5E1`, with shadow: `0 4px 12px -2px rgba(15, 23, 42, 0.08)`.
- **Level 3 (VietQR Modal & Critical Dialogues):** `#FFFFFF` floating above an ultra-dark backdrop wash (`rgba(15, 23, 42, 0.65)` with a `4px` blur). Modal drop-shadow: `0 20px 25px -5px rgba(15, 23, 42, 0.15)`.
- **Glass Inset Layers (Dark Containers):** Inside `#0F172A` ledger cards, sub-panels utilize `background: rgba(255, 255, 255, 0.04)` with an interior highlight border: `1px solid rgba(255, 255, 255, 0.1)`.

## Shapes

The design system maintains a controlled, structural curvature (Level 2) that preserves the crisp look of professional instrumentation while remaining friendly.

### Shape Scale
- **Small Elements (Badges, Keycaps, Toggles):** `6px` radius.
- **Inputs & Interactive Buttons:** `8px` (`0.5rem`) radius.
- **Bento Modules & Transaction Cards:** `16px` (`1rem`, `rounded-lg`) radius.
- **VietQR Modal Sheet & Deep-Anchor Containers:** `24px` (`1.5rem`, `rounded-xl`) radius.
- **Status Pills:** `9999px` (Full Pill) for live availability indicators and quick filter chips.

## Components

### Buttons
- **Primary:** Background `#2563EB`, text `#FFFFFF`, radius `8px`, height `44px`. Focus ring `2px solid #2563EB` with `2px` offset. Active: `#1D4ED8`.
- **Secondary / Operational:** Background `#FFFFFF`, border `1px solid #E2E8F0`, text `#0F172A`. Active: `#F1F5F9`.
- **Destructive / Void Sale:** Background `#FEF2F2`, text `#DC2626`, border `1px solid #FEE2E2`.

### Bento Grid Cards
- Encapsulated containers with `#FFFFFF` background, `1px solid #E2E8F0`, and `16px` border-radius.
- Headers feature uppercase metadata tags (`label-sm`, `#64748B`), bold numeric counters, and a micro sparkline or state badge pinned to the top-right corner.

### VietQR Dynamic Payment Modal
- Centered on a dedicated high-contrast sheet.
- Contains dynamic QR placeholder framed by an optical targeting reticle with corner brackets.
- Features real-time countdown timer badge (`Amber` countdown pill), bank identification mark (NAPAS 247 compliance indicators), and instant copy button for the exact transfer value formatted in `VND`.

### Live Transaction Ledger
- Dense row layouts (`36px` to `44px` height).
- Left-aligned timestamp (`body-sm`, `#94A3B8`) paired with SKU description (`label-md`, `#0F172A`).
- Right-aligned monospaced currency values (`tabular-stat`): `Emerald Green` (`+#...`) for completed inbound sales, muted slate for standard debits.

### Input Fields & Scanner Bars
- Height `44px`, background `#FFFFFF`, border `1px solid #CBD5E1`.
- Suffix icon dedicated to barcode/camera scan triggers.
- Inactive placeholder styled in `#94A3B8`. Focus creates a `2px` primary-blue border with an exterior `3px` aura (`rgba(37, 99, 235, 0.15)`).

### Inventory Badges
- **In Stock:** Background `#ECFDF5`, text `#059669`, border `1px solid #A7F3D0`. Includes a `6px` solid green dot.
- **Low Stock (<5):** Background `#FEF3C7`, text `#D97706`, border `1px solid #FDE68A`.
- **Out of Stock:** Background `#F1F5F9`, text `#64748B`, border `1px solid #E2E8F0`.