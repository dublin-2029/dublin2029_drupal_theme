# Dublin 2029 theme

Custom Drupal theme for the Dublin 2029 Worldcon bid site, built to match
the branding of the bid's WordPress site (https://dublin2029.ie).

Machine name: `dublin2029_drupal_theme` (deliberately including `_drupal_`,
rather than the more obvious `dublin2029_theme`, since the organisation's
GitHub also hosts WordPress projects for the same bid - a bare
`dublin2029_theme` name reads ambiguously as either).

## A subtheme of Registration Theme

This theme's `base theme` is `registration_theme`
(`web/themes/custom/registration_theme`), the general-purpose theme this
one was originally forked from. Being a subtheme means:

- **Templates** fall back to Registration Theme's copy automatically for
  any file this theme doesn't have its own version of - no declaration
  needed, Drupal's template discovery just works down the base-theme
  chain by filename.
- **Libraries do not merge or inherit selectively** - Registration
  Theme's own `libraries:` (tokens, typography/base.css, header, footer,
  buttons, content-tables, register-form, the generic Starterkit-default
  component CSS bundle, messages, etc.) are all inherited automatically,
  but replacing one of them with this theme's own version requires an
  explicit `libraries-override` entry in `dublin2029_drupal_theme.info.yml`
  (see below) - just declaring a same-named library in this theme's own
  `.libraries.yml` would load *both*, not swap one for the other.
- **Regions do not inherit** - this theme's `.info.yml` still declares its
  own complete `regions:` list regardless of what Registration Theme
  declares.

### What this theme keeps as its own (overrides Registration Theme's version)

Kept because these are genuinely different from Registration Theme, not
stale duplicates:

- **`templates/layout/page.html.twig`** - the `hero` region, front-page
  promotional content, and floating/overlay masthead have no equivalent in
  Registration Theme (which uses a simpler banner-image backdrop and no
  hero region at all).
- **`templates/layout/html.html.twig`** - the extra hardcoded 32x32/
  192x192/apple-touch-icon `<link>` tags (see "Favicon" below).
- **`templates/block/block--system-branding-block.html.twig`** - hides the
  site name/slogan so only the logo shows (this site's deliberate
  WordPress-matching choice; Registration Theme shows them by default).
- **`templates/form/member-type-card.html.twig`** - adds the Dublin 2029
  logo icon beside each member-type card (see "Member type cards" below).
- **CSS, via `libraries-override`** in `dublin2029_drupal_theme.info.yml`:
  `header` (`css/components/header.css` + `site-nav.css` +
  `js/sticky-header.js` - the hero-aware masthead/nav/sticky logic), `footer`
  (`css/components/footer.css`), `buttons` (`css/components/button-colors.css`).
- **`css/components/hero.css`** and **`js/sticky-header.js`** - no
  equivalent in Registration Theme at all, so these are additions, not
  overrides.
- **`css/base/fonts.css`** - self-hosted `@font-face` rules (unchanged),
  plus this theme's hook into Registration Theme's font extension point
  (see "Fonts" below).
- **`css/components/member-type-card-icon.css`** - just the handful of
  rules for the logo-icon layout, loaded *alongside* (not replacing)
  Registration Theme's `register-form.css` - see "Member type cards"
  below.

### What this theme drops (inherits from Registration Theme instead)

- All of the generic, unmodified Starterkit/core-default CSS and templates
  (`action-links.css`, `dialog.css`, `messages.css`, `tabs.css`, and ~85
  template files, plus `images/icons/*` and `src/Hook/`'s one unmodified
  `hook_preprocess_image_widget()` fix) - these are byte-for-byte the same
  as Registration Theme's own copies, so there's nothing this theme needs
  to duplicate.
- **`css/components/content-tables.css`** and **`css/components/register-form.css`**
  (except the member-type-card icon rules, extracted into their own small
  library) - this is the actual point of the subtheme relationship: this
  site's ConReg tables and registration form now get every fix made to
  Registration Theme's shared versions automatically (role-based table
  styling instead of guessing from page position, real `<tfoot>` totals,
  the email-validity-indicator layout, off-white row striping, etc.) -
  see Registration Theme's own README for details on how those work.

