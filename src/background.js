const SETTINGS_KEY = "visibleMultiplierLogger.settings";
importScripts("sheets-client.js");
importScripts("streak-bot.js");

const DEFAULT_SETTINGS = {
  selector: "",
  regex: "\\b\\d+(?:\\.\\d+)?x\\b",
  order: "newest-first",
  minValue: 1,
  maxValue: 100000,
  maxRecords: 5000,
  captureExisting: true
};

chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.local.get([SETTINGS_KEY, SheetsClient.SHEETS_KEY, StreakBot.BOT_KEY, StreakBot.BOT_LOG_KEY]);
  if (!stored[SETTINGS_KEY]) {
    await chrome.storage.local.set({ [SETTINGS_KEY]: DEFAULT_SETTINGS });
  }

  if (!stored[SheetsClient.SHEETS_KEY]) {
    await chrome.storage.local.set({
      [SheetsClient.SHEETS_KEY]: SheetsClient.DEFAULT_SHEETS_SETTINGS
    });
  }

  if (!stored[StreakBot.BOT_KEY]) {
    await chrome.storage.local.set({
      [StreakBot.BOT_KEY]: StreakBot.DEFAULT_BOT_SETTINGS
    });
  }

  if (!stored[StreakBot.BOT_LOG_KEY]) {
    await chrome.storage.local.set({
      [StreakBot.BOT_LOG_KEY]: []
    });
  }
});

let autoSyncTimer = null;
let botTimer = null;

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") {
    return;
  }

  if (changes[SheetsClient.RECORDS_KEY]) {
    scheduleAutoSync();
    scheduleBotEvaluation();
  }
});

async function scheduleAutoSync() {
  const settings = await SheetsClient.getSettings();
  if (!settings.autoSync || !settings.endpoint) {
    return;
  }

  if (autoSyncTimer) {
    clearTimeout(autoSyncTimer);
  }

  autoSyncTimer = setTimeout(() => {
    SheetsClient.syncUnsyncedRecords().catch((error) => {
      console.warn("Google Sheets auto sync failed:", error);
    });
  }, 2500);
}

function scheduleBotEvaluation() {
  if (botTimer) {
    clearTimeout(botTimer);
  }

  botTimer = setTimeout(() => {
    runBotEvaluation().catch((error) => {
      console.warn("STREAK Bot evaluation failed:", error);
    });
  }, 1200);
}

async function runBotEvaluation() {
  const stored = await chrome.storage.local.get([
    SheetsClient.RECORDS_KEY,
    StreakBot.BOT_KEY,
    StreakBot.BOT_LOG_KEY
  ]);
  const records = Array.isArray(stored[SheetsClient.RECORDS_KEY]) ? stored[SheetsClient.RECORDS_KEY] : [];
  const botSettings = StreakBot.normalizeSettings(stored[StreakBot.BOT_KEY] || {});

  if (!botSettings.enabled) {
    return;
  }

  const analysis = StreakBot.analyze(records, botSettings);
  if (!analysis.triggers.length) {
    return;
  }

  const logs = Array.isArray(stored[StreakBot.BOT_LOG_KEY]) ? stored[StreakBot.BOT_LOG_KEY] : [];
  const nextLogs = [...logs];

  for (const signal of analysis.triggers) {
    if (!StreakBot.shouldNotify(signal, nextLogs, botSettings)) {
      continue;
    }

    const entry = StreakBot.makeLogEntry(signal, analysis);
    nextLogs.push(entry);
    await notifySignal(entry);
  }

  if (nextLogs.length !== logs.length) {
    await chrome.storage.local.set({
      [StreakBot.BOT_LOG_KEY]: nextLogs.slice(-120)
    });
  }
}

async function notifySignal(entry) {
  await chrome.notifications.create(`streak-bot-${entry.id}`, {
    type: "basic",
    iconUrl: "assets/icons/icon-128.png",
    title: `STREAK Bot: ${entry.title}`,
    message: `${entry.message} Sample: ${entry.total}.`,
    priority: entry.level === "strong" ? 2 : 0
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "VISIBLE_MULTIPLIER_TAB_COMMAND") {
    handleTabCommand(message, sender)
      .then(sendResponse)
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message?.type === "VISIBLE_MULTIPLIER_OPEN_DASHBOARD") {
    chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") });
    sendResponse({ ok: true });
    return false;
  }

  return false;
});

async function handleTabCommand(message, sender) {
  const tabId = sender.tab?.id;
  if (!Number.isInteger(tabId)) {
    throw new Error("No source tab found for the command.");
  }

  const frameIds = await ensureContentScriptInTab(tabId);
  if (!frameIds.length) {
    return { ok: false, error: "No accessible frames found.", frameCount: 0 };
  }

  const typeMap = {
    start: "VISIBLE_MULTIPLIER_START",
    stop: "VISIBLE_MULTIPLIER_STOP",
    capture: "VISIBLE_MULTIPLIER_CAPTURE_NOW",
    scan: "VISIBLE_MULTIPLIER_SCAN",
    ping: "VISIBLE_MULTIPLIER_PING"
  };
  const innerType = typeMap[message.command];

  if (!innerType) {
    throw new Error(`Unknown tab command: ${message.command}`);
  }

  const responses = await Promise.all(
    frameIds.map((frameId) => sendToFrame(tabId, frameId, {
      type: innerType,
      settings: message.settings
    }))
  );

  return aggregateFrameResponses(responses);
}

async function ensureContentScriptInTab(tabId) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId, allFrames: true },
      files: ["src/content.js"]
    });
    return uniqueFrameIds(results);
  } catch {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      files: ["src/content.js"]
    });
    return uniqueFrameIds(results);
  }
}

function uniqueFrameIds(results) {
  const ids = new Set((results || []).map((result) => result.frameId).filter(Number.isInteger));
  return [...ids];
}

function sendToFrame(tabId, frameId, message) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, message, { frameId }, (response) => {
      if (chrome.runtime.lastError) {
        resolve({
          ok: false,
          frameId,
          error: chrome.runtime.lastError.message
        });
        return;
      }

      resolve({ ...response, frameId });
    });
  });
}

function aggregateFrameResponses(responses) {
  const okResponses = responses.filter((response) => response?.ok);
  const errors = responses.filter((response) => response && !response.ok);

  if (!okResponses.length) {
    return {
      ok: false,
      running: false,
      frameCount: 0,
      errorCount: errors.length,
      error: errors[0]?.error || "No accessible frame responded."
    };
  }

  return {
    ok: true,
    running: okResponses.some((response) => response.running),
    imported: sumField(okResponses, "imported"),
    captured: sumField(okResponses, "captured"),
    scanCount: sumField(okResponses, "scanCount"),
    lastSnapshotCount: sumField(okResponses, "lastSnapshotCount"),
    frameCount: okResponses.length,
    errorCount: errors.length,
    frames: okResponses.map((response) => ({
      frameId: response.frameId,
      running: response.running,
      frameUrl: response.frameUrl,
      frameTitle: response.frameTitle,
      scanCount: response.scanCount,
      lastSnapshotCount: response.lastSnapshotCount,
      preview: response.preview || []
    }))
  };
}

function sumField(responses, key) {
  return responses.reduce((total, response) => {
    const value = Number(response[key]);
    return total + (Number.isFinite(value) ? value : 0);
  }, 0);
}
