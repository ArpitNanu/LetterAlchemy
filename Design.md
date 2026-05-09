---
name: LetterAlchemy
colors:
  surface: '#f4fafd'
  surface-dim: '#d4dbdd'
  surface-bright: '#f4fafd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef5f7'
  surface-container: '#e8eff1'
  surface-container-high: '#e2e9ec'
  surface-container-highest: '#dde4e6'
  on-surface: '#161d1f'
  on-surface-variant: '#434840'
  inverse-surface: '#2b3234'
  inverse-on-surface: '#ebf2f4'
  outline: '#73796f'
  outline-variant: '#c3c8bd'
  surface-tint: '#496640'
  primary: '#334f2b'
  on-primary: '#ffffff'
  primary-container: '#4a6741'
  on-primary-container: '#c2e4b4'
  inverse-primary: '#afd0a1'
  secondary: '#456273'
  on-secondary: '#ffffff'
  secondary-container: '#c5e4f8'
  on-secondary-container: '#496678'
  tertiary: '#564523'
  on-tertiary: '#ffffff'
  tertiary-container: '#6f5d38'
  on-tertiary-container: '#f0d7a9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#caecbc'
  primary-fixed-dim: '#afd0a1'
  on-primary-fixed: '#062104'
  on-primary-fixed-variant: '#324e2a'
  secondary-fixed: '#c8e7fb'
  secondary-fixed-dim: '#adcbdf'
  on-secondary-fixed: '#001e2c'
  on-secondary-fixed-variant: '#2d4a5b'
  tertiary-fixed: '#f9dfb1'
  tertiary-fixed-dim: '#dcc497'
  on-tertiary-fixed: '#261a00'
  on-tertiary-fixed-variant: '#554422'
  background: '#f4fafd'
  on-background: '#161d1f'
  surface-variant: '#dde4e6'
typography:
  h1:
    fontFamily: inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  h2:
    fontFamily: inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: newsreader
    fontSize: 21px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: newsreader
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  ui-label:
    fontFamily: inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.02em
  caption:
    fontFamily: inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-max: 720px
  gutter: 24px
  section-gap: 80px
  stack-sm: 4px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is anchored in the concept of "Digital Sanctuary." It prioritizes the cognitive comfort of the reader and the focus of the writer. By utilizing a high-end editorial aesthetic, this design system transforms the act of digital reading into a tactile-feeling experience reminiscent of high-quality velum paper.

The style is a blend of **Minimalism** and **Modern Editorial**. It rejects the aggressive brightness of standard web interfaces in favor of low-fatigue chromatic balances. Every element is designed to recede, allowing the written word to take center stage, evoking an emotional response of calm, professional authority and intellectual clarity.

## Colors

The palette is engineered for "long-form endurance." 

**Light Mode:** Uses a soft cream (`#FDFBF7`) base to reduce blue-light strain. Text is not pure black but a deep charcoal (`#2D3436`) to soften the contrast ratio.
**Dark Mode:** Utilizes a midnight navy-charcoal (`#1A1C23`) that avoids the "vibrating" effect of pure black backgrounds. 
**Accents:** The primary Forest Green and secondary Slate Blue are desaturated, used sparingly for call-to-actions, text highlights, or subtle UI indicators. This ensures that the interface never competes with the content for the user's attention.

## Typography

This design system employs a dual-font strategy to separate content from container.

- **The Serif (Newsreader):** Reserved strictly for the narrative. It features a larger x-height and optimized kerning for immersive reading. 
- **The Sans-Serif (Inter):** Used for all functional UI elements, navigation, and metadata. This creates a clear mental shift for the user between "navigating the app" and "reading the story."

Line heights are intentionally generous (1.6 for body) to provide vertical breathing room, preventing the "wall of text" effect often found in information-dense platforms.

## Layout & Spacing

This design system uses a **Fixed Reading Grid** centered on the screen. While the UI may expand to a fluid 12-column grid for dashboards, the "Article View" is restricted to a maximum width of 720px. This ensures optimal characters-per-line (CPL) for reading comfort.

The spacing rhythm is based on an 8px linear scale. Large vertical "Section Gaps" (80px+) are used to separate major thoughts or content blocks, reinforcing the calm, unhurried nature of the platform. Negative space is treated as a first-class design element, not "empty" space.

## Elevation & Depth

To maintain a "smooth" aesthetic, this design system avoids aggressive drop shadows. Instead, it utilizes **Tonal Layering** and **Low-Contrast Outlines**.

1.  **Base Layer:** The main canvas (Cream or Charcoal).
2.  **Surface Layer:** Cards or modals use a slightly lighter (in dark mode) or darker (in light mode) tint with a 1px border that is only 10% more saturated than the background.
3.  **Floating Elements:** Only high-priority modals or dropdowns receive a shadow—a "Soft Ambient" shadow: 0px 12px 32px with 4% opacity, tinted with the Primary color to maintain color harmony.

## Shapes

The shape language is **Soft (Level 1)**. 

Button corners and input fields utilize a 4px (0.25rem) radius. This provides a hint of approachability while maintaining a sharp, professional editorial edge. Larger components like cards or featured image containers may use an 8px (0.5rem) radius. The goal is to avoid the "bubbly" look of consumer social apps, leaning instead toward the geometry of a physical magazine.

## Components

- **Buttons:** Primary buttons use a solid muted Forest Green with Inter Medium white/cream text. Secondary buttons are "Ghost" style with a 1px Slate Blue border.
- **Input Fields:** Minimalist design with only a bottom border that thickens by 1px on focus. No heavy boxing.
- **Cards:** Borderless by default. They use a subtle background tint change on hover to indicate interactivity.
- **Reading Progress:** A very thin (2px) Slate Blue bar at the top of the viewport that tracks scroll depth without obscuring any content.
- **Chips/Tags:** Small, Inter-font labels with a low-opacity Slate Blue background and 4px radius, used for categorizing posts without distracting from the title.
- **Selection UI:** Text highlighting (selection) should use a semi-transparent Slate Blue, ensuring the underlying serif text remains perfectly legible.