# STREAK

STREAK is a Chrome/Edge extension that records multiplier values visible in the current page DOM and calculates descriptive historical stats, pattern diagnostics, and empirical probability bands.

It is intended for reviewing past visible outcomes from games such as Aviator-style multiplier games. It does not predict future rounds, bypass protected APIs, modify gameplay, or automate betting.

## Load the extension

1. Open Chrome or Edge.
2. Go to `chrome://extensions` or `edge://extensions`.
3. Enable **Developer mode**.
4. Choose **Load unpacked**.
5. Select this folder: `c:\Users\ADMIN\Desktop\bet plugs`.

## Use it

1. Open the page that shows the game history.
2. Click the extension icon.
3. Set **Result selector** to the CSS selector for the visible multiplier history elements.
   - Leave it blank to auto-detect repeated visible result chips.
   - A selector is useful only if the site exposes a clear history container that auto-detection misses.
4. Keep the default regex unless the site formats multipliers differently:
   - `\b\d+(?:\.\d+)?x\b`
5. Choose the DOM order:
   - **Newest first** for history strips where the latest result appears first.
   - **Oldest first** for lists where the latest result is appended at the end.
6. Click **Start**.

If the game runs inside an iframe and no results appear, try opening the game frame in its own tab. Browser extensions can only read frames they have permission to access.

## Pepeta Aviator

For `https://pepeta.com/aviator`:

1. Reload the extension in `chrome://extensions` after installing the latest files.
2. Open `https://pepeta.com/aviator`.
3. Log in if Pepeta requires it and wait until the Aviator game is fully visible.
4. Open the extension popup.
5. Click **Pepeta preset**.
6. Click **Scan frames**.
7. If the scan reports visible result chips, click **Start**.
8. Let the game run while results appear in the visible history.
9. Open **Dashboard** to review the collected records or sync them to Google Sheets.

The Pepeta preset scans the visible page and accessible Pepeta-hosted frames for small repeated result-chip elements that look like final multipliers, such as `1.23x`. It avoids full-page text scraping by default because that can capture buttons, labels, or live multiplier text that is not a finished result. It does not call Pepeta or Spribe private APIs.

If **Scan frames** only shows `0 seen` or `1 seen`, STREAK is refusing to log because it cannot confirm a repeated history-chip group. The game may be drawing its history on a canvas instead of exposing text in the DOM, the active game frame may be hosted on a domain Chrome has not granted the extension permission to read, or the result history may not be visible yet. Reload the unpacked extension after permission changes and reopen the Aviator page.

## Pepeta rooms and pinned collection

Pepeta can show multiple Aviator rooms. The extension can collect all three only when each room is actually loaded in a browser page/frame that Chrome allows the extension to read.

Recommended workflow:

1. Open each room in its own Pepeta tab or window.
2. Wait for the game and result history to fully load in each tab.
3. Use the floating **STREAK** panel on the Pepeta page.
4. Click **Auto start: Off** once to turn it on.
5. Click **Scan** in each room tab and confirm it sees visible result chips.
6. Leave those room tabs open while you use other tabs.

The popup does not need to stay open. The collector runs inside the Pepeta tabs themselves. If Chrome unloads a tab, Pepeta pauses the game, or a room is not loaded, collection for that room pauses too.

If all three rooms are only switches inside one page and Pepeta unloads inactive rooms, the extension can only read the currently loaded room. In that case, use separate tabs/windows for the rooms if Pepeta allows it.

## What it analyzes

- Sample count
- Median, average, and highest multiplier
- Percent of rounds at or above `2x`
- Configurable high-odds threshold, defaulting to `10x`
- Current and longest streak below `2x`
- Lag-1 correlation between consecutive outcomes
- Repeated binned and exact rounded sequences
- Lag-cycle similarity lift across recent captured rounds
- Entropy of multiplier buckets
- Empirical probability bands for the next visible result
- Similar-sequence outcome lookup
- Backtested model accuracy against a simple baseline
- CSV export of captured records

## Dashboard

Click **Dashboard** in the extension popup to open the full data view. The dashboard shows:

- All locally collected records in a searchable table
- Trend and distribution charts
- Live Signal Center with current status, evidence score, repeat status, latest source, and data quality
- Signal History showing past derived signal events and the next actual outcome
- Prediction Lab with data-grounded next-round probability bands
- Prediction model blend: all-record baseline, recent window, nearest patterns, Markov transition, rolling regime, and lag-cycle expectation
- Model leaderboard ranked by backtested top-band accuracy
- Backtest accuracy and baseline accuracy for checking whether the model is adding value
- Nearest historical patterns and what happened after them
- Configurable high-odds hit rate, average gap, current gap, longest gap, and clustered hits
- Enterprise 10x+ event model with high-odds sequence, gap deltas, volatility, and between-hit window diagnostics
- Next 10x+ Pressure formula with expanded factor scores, sample confidence, and status labels
- A 20-column board showing where high-odds and 50x+ outcomes occurred in the latest captured rounds
- Gap histogram for rounds between high-odds outcomes
- Position-rate chart showing how high-odds hits are distributed across board columns
- Recycling signal based on repeated fingerprints, lag-cycle lift, and bucket entropy
- Top repeated binned sequences and exact rounded sequence repeats
- After high-odds behavior summary for the next five rounds
- Source breakdown for comparing multiple room tabs
- Synced and unsynced record counts
- CSV export
- Google Sheets sync controls

