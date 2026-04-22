# Design System Specification: Editorial Korean Minimalism

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Breathing Monolith."** 

In Korean minimalism, the concept of *Maewol* (the beauty of emptiness) is paramount. This system is not merely "clean"; it is a disciplined exercise in structural rhythm. We move beyond the generic "tech portfolio" by treating the browser as a high-end gallery space. We break the "template" look through intentional asymmetry—placing oversized typography against vast, untouched negative space—and by replacing heavy structural lines with subtle shifts in light and tone. Every element must feel intentional, precise, and surgically placed.

## 2. Colors & Surface Logic
The palette is rooted in the "Zinc" spectrum to provide a tech-forward yet organic feel.

### The "No-Line" Rule
To achieve a premium editorial feel, **1px solid borders are prohibited for sectioning.** Conventional dividers create visual "noise" that traps the eye. Instead, define boundaries through:
*   **Background Shifts:** Transitioning from `surface` (#f9f9f9) to `surface-container-low` (#f3f3f3).
*   **Nesting:** A `surface-container-lowest` (#ffffff) card placed on a `surface` background provides all the definition needed without a single stroke.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, fine-paper sheets.
*   **Level 0 (Base):** `surface` (#f9f9f9) — The canvas.
*   **Level 1 (Sections):** `surface-container-low` (#f3f3f3) — Used for large structural blocks.
*   **Level 2 (Interactive):** `surface-container-lowest` (#ffffff) — Used for cards or floating elements to create a natural "pop."

### The "Glass & Gradient" Rule
For hero sections or primary CTAs, use the **Signature Glow**. Instead of flat `primary` (#006c49), use a subtle linear gradient from `primary` to `primary_container` (#10b981) at a 135-degree angle. For floating navigation, apply `surface-container-lowest` with a 20px backdrop-blur at 80% opacity to create a "frosted glass" effect.

## 3. Typography
The system employs a dual-typeface strategy to balance tech-precision with editorial authority.

*   **Display & Headlines (Manrope):** Use Manrope for all `display` and `headline` tokens. It provides a geometric, modern Korean-tech aesthetic. Headlines should be set with tight letter-spacing (-0.02em) to feel cohesive.
*   **Body & Labels (Inter):** Use Inter for all functional text. It is the workhorse of the system, offering unmatched clarity at small scales. 
*   **Scale Contrast:** To achieve an "Editorial" look, pair a `display-lg` headline (3.5rem) directly with a `label-md` (0.75rem) sub-headline. This extreme jump in scale signals high-end design intent.

## 4. Elevation & Depth
Traditional drop shadows are too "heavy" for this minimalist aesthetic. We communicate depth through **Tonal Layering.**

*   **The Layering Principle:** Depth is achieved by "stacking." A `surface-container-lowest` (#ffffff) element on top of `surface` (#f9f9f9) creates an implicit lift.
*   **Ambient Shadows:** If a floating element (like a modal) requires a shadow, it must be an "Ambient Shadow": `Y: 20px, Blur: 40px, Color: rgba(26, 28, 28, 0.04)`. It should look like a soft atmospheric glow, not a dark smudge.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility (e.g., in a search input), use a **Ghost Border**: `outline-variant` (#bbcabf) at 20% opacity. 

## 5. Components

### Buttons
*   **Primary:** High-contrast `primary` (#006c49) background with `on-primary` (#ffffff) text. Use `rounded-lg` (1rem).
*   **Secondary:** `surface-container-high` (#e8e8e8) background. No border.
*   **Tertiary:** Text-only using `primary` color, but with a `label-md` weight.

### Cards & Lists
*   **No Dividers:** Forbid the use of `divider` lines. Use vertical white space (32px or 48px) to separate items.
*   **Interaction:** On hover, a card should transition from `surface` to `surface-container-lowest` and scale by 1.01x. Do not add a shadow.

### Inputs
*   **Styling:** Use `surface-container-low` for the input field background.
*   **State:** On focus, transition the background to `surface-container-lowest` and apply a 1px "Ghost Border" using the `primary` (#006c49) color.

### Chips (Tech Tags)
*   Small, `rounded-full` (9999px) containers. Use `secondary-container` (#e3e1ec) with `on-secondary-container` (#63646c) text. Keep padding generous (horizontal: 12px, vertical: 4px).

## 6. Do's and Don'ts

### Do
*   **Embrace the Void:** Use 80px to 120px of vertical padding between major portfolio sections.
*   **Align to the Grid, but Break it:** Use a 12-column grid, but let images or pull-quotes bleed across 7 or 9 columns to create an asymmetric, custom feel.
*   **Use the Accent Sparingly:** `emerald-500` is for status and "Live" indicators only. It is a spark, not a bucket of paint.

### Don't
*   **No 100% Black:** Never use #000000. Always use `on-surface` (#1a1c1c) for text to maintain the "Zinc" softness.
*   **No "Boxy" Containers:** Avoid wrapping every piece of content in a bordered box. Let the content breathe on the background.
*   **No Standard Shadows:** Avoid the default CSS `box-shadow: 0 2px 4px...`. It ruins the minimalist precision. If you can't see the shadow at first glance, it's working.