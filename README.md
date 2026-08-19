# Dublin 2029 theme

Custom Drupal theme for the Dublin 2029 Worldcon bid site, generated from
core's `starterkit_theme` and built to match the branding of the bid's
WordPress site (https://dublin2029.ie).

Additional information on generating themes from Starterkit can be found in
the [Starterkit documentation](https://www.drupal.org/docs/core-modules-and-themes/core-themes/starterkit-theme).

## Directory structure

```
css/
  base/        Design tokens, self-hosted @font-face rules, global typography/layout
  components/  One file per component, loaded as separate libraries (see below)
fonts/         Self-hosted webfonts (woff2) - no Google Fonts/CDN requests
images/
  favicons/    PNG favicons (32x32, 192x192, apple-touch-icon)
  hero/        Hero banner background photo
  icons/       Starterkit's default file-type icons (unmodified)
  logo/        Site logo (logo.png, used via the branding block) and the
               standalone logo mark (logo_icon.svg, used on member-type cards)
js/
  sticky-header.js   Mini-header scroll behaviour + mobile nav panel
src/Hook/      PHP hook implementations (Starterkit default only, unmodified)
templates/     Twig template overrides (mostly Starterkit defaults - see
               "Customised templates" below for the ones actually changed)
favicon.ico    Theme's default favicon (see "Favicon" below)
logo.svg       Theme's default logo (Starterkit placeholder, not used - the
               branding block is configured to use images/logo/logo.png)
```

## Design tokens

All brand colours live as CSS custom properties in `css/base/tokens.css`,
pulled from the live WordPress site:

| Token | Hex | Used for |
|---|---|---|
| `--d29-contrast` | `#09162a` | Darkest navy - hero overlay, "Total" row, card price accents |
| `--d29-contrast-2` | `#1c3145` | Nav bar / sticky header / footer background |
| `--d29-contrast-3` | `#344b64` | Body text, subtle headings |
| `--d29-contrast-4` | `#ced3d3` | Borders (cards, table cells, form fields) |
| `--d29-base` | `#003087` | Default link colour |
| `--d29-base-2` | `#00ab84` | (from WP palette; not currently used) |
| `--d29-base-3` | `#f4f8fa` | Light grey section backgrounds |
| `--d29-base-4` | `#ffffff` | White |
| `--d29-accent` | `#0085ca` | Active nav link, hover states, hero accent text |
| `--d29-button` / `--d29-button-hover` | `#215bc2` / `#1a4a9b` | All `.button`/submit-button backgrounds |

Fonts (also self-hosted, see `css/base/fonts.css`):

- **Libre Baskerville** - all headings (`h1`-`h6`) by default
- **Noto Sans** - body text, buttons, form fields
- **Archivo** (400/700) - only the large front-page hero headline
  (`.site-hero--home h1`), matching the WordPress homepage

To retarget the theme at a different brand, start by editing
`tokens.css` and `fonts.css` - most components reference the tokens rather
than hardcoded colours.

## Regions and block layout

Region | Purpose
---|---
`header` | Site branding block (logo). Name/slogan render but are visually hidden (see `templates/block/block--system-branding-block.html.twig`) - only the logo image is visible, matching the WordPress header.
`primary_menu` | Main navigation menu
`hero` | Rendered as a full-width photo banner below the nav (see "Hero banner" below)
`footer_brand`, `footer_pages`, `footer_policies`, `footer_social`, `footer_bottom` | The four footer columns plus the copyright bar
`content` | Main page content (unmodified Drupal region)

### Hero banner

The `hero` region is designed to always have something in it, on every page:

- On the **front page**, a custom "Hero banner content" block (a Basic
  block, visibility restricted to `<front>`) supplies the eyebrow text,
  headline, dates and intro copy - this is real content, edit it via
  **Content → Blocks**, not by editing the theme.
- On **every other page**, core's "Page title" block is placed in this
  region instead (moved out of `content`, visibility set to *all pages
  except the front page*), so the hero shows the page title. This is what
  keeps the title from appearing twice.

`page.html.twig` adds a `site-hero--home` modifier class only on the front
page, which is what switches between the two visual treatments in
`css/components/hero.css` (large sans-serif headline vs. a plain centred
page title).

## Header / navigation

`css/components/header.css` + `css/components/site-nav.css` + `js/sticky-header.js`.

- The header (`.site-masthead`) is transparent and floats over the hero
  image (`.site-masthead--overlay`) at the top of every page.
- Once the user scrolls past the header's own height (not the whole hero
  image), an `IntersectionObserver` on a sentinel element
  (`[data-sticky-sentinel]`, positioned via JS at the masthead's height)
  adds `.is-stuck`, which switches the header to a solid, fixed "mini
  header" - the logo also shrinks to 175px wide in this state.
- Below **1200px** width (matching the WordPress breakpoint) the nav
  collapses to a "Menu" button that slides a full-height panel in from the
  **left**, with a backdrop and close button. See "Admin toolbar
  interaction" below for why some of this is more involved than it looks.

### Admin toolbar interaction

This site uses Drupal core's **Navigation** module (the left sidebar admin
UI), not the classic Toolbar module. Two things in the CSS specifically
work around it:

1. `.layout-container { position: relative; }` (`css/base/base.css`) gives
   the transparent overlay header a positioning context that starts where
   the page content actually begins, rather than the very top of the
   document - otherwise it renders underneath the Navigation module's
   in-flow control bar for logged-in users.
2. The mobile nav panel's `left` offset uses
   `var(--drupal-displace-offset-left, 0px)` so it starts at the edge of
   the admin sidebar (when it's present and persistent, ≥1024px) instead of
   sliding out from underneath it. `--drupal-displace-offset-top` is also
   referenced for the header/panel `top` position, as defence-in-depth in
   case this ever runs with the classic Toolbar module instead, though the
   Navigation module doesn't set that particular property.

## Footer

`css/components/footer.css`. Four columns (brand blurb, Pages menu,
Policies menu, social icons) plus a centred copyright bar. Social icons are
inline SVGs (added directly to the "Footer social links" block content, not
an icon font) so no external requests are made.

## Content tables

`css/components/content-tables.css` styles **any** `table.responsive-enabled`
Drupal renders into the `content` region - it doesn't assume a specific
number of columns, so it's meant to be reused wherever a module (e.g.
ConReg's supporter list) prints a plain data table:

- The **first** table on a page is treated as the primary focus: capped at
  75% width, centred, with striped rows.
- A `<h2>` that has a table somewhere after it in the flow (checked with
  `:has(~ table.responsive-enabled)`, since Drupal's responsive-table JS
  inserts a column-toggle button between the two) is treated as a caption
  for a secondary/summary table: the heading is demoted to a small
  uppercase label, and that table is capped at 50% width with its **last
  row** styled as a standout total/summary row.

## Registration form

`css/components/register-form.css`, scoped entirely to `#regform` (the
wrapper ConReg's registration form renders inside), so none of it leaks
into other forms on the site:

- Full-bleed light-grey section (negative-margin technique - see the
  `html`/`body` `overflow-x: hidden` in `base.css`, added specifically to
  stop this causing a scrollbar-width horizontal overflow).
- Each **top-level fieldset** ("How many members?", each "Member N", "Total
  price") is a single white card. Fieldsets *nested inside* those (e.g. the
  badge-name radio group) are deliberately left unboxed. Legends are pulled
  fully inside the card (`display: table; float: left; width: 100%` on
  `legend`, cleared via `legend + *`/`legend ~ *`) rather than straddling
  the card's top border, which is the native `<fieldset>`/`<legend>`
  rendering.
- Given/family name share a row on wide screens and stack full-width on
  narrow ones, using `flex-wrap` with a `340px` basis - no media query
  needed.
- Radio/checkbox **options** (including bespoke ones that aren't wrapped in
  Drupal's standard `.form-radios`/`.form-checkboxes` container, e.g. a
  "Join our mailing lists" checkbox group) are detected generically via
  `:has(> label.option)` so the label always sits next to its input.

### Member type cards (ConReg)

`templates/form/member-type-card.html.twig` is a copy of ConReg module's
own template (`modules/contrib/conreg/templates/member-type-card.html.twig`),
customised to add a `.member-type-card__icon` (the theme's `logo_icon.svg`)
in a flex row beside the card content. If ConReg changes this template
upstream, diff against the module's copy and re-apply the icon markup.

The cards' colours are set by overriding the CSS custom properties the
module itself exposes (`--member-type-card-*`) with the theme's tokens,
rather than fighting individual declarations - if the module adds more
`--member-type-card-*` variables later, prefer mapping those too over
adding new overrides.

## Favicon

Drupal's convention (the same one used for `logo.svg`) is to look for a
file literally named `favicon.ico` at the theme root and use it
automatically when the theme's "Use the favicon supplied by the theme"
setting is enabled (the default) - no info.yml key or settings.yml needed.
`favicon.ico` here is a multi-resolution icon (16/32/48/64px) generated
from the WordPress site's icon.

`html.html.twig` additionally hardcodes `<link>` tags for a 32x32 and
192x192 PNG and an apple-touch-icon, for higher-DPI displays and iOS
home-screen icons, which `favicon.ico` alone doesn't cover. These use
`/{{ directory }}/...` rather than `{{ base_path ~ directory }}` -
`base_path` is **not** an available variable in `html.html.twig` (only in
`page.html.twig`), so the original pattern silently produced a relative
path that only happened to work on the front page.

## Customised templates

Most of `templates/` is the unmodified Starterkit scaffold. The ones
actually changed for this theme:

- `templates/layout/page.html.twig` - the whole header/hero/footer
  structure described above
- `templates/layout/html.html.twig` - favicon `<link>` tags
- `templates/block/block--system-branding-block.html.twig` - adds
  `visually-hidden` to the site name/slogan so only the logo is visible
- `templates/form/member-type-card.html.twig` - see above (copied from
  ConReg, not a Starterkit default)

## JavaScript

`js/sticky-header.js` (`Drupal.behaviors.dublin2029StickyHeader`) handles:

1. The `IntersectionObserver` that toggles `.is-stuck` on the masthead.
2. Opening/closing the mobile nav panel (button, close button, backdrop
   click, and <kbd>Escape</kbd>), toggling `body.nav-open` to lock
   background scroll while it's open.

No other custom JavaScript exists in the theme.

## Working locally

This is a DDEV project. From the repo root:

```
ddev start
ddev drush cr          # after any .info.yml/.libraries.yml/template change
```

CSS/JS is *not* aggregated in most local dev configurations, but if you
don't see a change reflected, clear the cache and hard-refresh - Drupal
fingerprints aggregated asset URLs by content hash, so a stale browser
cache is rarely the cause once `drush cr` has run.
