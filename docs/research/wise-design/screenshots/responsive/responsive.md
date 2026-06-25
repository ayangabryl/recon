# Responsive design — https://wise.design

Captured: 2026-06-25T12:01:58.521Z

## Strategy
Carousel: horizontal (desktop) → vertical (mobile); Toggle: visible desktop, hidden mobile; Figma: separate breakpoint trees in HTML — not CSS-only reflow

## Viewports

| Viewport | Screenshot | Carousel | Toggle | Cards visible |
|----------|------------|----------|--------|---------------|
| mobile-375 (375×812) | `mobile-375-viewport.png` | vertical | no | 5 |
| tablet-800 (800×600) | `tablet-800-viewport.png` | horizontal | yes | 5 |
| desktop-1920 (1920×1080) | `desktop-1920-viewport.png` | horizontal | yes | 12 |

## Per-viewport notes

### mobile (mobile-375)
- Figma breakpoint: `node-537_18296` (design width 375)
- Carousel axis: **vertical**
- Sample card sizes: 124×70, 124×124, 124×93, 124×124
- Logo: 40×40 at (16, 18)

### tablet (tablet-800)
- Figma breakpoint: `node-537_18253` (design width 800)
- Carousel axis: **horizontal**
- Sample card sizes: 213×120, 120×120, 160×120, 120×120

### desktop (desktop-1920)
- Figma breakpoint: `node-537_18253` (design width 800)
- Carousel axis: **horizontal**
- Sample card sizes: 213×120, 120×120, 160×120, 120×120

## Build rule
Do not ship desktop-only clone. Implement mobile layout or document `Skip: mobile` with reason.