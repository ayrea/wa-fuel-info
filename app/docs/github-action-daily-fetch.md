# GitHub Action: Daily FuelWatch Data Fetch

## Overview

A scheduled GitHub Actions workflow that runs `scripts/fetch-fuelwatch.ts` daily, commits the new JSON data files to the repository, and optionally triggers a site rebuild/deploy.

FuelWatch publishes next-day fuel prices before **2:30 PM AWST** each day. The workflow should run shortly after this to capture the freshest data.

## Workflow File

Create `.github/workflows/fetch-fuelwatch.yml` in the **repository root** (not inside `app/`).

## Schedule

GitHub Actions cron uses **UTC**. AWST is UTC+8.

| AWST Time | UTC Equivalent | Cron Expression |
| --------- | -------------- | --------------- |
| 2:30 PM   | 6:30 AM        | `30 6 * * *`    |
| 3:00 PM   | 7:00 AM        | `0 7 * * *`     |

A 3:00 PM AWST schedule (`0 7 * * *`) provides a 30-minute buffer after FuelWatch's publication deadline.

> **Note:** GitHub Actions scheduled workflows can be delayed by up to 15 minutes during periods of high demand. This is acceptable for daily price data.

## Workflow Structure

The workflow needs to:

1. Check out the repository
2. Set up Node.js and install dependencies (inside `app/`)
3. Run `npm run fetch-data` to call the FuelWatch API and write JSON files to `app/public/data/`
4. Check if any files changed (`git diff`)
5. If changes exist, commit and push them back to the branch

## Key Implementation Details

### Working Directory

The fetch script and `package.json` live inside `app/`, so steps that run npm commands need `working-directory: app`.

### Git Identity for Auto-Commits

The workflow must configure a git user before committing. Use the GitHub Actions bot identity:

```
git config user.name "github-actions[bot]"
git config user.email "github-actions[bot]@users.noreply.github.com"
```

### Permissions

The workflow needs write access to push commits. Set `permissions: contents: write` on the job, or use a personal access token if the default `GITHUB_TOKEN` lacks push rights on the branch.

### Conditional Commit

Only commit if the fetch script actually produced new or changed files. Use `git diff --quiet` to check -- it exits with code 1 if there are changes.

### Fetch Script Reference

The existing script is at `app/scripts/fetch-fuelwatch.ts` and is invoked via:

```
npm run fetch-data
```

It iterates over all fuel types (`ULP`, `PUP`, `98R`, `DSL`, `BDL`, `E85`, `LPG`), calls `https://www.fuelwatch.wa.gov.au/api/sites?productId=<id>` for each, and writes files named `YYYY-MM-DD_<FUEL>.json` into `app/public/data/`.

### Manual Trigger

Include `workflow_dispatch` alongside the schedule trigger so the workflow can be run manually from the GitHub Actions UI when needed (e.g., for testing or backfilling).

## Rebuild / Deploy (Optional)

If the site is deployed via GitHub Pages or another static host, add a step after the commit to trigger a rebuild. Options include:

- Running `npm run build` in the workflow and deploying `app/dist/`
- Triggering a separate deployment workflow via `workflow_dispatch` using the GitHub API
- Relying on the host's auto-deploy on push (e.g., Netlify, Vercel)

## Data Retention

Each run of the fetch script writes files for the current date only. Over time, the `app/public/data/` directory will accumulate historical files. Consider:

- A cleanup step that removes files older than N days if repo size becomes a concern
- Moving old data to a separate branch or release artifact for archival

## Error Handling

If the FuelWatch API is unreachable or returns errors, the fetch script logs warnings but does not crash. The `git diff` check will find no changes, and the workflow will skip the commit step. No broken data will be committed.

## Testing the Workflow

1. Push the workflow file to the repository
2. Go to **Actions** tab in GitHub
3. Select the workflow and use **Run workflow** (manual dispatch) to test immediately
4. Verify that new JSON files appear in `app/public/data/` in the resulting commit
