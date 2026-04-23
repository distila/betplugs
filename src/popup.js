const SETTINGS_KEY = "visibleMultiplierLogger.settings";
const RECORDS_KEY = "visibleMultiplierLogger.records";

const DEFAULT_SETTINGS = {
  selector: "",
  regex: "\\b\\d+(?:\\.\\d+)?x\\b",
  order: "newest-first",
  minValue: 1,
  maxValue: 100000,
  maxRecords: 5000,
  captureExisting: true
};

const PEPETA_PRESET = {
  selector: "",
  regex: "\\b\\d+(?:\\.\\d{1,2})?x\\b",
  order: "newest-first",
  minValue: 1,
  maxValue: 10000,
  maxRecords: 20000,
  captureExisting: true
};

const elements = {
  tabLabel: document.getElementById("tabLabel"),
  statusPill: document.getElementById("statusPill"),
  selectorInput: document.getElementById("selectorInput"),
  regexInput: document.getElementById("regexInput"),
  orderInput: document.getElementById("orderInput"),
  maxRecordsInput: document.getElementById("maxRecordsInput"),
  minValueInput: document.getElementById("minValueInput"),
  maxValueInput: document.getElementById("maxValueInput"),
  captureExistingInput: document.getElementById("captureExistingInput"),
  startButton: document.getElementById("startButton"),
  stopButton: document.getElementById("stopButton"),
  captureButton: document.getElementById("captureButton"),
  scanButton: document.getElementById("scanButton"),
  pepetaPresetButton: document.getElementById("pepetaPresetButton"),
  saveButton: document.getElementById("saveButton"),
  dashboardButton: document.getElementById("dashboardButton"),
  exportButton: document.getElementById("exportButton"),
  clearButton: document.getElementById("clearButton"),
  message: document.getElementById("message"),
  frameDiagnostics: document.getElementById("frameDiagnostics"),
  sampleCount: document.getElementById("sampleCount"),
  medianValue: document.getElementById("medianValue"),
  averageValue: document.getElementById("averageValue"),
  highestValue: document.getElementById("highestValue"),
  botStatusLabel: document.getElementById("botStatusLabel"),
  botEnabledInput: document.getElementById("botEnabledInput"),
  botRepeatAlertsInput: document.getElementById("botRepeatAlertsInput"),
  botGapAlertsInput: document.getElementById("botGapAlertsInput"),
  botClusterAlertsInput: document.getElementById("botClusterAlertsInput"),
  botCooldownInput: document.getElementById("botCooldownInput"),
  botMinRecordsInput: document.getElementById("botMinRecordsInput"),
  botThresholdInput: document.getElementById("botThresholdInput"),
  saveBotButton: document.getElementById("saveBotButton"),
  botSummary: document.getElementById("botSummary"),
  patternList: document.getElementById("patternList"),
  recentList: document.getElementById("recentList")
};

let activeTab = null;
let activeFrameIds = [];
let currentRecords = [];

document.addEventListener("DOMContentLoaded", init);

elements.startButton.addEventListener("click", startCapture);
elements.stopButton.addEventListener("click", stopCapture);
elements.captureButton.addEventListener("click", captureNow);
elements.scanButton.addEventListener("click", scanFrames);
elements.pepetaPresetButton.addEventListener("click", applyPepetaPreset);
elements.saveButton.addEventListener("click", saveSettings);
elements.saveBotButton.addEventListener("click", saveBotSettings);
elements.dashboardButton.addEventListener("click", openDashboard);
elements.exportButton.addEventListener("click", exportCsv);
elements.clearButton.addEventListener("click", clearRecords);

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes[RECORDS_KEY]) {
    renderRecords(changes[RECORDS_KEY].newValue || []);
  }

  if (area === "local" && (changes[StreakBot.BOT_KEY] || changes[StreakBot.BOT_LOG_KEY])) {
    refreshBotState().catch(() => {});
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "VISIBLE_MULTIPLIER_CAPTURED") {
    setMessage(`Captured ${message.count} new result${message.count === 1 ? "" : "s"}.`);
    refreshRecords();
  }
});

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  activeTab = tab;
  elements.tabLabel.textContent = tab?.title ? truncate(tab.title, 44) : "Current tab";

  const stored = await chrome.storage.local.get([SETTINGS_KEY, RECORDS_KEY, StreakBot.BOT_KEY]);
  populateSettings({ ...DEFAULT_SETTINGS, ...(stored[SETTINGS_KEY] || {}) });
  populateBotSettings(StreakBot.normalizeSettings(stored[StreakBot.BOT_KEY] || {}));
  renderRecords(stored[RECORDS_KEY] || []);
  await refreshBotState();
  await refreshStatus();
}

