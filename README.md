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

### 7. Set up Stripe and MailerLite API keys

Stripe and MailerLite credentials are stored as plain files in the project root (never committed — already covered by `.gitignore`'s `*.key` pattern), read by the Key module. Where they'll live on staging/production is still being finalised; locally, the project root keeps things simple:

- **Stripe**: sign up for a Stripe account if you don't have one, and use its **test mode** keys (never live) — see [What are Stripe API keys and how to find them](https://support.stripe.com/questions/what-are-stripe-api-keys-and-how-to-find-them). Copy them into:
  - `stripe-secret.key` — the secret key (`sk_test_...`)
  - `stripe-public.key` — the publishable key (`pk_test_...`)
- **MailerLite**: sign up for an account, then generate an API token — see [MailerLite API key, Group ID, and documentation](https://www.mailerlite.com/help/where-to-find-the-mailerlite-api-key-groupid-and-documentation). Copy it into:
  - `mailerlite.key`

Each file should contain just the key value, nothing else.

### 8. (Optional) Local environment settings

Create `web/sites/default/settings.local.php` (already gitignored) to show a "LOCAL" environment banner and/or activate the `local` Config Split:

```php
<?php
$config['environment_indicator.indicator']['name'] = 'LOCAL';
$config['environment_indicator.indicator']['bg_color'] = '#4CAF50';
$config['environment_indicator.indicator']['fg_color'] = '#000000';
// $config['config_split.config_split.local']['status'] = TRUE;
```

### 9. Log in as admin

```
ddev drush uli
```

This prints a one-time login link that signs you straight in as the admin account — no password to set or remember for a local copy.

### 10. Open the site

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

## Developing ConReg locally

To work on [ConReg](https://www.drupal.org/project/conreg) itself, rather than just consuming the published release:

1. Clone it into the project root (gitignored, outside this repo's own history):
   ```
   git clone https://git.drupalcode.org/project/conreg.git modules/conreg
   ```
2. Create `composer.local.json` at the project root if it doesn't already exist (gitignored, local-only), and add a `path` repository for it:
   ```json
   {
       "repositories": [
           {
               "type": "path",
               "url": "modules/conreg",
               "options": { "symlink": true }
           }
       ],
       "require": {
           "drupal/conreg": "1.0.x-dev"
       }
   }
   ```
   Match the `require` version to whatever branch you're actually on — Composer infers a `dev-` stability version from the branch name, which the real, committed requirement (`^1@beta`) wouldn't accept on its own. This local override takes precedence via the `merge-plugin`/`replace: true` setting already in the main `composer.json`.
3. If the checkout doesn't already have its own `composer.json` declaring `"name": "drupal/conreg"` and `"type": "drupal-module"`, add one locally (uncommitted) — Composer's path-repository resolution needs it to recognize the checkout as an installable package.
4. Run `composer update drupal/conreg` — this symlinks `web/modules/contrib/conreg` to your local checkout.

**Before committing `composer.lock`**: temporarily move `composer.local.json` aside and re-run `composer update drupal/conreg`, to confirm the lock file resolves to the real published package (a proper `git`/`zip` source), not your local path. Skipping this check is exactly what broke a fresh install once already during this project's setup — see git history around the `registration_theme` path-repo fix if you want the full story.

## Developing Registration Theme locally

Same pattern as ConReg, for [`registration_theme`](https://www.drupal.org/project/registration_theme) — and since it's already the site's base theme, this is the live, working example to copy from:

1. Clone it into the project root:
   ```
   git clone https://git.drupalcode.org/project/registration_theme.git themes/registration_theme
   ```
2. Add a `path` repository for it in `composer.local.json`. If you're also set up for ConReg above, add to the *same* file rather than creating a second one — `repositories` is a single array, `require` a single object:
   ```json
   {
       "repositories": [
           {
               "type": "path",
               "url": "themes/registration_theme",
               "options": { "symlink": true }
           }
       ],
       "require": {
           "drupal/registration_theme": "1.0.x-dev"
       }
   }
   ```
3. The theme's own checkout already ships a `composer.json` declaring `"name": "drupal/registration_theme"` / `"type": "drupal-theme"`, so there's nothing to add there.
4. Run `composer update drupal/registration_theme` — symlinks `web/themes/contrib/registration_theme` to your local checkout.

Same caution as ConReg applies: move `composer.local.json` aside and re-run `composer update drupal/registration_theme` before ever committing `composer.lock`, to make sure it's locked to the real published package, not your local path.