## Colours

Colours are Registration Theme's 3 admin-configurable tokens
(`--rt-primary`, `--rt-neutral`, `--rt-header`, plus a computed
`color-mix()` ramp for every tint/shade/hover-state), set to this site's
own brand hex values via `config/install/dublin2029_drupal_theme.settings.yml`
rather than a separate token system:

| Token | Hex | Mapped from (old, pre-subtheme) |
|---|---|---|
| `--rt-primary` | `#215bc2` | was `--d29-button` |
| `--rt-neutral` | `#344b64` | was `--d29-contrast-3` (body text) |
| `--rt-header` | `#1c3145` | was `--d29-contrast-2` (header/nav bg) |

**Known limitation**: a single-hue computed ramp can't exactly reproduce
this theme's original palette, which genuinely used more than one hue (the
old link colour `#003087` and accent/hover colour `#0085ca` were different
hues, not tints of one another). The most visible resulting difference:
the footer/table-header background is now a computed neutral shade
(~`#16202c`) rather than reusing the header's own colour directly, since
`--rt-header` is reserved specifically for the masthead/banner role.
Adjust `config/install/dublin2029_drupal_theme.settings.yml` (and
re-apply with `drush config-set`, since it won't retroactively apply to an
already-installed theme) if this reads poorly in practice.

The old accent colour (`#0085ca`, used for the hero "(Welcome)" text, the
footer bullets/links/social icons, and active/hover nav links) was
originally *lighter* than the button/primary colour, not darker - so these
were initially, incorrectly mapped onto `--rt-primary-600` (a *darkening*
mix toward black), which moved them further from the original, not
closer. `color-mix()` can't rotate hue - none of the 3 base tokens carry
any cyan, so mixing among them or toward black/white can't reach `#0085ca`
exactly - and the maths work out so that mixing `--rt-primary` toward
white doesn't help either (the target's zero red channel is unreachable
either way, and lightening only pushes red further from zero). The
closest achievable approximation turned out to be the plain, unmixed
`--rt-primary`/`--rt-primary-500` (`#215bc2`) itself, used now instead of
`--rt-primary-600` in `hero.css`, `footer.css`, and `site-nav.css`.

Note: Registration Theme's settings form also includes a banner image
path/position field (inherited automatically, since theme-settings hooks
fire through the whole active theme's base chain) - these have no visible
effect here, since this theme uses its own `hero` region instead of
Registration Theme's banner-image mechanism.

## Fonts

`css/base/fonts.css` keeps its self-hosted `@font-face` rules
(Libre Baskerville, Noto Sans, Archivo - unchanged), and sets
`--rt-font-body`/`--rt-font-heading` in a `:root` block - Registration
Theme's own extension point for exactly this, referenced throughout its
`base.css` (inherited here, not duplicated) instead of hardcoded font
names:

- **Libre Baskerville** - headings (`--rt-font-heading`)
- **Noto Sans** - body text, buttons, form fields (`--rt-font-body`)
- **Archivo** (400/700) - only the large front-page hero headline
  (`.site-hero--home h1`), referenced directly in `hero.css`, not through
  the shared font tokens (Registration Theme has no hero-specific styling
  to share this with)

**Gotcha**: `fonts.css`'s `:root { --rt-font-body: ...; }` override only
wins the cascade if it loads *after* `registration_theme/tokens`'s own
`:root` default for that same property - last declaration wins, same
specificity. Drupal's computed CSS weight doesn't reliably guarantee that
ordering on its own (it was initially computed the wrong way round here,
silently reverting this theme to the default system font stack), so the
`fonts` library in `dublin2029_drupal_theme.libraries.yml` explicitly
depends on `registration_theme/tokens` to force the correct order. Any
other file that overrides a token also set in the base theme's
`tokens.css` needs the same explicit dependency.

## Directory structure

```
css/
  base/        fonts.css only (base.css/tokens.css are inherited)
  components/  header.css, site-nav.css, footer.css, hero.css,
               button-colors.css, member-type-card-icon.css - everything
               else is inherited from Registration Theme
fonts/         Self-hosted webfonts (woff2) - no Google Fonts/CDN requests
images/
  favicons/    PNG favicons (32x32, 192x192, apple-touch-icon)
  hero/        Hero banner background photo
  logo/        Site logo (logo.png, used via the branding block) and the
               standalone logo mark (logo_icon.svg, used on member-type cards)
js/
  sticky-header.js   Hero-aware mini-header scroll behaviour + mobile nav panel
templates/     Only the 4 templates listed above - everything else is
               inherited from Registration Theme
favicon.ico    Theme's default favicon (see "Favicon" below)
logo.svg       Starterkit placeholder, not used - the branding block uses
               images/logo/logo.png
```

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

This is deliberately kept separate from Registration Theme's own
header/sticky logic (a banner-backdrop-height-sync system, with no hero or
overlay concept) - the two solve genuinely different problems, and merging
them would be real risk for no benefit.

### Admin toolbar interaction

This site uses Drupal core's **Navigation** module (the left sidebar admin
UI), not the classic Toolbar module. Two things in the CSS specifically
work around it:

