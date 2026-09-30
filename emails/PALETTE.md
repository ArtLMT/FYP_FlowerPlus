# FlowerPlus — Email Palette

Same brand as the web app, but email clients don't support CSS variables,
`oklch()`, or Tailwind. **Every colour must be a literal 6-digit hex, inline.**
Copy the hex, not the token name.

## Core palette

| Role | Hex | Use it for |
|---|---|---|
| Canvas | `#FDF6F4` | Outer body background (the area around the 600px card) |
| Surface | `#F9EEE9` | Inner panels: order summary box, info callouts |
| Raised | `#F4E3DC` | Footer background, table header rows |
| Border | `#E8D0C9` | All `1px` rules, dividers, table cell borders |
| Card | `#FFFFFF` | The 600px content card |
| Primary | `#C26B60` | Wordmark, large accents, decorative rules |
| Primary deep | `#92453C` | **Links, prices, small coloured text** (contrast-safe) |
| Button | `#A8564C` | CTA button background (white text passes AA) |
| Secondary | `#D9A89A` | Soft dividers, badge backgrounds |
| Tertiary | `#EED5CC` | Badge / pill backgrounds, subtle fills |
| Sage | `#7A8C72` | Success states ("Đã xác nhận", delivered) |
| Sage light | `#C8D4C2` | Success badge background |

## Text

| Role | Hex | Use it for |
|---|---|---|
| Primary | `#2E1A16` | Headings, product names, totals |
| Secondary | `#6B4039` | Body copy, labels, fine print |
| Muted | `#9C6B62` | Decorative only — **≥18px**, or use `#6B4039` instead |
| On primary | `#FFFFFF` | Text on the button |

### Contrast notes (measured, on `#FFFFFF`/`#FDF6F4`)

- `#92453C` → 6.3:1 ✅ safe for any text size. Use this for links and prices.
- `#C26B60` → 3.8:1 ⚠️ large/bold text only. Never for 13–15px body copy.
- `#A8564C` as button bg with white text → 5.1:1 ✅. This is why the button
  uses the hover colour, not `#C26B60`.
- `#9C6B62` → 4.2:1 ❌ fails AA at body size. Downgrade to `#6B4039`.

## Type

The web fonts (EB Garamond / Karla) don't load reliably in Outlook, Gmail
desktop, or Apple Mail without webfont support. Use stacks that degrade cleanly:

```
Headings / wordmark:  'EB Garamond', Garamond, Georgia, 'Times New Roman', serif
Body / UI:            'Karla', Helvetica, Arial, sans-serif
```

Sizes that survive client rescaling (Gmail bumps anything under 13px on mobile):

| Token | px | Email use |
|---|---|---|
| display | 28 | One hero line per email (40px is too big at 600px width) |
| heading-md | 22 | Section titles |
| heading-sm | 18 | Product names, totals |
| body-lg | 16 | Lead paragraph |
| body | 15 | Standard copy |
| body-sm | 13 | Table cells, meta — **floor for body text** |
| label | 11 | Footer legal, badge caps only (`letter-spacing: 0.1em`) |

## Layout constants

- Card width `600px`, mobile fallback `width="100%"`
- Outer padding `24px` mobile / `40px` desktop
- Section rhythm `32px` between blocks, `48px` before the footer
- Border radius `12px` on cards, `999px` on buttons (Outlook renders both square — acceptable)

## Client rules

1. Layout with `<table role="presentation" cellpadding="0" cellspacing="0" border="0">`. No flexbox, no grid.
2. All styles inline. The `<style>` block is only for `@media` and dark-mode overrides — Gmail strips a lot of it, so it must never carry layout-critical rules.
3. Set `bgcolor` **and** `style="background-color:…"` on coloured cells; Outlook ignores one or the other depending on version.
4. Images: always `width`, `height`, `alt`, and `display:block`. Assume they're blocked — the email must read correctly with zero images.
5. Add `<meta name="color-scheme" content="light only">` + `<meta name="supported-color-schemes" content="light only">`, otherwise iOS/Outlook dark mode inverts the warm neutrals into muddy browns.