function populateSettings(settings) {
  elements.selectorInput.value = settings.selector || "";
  elements.regexInput.value = settings.regex || DEFAULT_SETTINGS.regex;
  elements.orderInput.value = settings.order || DEFAULT_SETTINGS.order;
  elements.maxRecordsInput.value = settings.maxRecords || DEFAULT_SETTINGS.maxRecords;
  elements.minValueInput.value = settings.minValue ?? DEFAULT_SETTINGS.minValue;
  elements.maxValueInput.value = settings.maxValue ?? DEFAULT_SETTINGS.maxValue;
  elements.captureExistingInput.checked = Boolean(settings.captureExisting);
}

function readSettings() {
  return {
    selector: elements.selectorInput.value.trim(),
    regex: elements.regexInput.value.trim() || DEFAULT_SETTINGS.regex,
    order: elements.orderInput.value,
    minValue: numberFromInput(elements.minValueInput, DEFAULT_SETTINGS.minValue),
    maxValue: numberFromInput(elements.maxValueInput, DEFAULT_SETTINGS.maxValue),
    maxRecords: Math.floor(numberFromInput(elements.maxRecordsInput, DEFAULT_SETTINGS.maxRecords)),
    captureExisting: elements.captureExistingInput.checked
  };
}

function numberFromInput(input, fallback) {
  const value = Number(input.value);
  return Number.isFinite(value) ? value : fallback;
}

async function saveSettings() {
  const settings = readSettings();
  await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
  setMessage("Settings saved.");
}

function populateBotSettings(settings) {
  elements.botEnabledInput.checked = Boolean(settings.enabled);
  elements.botRepeatAlertsInput.checked = Boolean(settings.repeatAlerts);
  elements.botGapAlertsInput.checked = Boolean(settings.gapAlerts);
  elements.botClusterAlertsInput.checked = Boolean(settings.clusterAlerts);
  elements.botCooldownInput.value = settings.cooldownMinutes;
  elements.botMinRecordsInput.value = settings.minRecords;
  elements.botThresholdInput.value = settings.threshold;
}

function readBotSettings() {
  return StreakBot.normalizeSettings({
    enabled: elements.botEnabledInput.checked,
    repeatAlerts: elements.botRepeatAlertsInput.checked,
    gapAlerts: elements.botGapAlertsInput.checked,
    clusterAlerts: elements.botClusterAlertsInput.checked,
    cooldownMinutes: numberFromInput(elements.botCooldownInput, StreakBot.DEFAULT_BOT_SETTINGS.cooldownMinutes),
    minRecords: numberFromInput(elements.botMinRecordsInput, StreakBot.DEFAULT_BOT_SETTINGS.minRecords),
    threshold: numberFromInput(elements.botThresholdInput, StreakBot.DEFAULT_BOT_SETTINGS.threshold)
  });
}

async function saveBotSettings() {
  const settings = readBotSettings();
  await chrome.storage.local.set({ [StreakBot.BOT_KEY]: settings });
  await refreshBotState();
  setMessage(settings.enabled ? "STREAK Bot saved and armed." : "STREAK Bot saved and disabled.");
}

