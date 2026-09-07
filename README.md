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
- [Menu Migration](https://www.drupal.org/project/menu_migration) — version-controls the main navigation menu, promoted dev → staging → production the same way configuration is
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

### 6. Import the main menu

```
ddev drush menu_migration:import main -y
```

`site:install --existing-config` only restores *configuration* — the main navigation menu's links are content, so without this step you'd only see Drupal's generic "Home" link. This replaces that with the real navigation from `config/menu_migration/main.json` (see "Updating the main menu" below).

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

## Updating the main menu

The main navigation menu's links are content (`menu_link_content`), not configuration, so `config:export`/`config:import` never touches them — they're version-controlled separately via [Menu Migration](https://www.drupal.org/project/menu_migration) instead:

- After changing the main menu (via the UI, on whichever environment is the source of truth for navigation), run:
  ```
  ddev drush menu_migration:export main
  ```
  This writes `config/menu_migration/main.json`. Commit that file along with your other changes.
- Importing (`drush menu_migration:import main`, run automatically on every deploy) **deletes the target menu's existing links first**, then recreates them from the committed file — the menu always ends up matching whatever was last exported and committed, the same way config import works.