1. `.layout-container { position: relative; }` (inherited from
   Registration Theme's `base.css`) gives the transparent overlay header a
   positioning context that starts where the page content actually
   begins, rather than the very top of the document - otherwise it
   renders underneath the Navigation module's in-flow control bar for
   logged-in users.
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

## Content tables and registration form

Inherited entirely from Registration Theme (`css/components/content-tables.css`,
`css/components/register-form.css`) - see that theme's own README for how
ConReg's table role classes (`conreg-table--list`/`--summary`), section
wrappers, and `<tfoot>` totals work. This is the main reason this theme is
now a subtheme: every fix to that shared styling applies here
automatically.

One small override on top: `css/components/content-tables-extra.css`
restores mixed-case, slightly larger `.conreg-table-section` headings
(Member List/Member Summary pages' "Summary by member type" etc.) instead
of Registration Theme's small-caps caption style, which reads fine in its
sans-serif system font but not well in this theme's serif heading font
(Libre Baskerville) at that size/case. Loaded via the `content-tables-extra`
library (`dublin2029_drupal_theme.libraries.yml`), with an explicit
dependency on `registration_theme/content-tables` to guarantee it loads
after the rule it overrides - see the same load-order note in "Fonts"
above.

### Member type cards (ConReg)

`templates/form/member-type-card.html.twig` is a copy of ConReg module's
own template (`modules/contrib/conreg/templates/member-type-card.html.twig`),
customised to add a `.member-type-card__icon` (the theme's `logo_icon.svg`)
in a flex row beside the card content. If ConReg changes this template
upstream, diff against the module's copy and re-apply the icon markup.

`css/components/member-type-card-icon.css` styles just that icon layout
(`.member-type-card__main`/`__icon`/`__content`) - the cards' *colours*
come from Registration Theme's inherited `register-form.css`, which maps
ConReg's own `--member-type-card-*` custom properties to the shared
`--rt-*` tokens, so they already resolve to this site's brand colours with
no override needed here.

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

## JavaScript

`js/sticky-header.js` (`Drupal.behaviors.dublin2029StickyHeader`) handles:

1. The `IntersectionObserver` that toggles `.is-stuck` on the masthead,
   with the sentinel positioned at the masthead's own height so switching
   happens once the logo/nav row (not the whole hero image) scrolls out
   of view.
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

**Maintenance note**: as a subtheme, this theme now inherits several of
Registration Theme's shared files directly (`content-tables.css`,
`register-form.css`, `base.css`, `tokens.css`, the generic Starterkit
component CSS, and ~85 template files). Any future change to those files
in Registration Theme should be spot-checked against this site's live
pages - there's no way to eliminate that step, only to remember it's now
a standing part of changing Registration Theme's shared code.