async function applyPepetaPreset() {
  populateSettings(PEPETA_PRESET);
  await chrome.storage.local.set({ [SETTINGS_KEY]: PEPETA_PRESET });
  setMessage("Pepeta preset applied. Open Pepeta Aviator, wait for the game to load, then start capture.");
}

function openDashboard() {
  chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") });
}

async function startCapture() {
  const settings = readSettings();
  await chrome.storage.local.set({ [SETTINGS_KEY]: settings });

  const frameIds = await ensureContentScript();
  if (!frameIds.length) {
    return;
  }

  const responses = await sendToFrames({
    type: "VISIBLE_MULTIPLIER_START",
    settings
  }, frameIds);
  const response = aggregateResponses(responses);

  if (!response?.ok) {
    setMessage(response?.error || "Could not start capture on this tab.");
    return;
  }

  renderStatus(response);
  renderDiagnostics(responses);
  if (response.imported > 0) {
    setMessage(`Capture started in ${response.frameCount} frame${response.frameCount === 1 ? "" : "s"}. Imported ${response.imported} confirmed result${response.imported === 1 ? "" : "s"}.`);
  } else {
    setMessage(`Capture started in ${response.frameCount} frame${response.frameCount === 1 ? "" : "s"}. No confirmed result chips found yet.`);
  }
  await refreshRecords();
}

async function stopCapture() {
  const frameIds = activeFrameIds.length ? activeFrameIds : await ensureContentScript();
  const responses = await sendToFrames({ type: "VISIBLE_MULTIPLIER_STOP" }, frameIds);
  const response = aggregateResponses(responses);
  renderStatus(response || { running: false });
  renderDiagnostics(responses);
  setMessage("Capture stopped.");
}

async function captureNow() {
  const frameIds = await ensureContentScript();
  if (!frameIds.length) {
    return;
  }

  const responses = await sendToFrames({ type: "VISIBLE_MULTIPLIER_CAPTURE_NOW" }, frameIds);
  const response = aggregateResponses(responses);
  if (!response?.ok) {
    setMessage(response?.error || "Could not capture visible results.");
    return;
  }

  renderDiagnostics(responses);
  setMessage(`Captured ${response.captured || 0} visible result${response.captured === 1 ? "" : "s"} across ${response.frameCount} frame${response.frameCount === 1 ? "" : "s"}.`);
  await refreshRecords();
}

async function refreshStatus() {
  const frameIds = await ensureContentScript({ quiet: true });
  const responses = await sendToFrames({ type: "VISIBLE_MULTIPLIER_PING" }, frameIds);
  const response = aggregateResponses(responses);
  renderStatus(response || { running: false });
  renderDiagnostics(responses);
}

function renderStatus(response) {
  const running = Boolean(response?.running);
  elements.statusPill.textContent = running ? "Live" : "Idle";
  elements.statusPill.classList.toggle("live", running);
  elements.startButton.disabled = running;
  elements.stopButton.disabled = !running;
}

async function ensureContentScript(options = {}) {
  if (!activeTab?.id) {
    if (!options.quiet) {
      setMessage("No active tab found.");
    }
    return [];
  }

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: activeTab.id, allFrames: true },
      files: ["src/content.js"]
    });
    activeFrameIds = uniqueFrameIds(results);
    return activeFrameIds;
  } catch (error) {
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        files: ["src/content.js"]
      });
      activeFrameIds = uniqueFrameIds(results);
      if (!options.quiet) {
        setMessage("Injected into the main page. Some iframes may be inaccessible.");
      }
      return activeFrameIds;
    } catch (fallbackError) {
      if (!options.quiet) {
        setMessage(`Cannot inject on this page: ${fallbackError.message}`);
      }
      activeFrameIds = [];
      return [];
    }
  }
}

function uniqueFrameIds(results) {
  const ids = new Set((results || []).map((result) => result.frameId).filter(Number.isInteger));
  return [...ids];
}