## STREAK Bot

The popup now includes **STREAK Bot**, a watch-only signal bot that listens to the records already captured by the extension and can raise browser notifications when:

- the latest binned sequence repeats
- the current high-odds gap stretches well beyond its historical average
- high-odds hits start clustering in the recent window

It does not place bets, click the page, or claim certainty about the next round. It is an alert layer on top of the descriptive analytics already in STREAK.

## Can it catch recycled odds?

It can flag evidence that looks like recycling in the data you collect:

- The same rounded sequence appearing more than once
- The same binned sequence appearing repeatedly
- A lag value where outcomes resemble outcomes from `N` rounds earlier more than the baseline rate
- Low bucket entropy, where results are concentrated in fewer multiplier ranges than expected

Those signals are diagnostics, not proof. To prove a game provider is recycling odds, you would need a complete official outcome history, provably fair seed data where available, and enough independent samples to rule out normal random repetition. The dashboard should be treated as an anomaly finder and audit aid, not as a prediction engine.

## Prediction Lab and no-hallucination rules

The Prediction Lab only uses records captured by this extension. It does not invent missing data, call private game APIs, or claim certainty about the next round.

Every probability is tied to visible evidence:

- **All-record baseline**: frequency of each multiplier band across the captured dataset
- **Recent window**: frequency inside the latest captured records
- **Nearest patterns**: what happened after historical sequences that match the latest binned sequence
- **Markov transition**: what historically followed the current multiplier band
- **Rolling regime**: whether the latest window is hotter, cooler, or stable versus the prior window
- **Lag-cycle expectation**: what happened historically when the current lag reference appeared
- **Backtest and leaderboard**: how often each model's top band matched historical outcomes, compared with a baseline model

If there are not enough records, similar matches, or backtest cases, the dashboard labels the signal as weak or needing data instead of presenting a confident prediction.

## Next 10x+ Pressure formula

The enterprise model scores the current setup with an explainable weighted factor stack:

```text
pressure =
  0.16G_p + 0.11G_z + 0.12H + 0.10D + 0.07C
+ 0.10B + 0.10N + 0.07S + 0.10P + 0.05V + 0.02R
```

- `G_p`: empirical percentile of the current gap since the last threshold hit
- `G_z`: current gap deviation from the historical median gap
- `H`: local hazard echo, checking whether prior completed gaps ended around the current gap age
- `D`: recent gap-delta trend, where compressed gaps lift pressure
- `C`: cluster pulse from recent short gaps
- `B`: current between-hit window strength using average value, max value, 2x+ rate, and near-threshold activity
- `N`: near-miss density below the threshold
- `S`: cold-streak stress from current sub-2x behavior
- `P`: recent pace versus the all-record high-odds baseline
- `V`: volatility regime using recent variance and near-threshold energy
- `R`: latest-source edge versus the overall threshold rate

The raw formula is pulled toward neutral when sample confidence is low. This keeps the dashboard from presenting a strong signal when there are not enough captured threshold events.

## Google Sheets database setup

The extension connects to Google Sheets through a Google Apps Script Web App. This avoids needing a full Google Cloud OAuth setup inside the extension.

1. Create or open a Google Sheet.
2. Go to **Extensions** > **Apps Script**.
3. Copy the contents of `google-sheets-apps-script.gs` from this project into Apps Script.
4. Optional but recommended: in Apps Script, open **Project Settings** > **Script Properties** and add:
   - `ACCESS_TOKEN` with a private random value, for example `my-secret-sync-token`
5. Click **Deploy** > **New deployment**.
6. Choose **Web app**.
7. Set **Execute as** to **Me**.
8. Set access to **Anyone with the link** if you are using an access token.
9. Deploy and copy the Web App URL ending in `/exec`.
10. Open the extension dashboard, paste the Web App URL, enter the same token if you created one, then click **Save** and **Test**.

Use **Sync New Records** to send local data to the Sheet. Enable **Auto sync** if you want newly captured records to be pushed automatically after capture.

Use **Pull From Sheet** to treat the Google Sheet as the shared database and merge rows from the Sheet back into local extension storage.

The Apps Script creates a tab named `AviatorResults` with these columns:

- `id`
- `capturedAt`
- `value`
- `raw`
- `mode`
- `pageTitle`
- `pageUrl`
- `sourceKind`
- `sourceGroup`
- `frameUrl`
- `frameRole`
- `sourceHost`
- `captureSessionId`
- `storedAt`

## Notes

This extension only reads text already visible in your browser tab. Casino and game pages may forbid scraping in their terms, so only use it where you are allowed to collect data.

Aviator-style games are normally designed so past outcomes do not provide a reliable edge for predicting the next outcome. Treat this as a logging and review tool, not a betting strategy.
