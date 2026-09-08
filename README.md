# Dublin 2029

Website and convention registration system for the Dublin 2029 Worldcon bid, built on Drupal 11.

## About

This site handles registration and support for the Dublin 2029 Worldcon bid — supporter tiers (Attending, Supporter, and others), payment processing via Stripe, and email communications via MailerLite. The supporter form itself is powered by [ConReg](https://www.drupal.org/project/conreg), a Drupal module for convention registration.

The site uses a custom theme, `dublin2029_drupal_theme`, built on [`registration_theme`](https://www.drupal.org/project/registration_theme) — a general-purpose base theme for ConReg-powered convention/event registration sites, also maintained by this project and freely usable by other conventions.

## Tech stack

- Drupal 11, managed with Composer
- [ConReg](https://www.drupal.org/project/conreg) — convention registration forms, member types, badges
- [Key](https://www.drupal.org/project/key) — secure storage of Stripe/MailerLite API credentials (file-based, kept outside the web root and never committed to this repo)
- [Config Split](https://www.drupal.org/project/config_split) — per-environment configuration overrides (local/staging)
- [Environment Indicator](https://www.drupal.org/project/environment_indicator) — visual banner identifying which environment you're viewing
- `recipes/dublin2029_default_content` — a Drupal core [recipe](https://www.drupal.org/docs/extending-drupal/drupal-recipes) (built-in as of Drupal 11.3, no contrib module needed) that seeds the main navigation menu, URL aliases, and homepage content blocks (all content, not configuration)
- Site configuration is version-controlled under `config/sync/` and managed via `drush config:export`/`config:import`

Deployment to staging and production is handled by a separate `infrastructure-ansible` repository — not part of this one.

## Local development

Local development uses [DDEV](https://ddev.com/).

### 1. Prerequisite

Install DDEV following [the official installation guide](https://docs.ddev.com/en/stable/users/install/ddev-installation/). Everything below assumes `ddev` works from a terminal.

### 2. Fetch the repo

```
git clone https://github.com/dublin-2029/dublin2029_drupal.git
cd dublin2029_drupal
```

`.ddev/config.yaml` is already committed, so there's no need to run `ddev config` manually.

### 3. Start DDEV

```
ddev start
```

### 4. Install dependencies

```
ddev composer install
```

### 5. Initial site setup and config import

```
ddev drush site:install --existing-config -y
```

This builds the database directly from the exported configuration in `config/sync/`, combining first-time install and config import into one step. Database credentials and the hash salt are supplied automatically by DDEV's own generated settings — there's nothing to configure manually for a basic local copy.

### 6. Seed the main menu, aliases, and content blocks

```
ddev drush recipe:apply ../recipes/dublin2029_default_content -y
```

This is content, not configuration, so `site:install --existing-config` doesn't restore it — see "Seeded content" below for why, and what to do if it ever needs updating. Safe to run more than once (e.g. if you re-run this against a copy that already has the content) — see that section for why.

### 7. (Optional) Local environment settings

Create `web/sites/default/settings.local.php` (already gitignored) to show a "LOCAL" environment banner and/or activate the `local` Config Split:

```php
<?php
$config['environment_indicator.indicator']['name'] = 'LOCAL';
$config['environment_indicator.indicator']['bg_color'] = '#4CAF50';
$config['environment_indicator.indicator']['fg_color'] = '#000000';
// $config['config_split.config_split.local']['status'] = TRUE;
```

### 8. Log in as admin

```
ddev drush uli
```

This prints a one-time login link that signs you straight in as the admin account — no password to set or remember for a local copy.

### 9. Open the site

```
ddev launch
```

## Seeded content

The main navigation menu's links, the site's URL aliases, and its homepage content blocks are all **content** (`menu_link_content`, `path_alias`, `block_content` respectively), not configuration — so `config:export`/`config:import` never touches them. Without a separate mechanism, a fresh install would only show Drupal's generic "Home" link and no navigation/aliases/blocks at all.

These 12 items are seeded via `recipes/dublin2029_default_content` — a Drupal core recipe (Drupal 11.3+; no contrib module required) with a `content/` directory of exported YAML files, applied via `drush recipe:apply`. Unlike a plain content-import, recipe application matches content by UUID and **skips anything that already exists** rather than creating a duplicate or erroring — confirmed by testing it against this dev site's own already-seeded database, where re-applying left all three entity counts unchanged. That makes it safe to include in the Ansible deploy pipeline unconditionally, on every deploy, with no first-install/redeploy branching needed.

The trade-off of "skip" as the safety behaviour: re-applying the recipe **never updates** already-existing content either. So this is still, deliberately, a **one-time seed** — on the basis that this content changes rarely. If you need to update it — e.g. after editing the menu, an alias, or a block on whichever environment is the source of truth — re-export and commit:

```
ddev drush content:export menu_link_content <id> --dir=../recipes/dublin2029_default_content/content
```

(repeat per entity, or per entity type with `--bundle`/`--with-dependencies` — see `ddev drush content:export --help`). If updates become frequent enough that "skip" stops being good enough — e.g. you need already-provisioned staging/production to actually pick up a content change, not just skip past it — that's worth revisiting with a proper promotion mechanism at that point, rather than assumed to work today.