async function sendToFrames(message, frameIds = activeFrameIds) {
  if (!activeTab?.id || !frameIds.length) {
    return [];
  }

  const responses = await Promise.all(
    frameIds.map((frameId) => sendToFrame(message, frameId))
  );

  return responses.filter(Boolean);
}

function sendToFrame(message, frameId) {
  if (!activeTab?.id) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    chrome.tabs.sendMessage(activeTab.id, message, { frameId }, (response) => {
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

function aggregateResponses(responses) {
  const okResponses = responses.filter((response) => response?.ok);
  const errors = responses.filter((response) => response && !response.ok);

  if (!okResponses.length) {
    return {
      ok: false,
      running: false,
      error: errors[0]?.error || "No accessible frame responded.",
      frameCount: 0
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
    errorCount: errors.length
  };
}

function sumField(responses, key) {
  return responses.reduce((total, response) => {
    const value = Number(response[key]);
    return total + (Number.isFinite(value) ? value : 0);
  }, 0);
}

async function scanFrames() {
  const settings = readSettings();
  await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
  const frameIds = await ensureContentScript();

  if (!frameIds.length) {
    return;
  }

  const responses = await sendToFrames({
    type: "VISIBLE_MULTIPLIER_SCAN",
    settings
  }, frameIds);
  const response = aggregateResponses(responses);

  renderDiagnostics(responses);

  if (!response.ok) {
    setMessage(response.error || "No accessible frame responded.");
    return;
  }

  setMessage(`Scan found ${response.scanCount || 0} visible result chip${response.scanCount === 1 ? "" : "s"} across ${response.frameCount} accessible frame${response.frameCount === 1 ? "" : "s"}${response.errorCount ? `; ${response.errorCount} frame${response.errorCount === 1 ? "" : "s"} blocked or unavailable` : ""}.`);
}

function renderDiagnostics(responses = []) {
  const visible = responses
    .filter((response) => response?.ok)
    .map((response) => ({
      frameId: response.frameId,
      count: response.scanCount ?? response.lastSnapshotCount ?? 0,
      running: response.running,
      url: response.frameUrl || "",
      preview: response.preview || []
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const errors = responses
    .filter((response) => response && !response.ok)
    .slice(0, 4);

  if (!visible.length && !errors.length) {
    elements.frameDiagnostics.replaceChildren();
    return;
  }

  elements.frameDiagnostics.replaceChildren(
    ...visible.map((item) => {
      const row = document.createElement("div");
      row.className = `diagnostic-row${item.running ? " live" : ""}${item.count ? "" : " warn"}`;
      const label = document.createElement("span");
      label.textContent = `Frame ${item.frameId}${item.running ? " live" : ""}`;
      label.title = item.url;
      const value = document.createElement("strong");
      value.textContent = `${item.count} seen`;
      row.append(label, value);

      const meta = document.createElement("small");
      meta.textContent = frameLabel(item.url);
      meta.title = item.url;
      row.append(meta);

      if (item.preview.length) {
        const preview = document.createElement("em");
        preview.textContent = item.preview.slice(0, 6).join(", ");
        preview.title = item.preview.join(", ");
        row.append(preview);
      }

      return row;
    }),
    ...errors.map((item) => {
      const row = document.createElement("div");
      row.className = "diagnostic-row error";
      const label = document.createElement("span");
      label.textContent = `Frame ${item.frameId ?? "?"}`;
      const value = document.createElement("strong");
      value.textContent = "No access";
      const details = document.createElement("em");
      details.textContent = item.error || "Chrome blocked this frame.";
      details.title = details.textContent;
      row.append(label, value, details);
      return row;
    })
  );
}

function frameLabel(url) {
  if (!url) {
    return "Frame URL unavailable";
  }

  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname}`;
  } catch {
    return url;
  }
}

async function refreshRecords() {
  const stored = await chrome.storage.local.get(RECORDS_KEY);
  renderRecords(stored[RECORDS_KEY] || []);
}

function renderRecords(records) {
  currentRecords = Array.isArray(records) ? records : [];
  const values = records.map((record) => record.value).filter(Number.isFinite);
  const stats = computeStats(values);

  elements.sampleCount.textContent = String(values.length);
  elements.medianValue.textContent = formatMultiplier(stats.median);
  elements.averageValue.textContent = formatMultiplier(stats.average);
  elements.highestValue.textContent = formatMultiplier(stats.highest);

  renderPatterns(stats);
  renderRecent(records.slice(-30).reverse());
  renderBotSummary();
}

async function refreshBotState() {
  const stored = await chrome.storage.local.get([StreakBot.BOT_KEY, StreakBot.BOT_LOG_KEY, RECORDS_KEY]);
  const settings = StreakBot.normalizeSettings(stored[StreakBot.BOT_KEY] || {});
  populateBotSettings(settings);

  if (!currentRecords.length && Array.isArray(stored[RECORDS_KEY])) {
    currentRecords = stored[RECORDS_KEY];
  }

  renderBotSummary(stored[StreakBot.BOT_LOG_KEY] || [], settings);
}

function renderBotSummary(logs = null, settings = null) {
  const botSettings = settings || readBotSettings();
  const analysis = StreakBot.analyze(currentRecords, botSettings);
  const entries = Array.isArray(logs) ? logs : [];

  elements.botStatusLabel.textContent = botSettings.enabled ? "Armed" : "Off";
  elements.botStatusLabel.classList.toggle("live", botSettings.enabled);

  const rows = [];
  if (!botSettings.enabled) {
    rows.push(["State", "Disabled"]);
  } else if (!analysis.ready) {
    rows.push(["State", `Waiting for ${botSettings.minRecords} records`]);
  } else {
    rows.push(["State", analysis.triggers.length ? `${analysis.triggers.length} live trigger${analysis.triggers.length === 1 ? "" : "s"}` : "Monitoring"]);
  }

  rows.push(["Repeat", analysis.repeat.repeated ? `${analysis.repeat.count}x` : "None"]);
  rows.push(["Gap", Number.isFinite(analysis.avgGap) ? `${analysis.currentGap} vs ${analysis.avgGap.toFixed(1)}` : "-"]);
  rows.push(["Recent high hits", String(analysis.recentHighHits)]);

  const latestLog = entries[entries.length - 1];
  rows.push(["Last alert", latestLog ? `${latestLog.title} · ${formatTime(latestLog.createdAt)}` : "None"]);

  elements.botSummary.replaceChildren(
    ...rows.map(([label, value]) => {
      const row = document.createElement("div");
      row.className = "bot-row";
      const labelNode = document.createElement("span");
      labelNode.textContent = label;
      const valueNode = document.createElement("strong");
      valueNode.textContent = value;
      row.append(labelNode, valueNode);
      return row;
    })
  );
}

function computeStats(values) {
  if (!values.length) {
    return {
      average: null,
      median: null,
      highest: null,
      over2Rate: null,
      over10Rate: null,
      below2Streak: 0,
      longestBelow2Streak: 0,
      lagOneCorrelation: null
    };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((total, value) => total + value, 0);
  const median =
    sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

  return {
    average: sum / values.length,
    median,
    highest: sorted[sorted.length - 1],
    over2Rate: ratio(values.filter((value) => value >= 2).length, values.length),
    over10Rate: ratio(values.filter((value) => value >= 10).length, values.length),
    below2Streak: currentBelowStreak(values, 2),
    longestBelow2Streak: longestBelowStreak(values, 2),
    lagOneCorrelation: lagCorrelation(values)
  };
}

function ratio(count, total) {
  return total ? count / total : null;
}

function currentBelowStreak(values, threshold) {
  let streak = 0;
  for (let index = values.length - 1; index >= 0; index -= 1) {
    if (values[index] >= threshold) {
      break;
    }
    streak += 1;
  }
  return streak;
}

function longestBelowStreak(values, threshold) {
  let longest = 0;
  let current = 0;

  values.forEach((value) => {
    if (value < threshold) {
      current += 1;
      longest = Math.max(longest, current);
      return;
    }

    current = 0;
  });

  return longest;
}

function lagCorrelation(values) {
  if (values.length < 3) {
    return null;
  }

  const left = values.slice(0, -1);
  const right = values.slice(1);
  const leftMean = mean(left);
  const rightMean = mean(right);
  let numerator = 0;
  let leftVariance = 0;
  let rightVariance = 0;

  for (let index = 0; index < left.length; index += 1) {
    const leftDelta = left[index] - leftMean;
    const rightDelta = right[index] - rightMean;
    numerator += leftDelta * rightDelta;
    leftVariance += leftDelta * leftDelta;
    rightVariance += rightDelta * rightDelta;
  }

  const denominator = Math.sqrt(leftVariance * rightVariance);
  return denominator ? numerator / denominator : null;
}

function mean(values) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function renderPatterns(stats) {
  const rows = [
    ["2x or higher", formatPercent(stats.over2Rate)],
    ["10x or higher", formatPercent(stats.over10Rate)],
    ["Current < 2x streak", String(stats.below2Streak)],
    ["Longest < 2x streak", String(stats.longestBelow2Streak)],
    ["Lag-1 correlation", formatDecimal(stats.lagOneCorrelation)]
  ];

  elements.patternList.replaceChildren(
    ...rows.map(([label, value]) => {
      const row = document.createElement("div");
      row.className = "pattern";
      const labelNode = document.createElement("span");
      labelNode.textContent = label;
      const valueNode = document.createElement("strong");
      valueNode.textContent = value;
      row.append(labelNode, valueNode);
      return row;
    })
  );
}

function renderRecent(records) {
  if (!records.length) {
    const item = document.createElement("li");
    item.textContent = "No results captured yet.";
    elements.recentList.replaceChildren(item);
    return;
  }

  elements.recentList.replaceChildren(
    ...records.map((record) => {
      const item = document.createElement("li");
      const value = document.createElement("strong");
      value.textContent = formatMultiplier(record.value);
      const time = document.createElement("time");
      time.dateTime = record.capturedAt;
      time.textContent = formatTime(record.capturedAt);
      item.append(value, time);
      return item;
    })
  );
}

async function exportCsv() {
  const stored = await chrome.storage.local.get(RECORDS_KEY);
  const records = stored[RECORDS_KEY] || [];

  if (!records.length) {
    setMessage("No records to export.");
    return;
  }

  const header = ["captured_at", "value", "raw", "mode", "page_title", "page_url"];
  const rows = records.map((record) =>
    [
      record.capturedAt,
      record.value,
      record.raw,
      record.mode,
      record.pageTitle,
      record.pageUrl
    ].map(csvCell).join(",")
  );

  const blob = new Blob([[header.join(","), ...rows].join("\n")], {
    type: "text/csv;charset=utf-8"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `multiplier-results-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  setMessage(`Exported ${records.length} records.`);
}

async function clearRecords() {
  const confirmed = confirm("Clear all captured multiplier records?");
  if (!confirmed) {
    return;
  }

  await chrome.storage.local.set({ [RECORDS_KEY]: [] });
  setMessage("Records cleared.");
}

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function formatMultiplier(value) {
  return Number.isFinite(value) ? `${value.toFixed(2)}x` : "-";
}

function formatPercent(value) {
  return Number.isFinite(value) ? `${(value * 100).toFixed(1)}%` : "-";
}

function formatDecimal(value) {
  return Number.isFinite(value) ? value.toFixed(3) : "-";
}

function formatTime(iso) {
  if (!iso) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date(iso));
}

function truncate(text, limit) {
  return text.length > limit ? `${text.slice(0, limit - 1)}...` : text;
}

function setMessage(text) {
  elements.message.textContent = text;
}
