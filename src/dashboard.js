const RECORDS_KEY = "visibleMultiplierLogger.records";
const BOT_KEY = "visibleMultiplierLogger.bot";
const BOT_LOG_KEY = "visibleMultiplierLogger.botLog";
const FALLBACK_BOT_SETTINGS = {
  enabled: false,
  repeatAlerts: true,
  gapAlerts: true,
  clusterAlerts: true,
  minRecords: 120,
  repeatLength: 5,
  threshold: 10,
  cooldownMinutes: 30
};

const PREDICTION_BANDS = [
  { key: "under_1_5", label: "< 1.5x", min: 0, max: 1.5 },
  { key: "one_5_to_2", label: "1.5-1.99x", min: 1.5, max: 2 },
  { key: "two_to_5", label: "2-4.99x", min: 2, max: 5 },
  { key: "five_to_10", label: "5-9.99x", min: 5, max: 10 },
  { key: "ten_to_50", label: "10-49.99x", min: 10, max: 50 },
  { key: "fifty_plus", label: "50x+", min: 50, max: Infinity }
];

const elements = {
  syncPill: document.getElementById("syncPill"),
  refreshButton: document.getElementById("refreshButton"),
  exportButton: document.getElementById("exportButton"),
  endpointInput: document.getElementById("endpointInput"),
  tokenInput: document.getElementById("tokenInput"),
  autoSyncInput: document.getElementById("autoSyncInput"),
  saveSheetsButton: document.getElementById("saveSheetsButton"),
  testSheetsButton: document.getElementById("testSheetsButton"),
  syncButton: document.getElementById("syncButton"),
  pullButton: document.getElementById("pullButton"),
  markUnsyncedButton: document.getElementById("markUnsyncedButton"),
  clearLocalButton: document.getElementById("clearLocalButton"),
  message: document.getElementById("message"),
  recordCount: document.getElementById("recordCount"),
  unsyncedCount: document.getElementById("unsyncedCount"),
  averageValue: document.getElementById("averageValue"),
  medianValue: document.getElementById("medianValue"),
  highestValue: document.getElementById("highestValue"),
  lastCaptureValue: document.getElementById("lastCaptureValue"),
  liveSignalScope: document.getElementById("liveSignalScope"),
  liveSignalStatus: document.getElementById("liveSignalStatus"),
  liveEvidenceScore: document.getElementById("liveEvidenceScore"),
  liveEvidenceRing: document.getElementById("liveEvidenceRing"),
  liveEvidenceRingValue: document.getElementById("liveEvidenceRingValue"),
  liveSignalReason: document.getElementById("liveSignalReason"),
  liveTopBand: document.getElementById("liveTopBand"),
  liveRepeatStatus: document.getElementById("liveRepeatStatus"),
  liveLatestSource: document.getElementById("liveLatestSource"),
  liveLatestCapture: document.getElementById("liveLatestCapture"),
  liveDataQualityScore: document.getElementById("liveDataQualityScore"),
  liveDataQualityRing: document.getElementById("liveDataQualityRing"),
  liveDataQualityRingValue: document.getElementById("liveDataQualityRingValue"),
  dataQualityBar: document.getElementById("dataQualityBar"),
  dataQualityNotes: document.getElementById("dataQualityNotes"),
  signalHistoryBody: document.getElementById("signalHistoryBody"),
  trendLabel: document.getElementById("trendLabel"),
  trendCanvas: document.getElementById("trendCanvas"),
  distributionCanvas: document.getElementById("distributionCanvas"),
  predictionScopeLabel: document.getElementById("predictionScopeLabel"),
  predictionLookbackInput: document.getElementById("predictionLookbackInput"),
  predictionSimilarityInput: document.getElementById("predictionSimilarityInput"),
  predictionBacktestInput: document.getElementById("predictionBacktestInput"),
  predictionRecentInput: document.getElementById("predictionRecentInput"),
  predictionSignal: document.getElementById("predictionSignal"),
  predictionTopBand: document.getElementById("predictionTopBand"),
  predictionTopProbability: document.getElementById("predictionTopProbability"),
  predictionMatches: document.getElementById("predictionMatches"),
  predictionBacktestAccuracy: document.getElementById("predictionBacktestAccuracy"),
  predictionBaselineAccuracy: document.getElementById("predictionBaselineAccuracy"),
  predictionGrounding: document.getElementById("predictionGrounding"),
  predictionBars: document.getElementById("predictionBars"),
  predictionConfidenceLabel: document.getElementById("predictionConfidenceLabel"),
  predictionNotes: document.getElementById("predictionNotes"),
  predictionModelsBody: document.getElementById("predictionModelsBody"),
  modelLeaderboardBody: document.getElementById("modelLeaderboardBody"),
  similarOutcomesBody: document.getElementById("similarOutcomesBody"),
  patternScopeLabel: document.getElementById("patternScopeLabel"),
  thresholdInput: document.getElementById("thresholdInput"),
  sequenceLengthInput: document.getElementById("sequenceLengthInput"),
  maxLagInput: document.getElementById("maxLagInput"),
  boardWindowInput: document.getElementById("boardWindowInput"),
  highHitsLabel: document.getElementById("highHitsLabel"),
  highRateLabel: document.getElementById("highRateLabel"),
  over10Count: document.getElementById("over10Count"),
  over10Rate: document.getElementById("over10Rate"),
  averageGap: document.getElementById("averageGap"),
  currentGap: document.getElementById("currentGap"),
  longestGap: document.getElementById("longestGap"),
  clusteredHits: document.getElementById("clusteredHits"),
  recycleSignal: document.getElementById("recycleSignal"),
  bestLag: document.getElementById("bestLag"),
  lagLift: document.getElementById("lagLift"),
  repeatWindows: document.getElementById("repeatWindows"),
  exactRepeatWindows: document.getElementById("exactRepeatWindows"),
  entropyValue: document.getElementById("entropyValue"),
  boardLabel: document.getElementById("boardLabel"),
  over10Board: document.getElementById("over10Board"),
  positionCanvas: document.getElementById("positionCanvas"),
  gapCanvas: document.getElementById("gapCanvas"),
  lagCanvas: document.getElementById("lagCanvas"),
  patternConfidenceLabel: document.getElementById("patternConfidenceLabel"),
  patternNotes: document.getElementById("patternNotes"),
  afterThresholdLabel: document.getElementById("afterThresholdLabel"),
  after10Body: document.getElementById("after10Body"),
  repeatedSequencesBody: document.getElementById("repeatedSequencesBody"),
  exactSequencesBody: document.getElementById("exactSequencesBody"),
  sourceThresholdLabel: document.getElementById("sourceThresholdLabel"),
  sourceBreakdownBody: document.getElementById("sourceBreakdownBody"),
  enterpriseModelScope: document.getElementById("enterpriseModelScope"),
  enterpriseHitCount: document.getElementById("enterpriseHitCount"),
  enterpriseGapDelta: document.getElementById("enterpriseGapDelta"),
  enterpriseGapVolatility: document.getElementById("enterpriseGapVolatility"),
  enterpriseGapPressure: document.getElementById("enterpriseGapPressure"),
  enterpriseBetweenAverage: document.getElementById("enterpriseBetweenAverage"),
  enterpriseInsightCount: document.getElementById("enterpriseInsightCount"),
  enterprisePressurePanel: document.getElementById("enterprisePressurePanel"),
  enterprisePressureTitle: document.getElementById("enterprisePressureTitle"),
  enterprisePressureScore: document.getElementById("enterprisePressureScore"),
  enterprisePressureStatus: document.getElementById("enterprisePressureStatus"),
  enterprisePressureBar: document.getElementById("enterprisePressureBar"),
  enterprisePressureReason: document.getElementById("enterprisePressureReason"),
  enterprisePressureFormula: document.getElementById("enterprisePressureFormula"),
  pressureGapPercentile: document.getElementById("pressureGapPercentile"),
  pressureGapDeviation: document.getElementById("pressureGapDeviation"),
  pressureHazardEcho: document.getElementById("pressureHazardEcho"),
  pressureDeltaTrend: document.getElementById("pressureDeltaTrend"),
  pressureClusterPulse: document.getElementById("pressureClusterPulse"),
  pressureBetweenStrength: document.getElementById("pressureBetweenStrength"),
  pressureNearMissDensity: document.getElementById("pressureNearMissDensity"),
  pressureColdStreak: document.getElementById("pressureColdStreak"),
  pressureRecentPace: document.getElementById("pressureRecentPace"),
  pressureVolatilityRegime: document.getElementById("pressureVolatilityRegime"),
  pressureSourceEdge: document.getElementById("pressureSourceEdge"),
  pressureSampleConfidence: document.getElementById("pressureSampleConfidence"),
  enterpriseEventBody: document.getElementById("enterpriseEventBody"),
  enterpriseBetweenBody: document.getElementById("enterpriseBetweenBody"),
  enterpriseNotes: document.getElementById("enterpriseNotes"),
  botStatusChip: document.getElementById("botStatusChip"),
  botPanelScope: document.getElementById("botPanelScope"),
  botEnabledInput: document.getElementById("botEnabledInput"),
  botRepeatAlertsInput: document.getElementById("botRepeatAlertsInput"),
  botGapAlertsInput: document.getElementById("botGapAlertsInput"),
  botClusterAlertsInput: document.getElementById("botClusterAlertsInput"),
  botMinRecordsInput: document.getElementById("botMinRecordsInput"),
  botRepeatLengthInput: document.getElementById("botRepeatLengthInput"),
  botThresholdInput: document.getElementById("botThresholdInput"),
  botCooldownInput: document.getElementById("botCooldownInput"),
  saveBotButton: document.getElementById("saveBotButton"),
  clearBotAlertsButton: document.getElementById("clearBotAlertsButton"),
  botStateValue: document.getElementById("botStateValue"),
  botTriggerCount: document.getElementById("botTriggerCount"),
  botRepeatValue: document.getElementById("botRepeatValue"),
  botGapValue: document.getElementById("botGapValue"),
  botRecentHitsValue: document.getElementById("botRecentHitsValue"),
  botAlertsLoggedValue: document.getElementById("botAlertsLoggedValue"),
  botTriggerState: document.getElementById("botTriggerState"),
  botTriggerSummary: document.getElementById("botTriggerSummary"),
  botConfidenceLabel: document.getElementById("botConfidenceLabel"),
  botNotes: document.getElementById("botNotes"),
  botAlertCount: document.getElementById("botAlertCount"),
  botAlertsBody: document.getElementById("botAlertsBody"),
  tableCount: document.getElementById("tableCount"),
  searchInput: document.getElementById("searchInput"),
  filterMinInput: document.getElementById("filterMinInput"),
  filterMaxInput: document.getElementById("filterMaxInput"),
  syncFilterInput: document.getElementById("syncFilterInput"),
  selectedCount: document.getElementById("selectedCount"),
  clearSelectionButton: document.getElementById("clearSelectionButton"),
  deleteSelectedButton: document.getElementById("deleteSelectedButton"),
  selectPageCheckbox: document.getElementById("selectPageCheckbox"),
  recordsBody: document.getElementById("recordsBody"),
  prevPageButton: document.getElementById("prevPageButton"),
  nextPageButton: document.getElementById("nextPageButton"),
  pageLabel: document.getElementById("pageLabel")
};

const state = {
  records: [],
  settings: { ...SheetsClient.DEFAULT_SHEETS_SETTINGS },
  botSettings: { ...FALLBACK_BOT_SETTINGS },
  botLogs: [],
  filtered: [],
  selectedIds: new Set(),
  page: 1,
  pageSize: 100,
  analytics: {
    threshold: 10,
    sequenceLength: 5,
    maxLag: 240,
    boardWindow: 600,
    predictionLookback: 5,
    predictionSimilarity: 0.6,
    predictionBacktest: 250,
    predictionRecent: 120
  }
};

function storageGet(keys) {
  return new Promise((resolve) => {
    if (!isExtensionContextAvailable()) {
      resolve({});
      return;
    }

    try {
      chrome.storage.local.get(keys, (result) => {
        const error = lastChromeError();
        if (error) {
          resolve({});
          return;
        }
        resolve(result || {});
      });
    } catch {
      resolve({});
    }
  });
}

function storageSet(payload) {
  return new Promise((resolve) => {
    if (!isExtensionContextAvailable()) {
      resolve(false);
      return;
    }

    try {
      chrome.storage.local.set(payload, () => {
        resolve(!lastChromeError());
      });
    } catch {
      resolve(false);
    }
  });
}

function addStorageChangeListener(listener) {
  if (!isExtensionContextAvailable()) {
    return;
  }

  try {
    chrome.storage.onChanged.addListener(listener);
  } catch {
    // A dashboard tab can outlive a reloaded unpacked extension.
  }
}

function isExtensionContextAvailable() {
  return typeof chrome !== "undefined" && Boolean(chrome.storage?.local);
}

function lastChromeError() {
  try {
    return chrome.runtime?.lastError || null;
  } catch {
    return null;
  }
}

function getStreakBotApi() {
  return typeof StreakBot !== "undefined" ? StreakBot : null;
}

function normalizeBotSettings(settings = {}) {
  const api = getStreakBotApi();
  if (api?.normalizeSettings) {
    return api.normalizeSettings(settings);
  }

  return {
    ...FALLBACK_BOT_SETTINGS,
    ...settings,
    enabled: Boolean(settings.enabled),
    repeatAlerts: settings.repeatAlerts !== false,
    gapAlerts: settings.gapAlerts !== false,
    clusterAlerts: settings.clusterAlerts !== false,
    minRecords: clampInteger(settings.minRecords, 50, 5000, FALLBACK_BOT_SETTINGS.minRecords),
    repeatLength: clampInteger(settings.repeatLength, 3, 10, FALLBACK_BOT_SETTINGS.repeatLength),
    threshold: clampValue(settings.threshold, 2, 1000, FALLBACK_BOT_SETTINGS.threshold),
    cooldownMinutes: clampInteger(settings.cooldownMinutes, 5, 1440, FALLBACK_BOT_SETTINGS.cooldownMinutes)
  };
}

function getConfidenceLabel(total) {
  if (total >= 1000) {
    return "High sample confidence";
  }

  if (total >= 300) {
    return "Good sample";
  }

  if (total >= 100) {
    return "Developing sample";
  }

  return "Needs more data";
}

bootDashboard();

function bootDashboard() {
  const missingElements = Object.entries(elements)
    .filter(([, element]) => !element)
    .map(([name]) => name);

  if (missingElements.length) {
    showDashboardLoadError(missingElements);
    return;
  }

  document.addEventListener("DOMContentLoaded", init);
  setupDashboardTabs();

  elements.refreshButton.addEventListener("click", refresh);
  elements.exportButton.addEventListener("click", exportCsv);
  elements.saveSheetsButton.addEventListener("click", saveSheetsSettings);
  elements.testSheetsButton.addEventListener("click", testSheets);
  elements.syncButton.addEventListener("click", syncRecords);
  elements.pullButton.addEventListener("click", pullRecords);
  elements.markUnsyncedButton.addEventListener("click", markAllUnsynced);
  elements.clearLocalButton.addEventListener("click", clearLocalData);
  elements.saveBotButton.addEventListener("click", saveBotSettings);
  elements.clearBotAlertsButton.addEventListener("click", clearBotAlerts);
  elements.clearSelectionButton.addEventListener("click", clearSelection);
  elements.deleteSelectedButton.addEventListener("click", deleteSelectedRecords);
  elements.selectPageCheckbox.addEventListener("change", togglePageSelection);
  elements.prevPageButton.addEventListener("click", () => changePage(-1));
  elements.nextPageButton.addEventListener("click", () => changePage(1));

  [
    elements.searchInput,
    elements.filterMinInput,
    elements.filterMaxInput,
    elements.syncFilterInput
  ].forEach((input) => {
    input.addEventListener("input", () => {
      state.page = 1;
      render();
    });
  });

  [
    elements.thresholdInput,
    elements.sequenceLengthInput,
    elements.maxLagInput,
    elements.boardWindowInput,
    elements.predictionLookbackInput,
    elements.predictionSimilarityInput,
    elements.predictionBacktestInput,
    elements.predictionRecentInput
  ].forEach((input) => {
    input.addEventListener("input", () => {
      state.analytics = readAnalyticsOptions();
      render();
    });
  });

  [
    elements.botEnabledInput,
    elements.botRepeatAlertsInput,
    elements.botGapAlertsInput,
    elements.botClusterAlertsInput,
    elements.botMinRecordsInput,
    elements.botRepeatLengthInput,
    elements.botThresholdInput,
    elements.botCooldownInput
  ].forEach((input) => {
    input.addEventListener("input", previewBotSettings);
    input.addEventListener("change", previewBotSettings);
  });

  addStorageChangeListener((changes, area) => {
    if (area !== "local") {
      return;
    }

    if (changes[RECORDS_KEY]) {
      state.records = normalizeRecords(changes[RECORDS_KEY].newValue || []);
      pruneSelection();
      render();
    }

    if (changes[SheetsClient.SHEETS_KEY]) {
      state.settings = {
        ...SheetsClient.DEFAULT_SHEETS_SETTINGS,
        ...(changes[SheetsClient.SHEETS_KEY].newValue || {})
      };
      populateSheetsSettings();
      renderSyncPill();
    }

    if (changes[BOT_KEY]) {
      state.botSettings = normalizeBotSettings(changes[BOT_KEY].newValue || {});
      populateBotSettings();
      render();
    }

    if (changes[BOT_LOG_KEY]) {
      state.botLogs = normalizeBotLogs(changes[BOT_LOG_KEY].newValue || []);
      render();
    }
  });
}

function setupDashboardTabs() {
  document.querySelectorAll("[data-scroll-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.scrollTarget);
      if (!target) {
        return;
      }

      document.querySelectorAll("[data-scroll-target]").forEach((tab) => {
        tab.classList.toggle("active", tab === button);
      });
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function showDashboardLoadError(missingElements) {
  const shell = document.createElement("main");
  shell.className = "app-shell";

  const panel = document.createElement("section");
  panel.className = "panel";

  const title = document.createElement("h1");
  title.textContent = "Dashboard needs a clean reload";

  const message = document.createElement("p");
  message.className = "message";
  message.textContent = "This dashboard tab is using files from different extension versions. Reload the extension, close this dashboard tab, then open Dashboard again from the extension popup.";

  const detail = document.createElement("p");
  detail.className = "message";
  detail.textContent = `Missing UI elements: ${missingElements.join(", ")}`;

  panel.append(title, message, detail);
  shell.append(panel);
  document.body.replaceChildren(shell);
}

async function init() {
  await refresh();
}

async function refresh() {
  const stored = await storageGet([RECORDS_KEY, SheetsClient.SHEETS_KEY, BOT_KEY, BOT_LOG_KEY]);
  state.records = normalizeRecords(stored[RECORDS_KEY] || []);
  state.settings = {
    ...SheetsClient.DEFAULT_SHEETS_SETTINGS,
    ...(stored[SheetsClient.SHEETS_KEY] || {})
  };
  state.botSettings = normalizeBotSettings(stored[BOT_KEY] || {});
  state.botLogs = normalizeBotLogs(stored[BOT_LOG_KEY] || []);
  populateSheetsSettings();
  populateBotSettings();
  render();
  setMessage("Dashboard refreshed.");
}

function populateSheetsSettings() {
  elements.endpointInput.value = state.settings.endpoint || "";
  elements.tokenInput.value = state.settings.token || "";
  elements.autoSyncInput.checked = Boolean(state.settings.autoSync);
}

function populateBotSettings() {
  elements.botEnabledInput.checked = Boolean(state.botSettings.enabled);
  elements.botRepeatAlertsInput.checked = Boolean(state.botSettings.repeatAlerts);
  elements.botGapAlertsInput.checked = Boolean(state.botSettings.gapAlerts);
  elements.botClusterAlertsInput.checked = Boolean(state.botSettings.clusterAlerts);
  elements.botMinRecordsInput.value = state.botSettings.minRecords;
  elements.botRepeatLengthInput.value = String(state.botSettings.repeatLength);
  elements.botThresholdInput.value = String(state.botSettings.threshold);
  elements.botCooldownInput.value = String(state.botSettings.cooldownMinutes);
}

function readBotSettings() {
  return normalizeBotSettings({
    enabled: elements.botEnabledInput.checked,
    repeatAlerts: elements.botRepeatAlertsInput.checked,
    gapAlerts: elements.botGapAlertsInput.checked,
    clusterAlerts: elements.botClusterAlertsInput.checked,
    minRecords: Number(elements.botMinRecordsInput.value),
    repeatLength: Number(elements.botRepeatLengthInput.value),
    threshold: Number(elements.botThresholdInput.value),
    cooldownMinutes: Number(elements.botCooldownInput.value)
  });
}

function normalizeBotLogs(logs) {
  return (Array.isArray(logs) ? logs : [])
    .filter((entry) => entry && entry.id)
    .sort((a, b) => String(a.createdAt || "").localeCompare(String(b.createdAt || "")));
}

async function saveSheetsSettings() {
  state.settings = await SheetsClient.saveSettings({
    endpoint: elements.endpointInput.value,
    token: elements.tokenInput.value,
    autoSync: elements.autoSyncInput.checked
  });
  renderSyncPill();
  setMessage("Google Sheets settings saved.");
}

async function saveBotSettings() {
  state.botSettings = readBotSettings();
  const saved = await storageSet({ [BOT_KEY]: state.botSettings });
  if (!saved) {
    setMessage("Could not save STREAK Bot settings.");
    return;
  }

  populateBotSettings();
  render();
  setMessage(state.botSettings.enabled ? "STREAK Bot saved and armed." : "STREAK Bot saved and disabled.");
}

async function clearBotAlerts() {
  const confirmed = confirm("Clear the saved STREAK Bot alert log?");
  if (!confirmed) {
    return;
  }

  state.botLogs = [];
  await storageSet({ [BOT_LOG_KEY]: [] });
  render();
  setMessage("STREAK Bot alert log cleared.");
}

function previewBotSettings() {
  state.botSettings = readBotSettings();
  render();
}

async function testSheets() {
  await saveSheetsSettings();
  setBusy(true);
  try {
    const result = await SheetsClient.testConnection();
    setMessage(`Connected to "${result.sheetName || "Google Sheet"}" with ${result.rows || 0} stored rows.`);
  } catch (error) {
    setMessage(error.message);
  } finally {
    setBusy(false);
  }
}

async function syncRecords() {
  await saveSheetsSettings();
  setBusy(true);
  try {
    const result = await SheetsClient.syncUnsyncedRecords();
    setMessage(`Sync complete. Sent ${result.sent || 0}, appended ${result.appended || 0}, skipped ${result.skipped || 0}.`);
    await refresh();
  } catch (error) {
    setMessage(error.message);
  } finally {
    setBusy(false);
  }
}

async function pullRecords() {
  await saveSheetsSettings();
  setBusy(true);
  try {
    const result = await SheetsClient.pullRecords();
    setMessage(`Pulled ${result.pulled || 0} records from Google Sheets. Local total: ${result.total || 0}.`);
    await refresh();
  } catch (error) {
    setMessage(error.message);
  } finally {
    setBusy(false);
  }
}

async function markAllUnsynced() {
  const confirmed = confirm("Mark every local record as unsynced so it can be sent to Google Sheets again?");
  if (!confirmed) {
    return;
  }

  const result = await SheetsClient.markAllUnsynced();
  setMessage(`Marked ${result.count} records as unsynced.`);
  await refresh();
}

async function clearLocalData() {
  const confirmed = confirm("Clear all locally stored records? This will not delete rows already stored in Google Sheets.");
  if (!confirmed) {
    return;
  }

  await storageSet({ [RECORDS_KEY]: [] });
  state.records = [];
  state.selectedIds.clear();
  setMessage("Local records cleared.");
  render();
}

async function deleteSelectedRecords() {
  const selectedCount = state.selectedIds.size;
  if (!selectedCount) {
    setMessage("Select one or more records to delete.");
    return;
  }

  const confirmed = confirm(`Delete ${selectedCount} selected local record${selectedCount === 1 ? "" : "s"}? This will not delete rows already stored in Google Sheets.`);
  if (!confirmed) {
    return;
  }

  const selected = new Set(state.selectedIds);
  const nextRecords = state.records.filter((record) => !selected.has(String(record.id)));
  await storageSet({ [RECORDS_KEY]: nextRecords });
  state.records = normalizeRecords(nextRecords);
  state.selectedIds.clear();
  setMessage(`Deleted ${selectedCount} selected local record${selectedCount === 1 ? "" : "s"}.`);
  render();
}

function clearSelection() {
  state.selectedIds.clear();
  renderTable();
}

function pruneSelection() {
  const validIds = new Set(state.records.map((record) => String(record.id)));
  state.selectedIds.forEach((id) => {
    if (!validIds.has(id)) {
      state.selectedIds.delete(id);
    }
  });
}

function readAnalyticsOptions() {
  const threshold = clampValue(Number(elements.thresholdInput.value), 2, 1000, 10);
  return {
    threshold,
    sequenceLength: clampInteger(Number(elements.sequenceLengthInput.value), 4, 10, 5),
    maxLag: clampInteger(Number(elements.maxLagInput.value), 20, 1000, 240),
    boardWindow: clampInteger(Number(elements.boardWindowInput.value), 100, 2000, 600),
    predictionLookback: clampInteger(Number(elements.predictionLookbackInput.value), 3, 10, 5),
    predictionSimilarity: clampValue(Number(elements.predictionSimilarityInput.value) / 100, 0.5, 1, 0.6),
    predictionBacktest: clampInteger(Number(elements.predictionBacktestInput.value), 50, 1000, 250),
    predictionRecent: clampInteger(Number(elements.predictionRecentInput.value), 30, 500, 120)
  };
}

function readSelectValue(input, allowedValues, fallback) {
  return allowedValues.includes(input.value) ? input.value : fallback;
}

function clampValue(value, min, max, fallback) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(min, Math.min(max, value));
}

function clampInteger(value, min, max, fallback) {
  return Math.floor(clampValue(value, min, max, fallback));
}

function render() {
  const values = state.records.map((record) => Number(record.value)).filter(Number.isFinite);
  const stats = computeStats(values);
  const summary = SheetsClient.getSyncSummary(state.records, state.settings);
  const predictionAnalysis = analyzePredictionLab(state.records, state.analytics);
  const patternAnalysis = analyzePatterns(state.records, state.analytics);
  const liveSignal = analyzeLiveSignal(state.records, predictionAnalysis, patternAnalysis, state.analytics);
  const streakBot = analyzeStreakBot(state.records, state.botSettings);

  elements.recordCount.textContent = String(summary.total);
  elements.unsyncedCount.textContent = String(summary.unsynced);
  elements.averageValue.textContent = formatMultiplier(stats.average);
  elements.medianValue.textContent = formatMultiplier(stats.median);
  elements.highestValue.textContent = formatMultiplier(stats.highest);
  elements.lastCaptureValue.textContent = state.records.length ? formatDateTime(state.records[state.records.length - 1].capturedAt) : "-";

  renderSyncPill(summary);
  renderLiveSignal(liveSignal);
  renderTrend();
  renderDistribution(values);
  renderPredictionLab(predictionAnalysis);
  renderPatternAnalysis(patternAnalysis);
  renderStreakBot(streakBot);
  renderTable();
}

function renderSyncPill(summary = SheetsClient.getSyncSummary(state.records, state.settings)) {
  elements.syncPill.classList.remove("connected", "warning");

  if (!summary.connected) {
    elements.syncPill.textContent = "Sheets disconnected";
    return;
  }

  if (summary.unsynced > 0) {
    elements.syncPill.textContent = `${summary.unsynced} unsynced`;
    elements.syncPill.classList.add("warning");
    return;
  }

  elements.syncPill.textContent = "Sheets synced";
  elements.syncPill.classList.add("connected");
}

function renderTrend() {
  const canvas = elements.trendCanvas;
  const ctx = canvas.getContext("2d");
  const records = state.records.slice(-100);
  const values = records.map((record) => Number(record.value)).filter(Number.isFinite);
  elements.trendLabel.textContent = `Last ${values.length} records`;
  drawLineChart(ctx, canvas, values);
}

function renderDistribution(values) {
  const buckets = [
    ["< 1.5x", values.filter((value) => value < 1.5).length],
    ["1.5-2x", values.filter((value) => value >= 1.5 && value < 2).length],
    ["2-5x", values.filter((value) => value >= 2 && value < 5).length],
    ["5-10x", values.filter((value) => value >= 5 && value < 10).length],
    ["10x+", values.filter((value) => value >= 10).length]
  ];

  drawBarChart(elements.distributionCanvas.getContext("2d"), elements.distributionCanvas, buckets);
}

function analyzePredictionLab(records, options = state.analytics) {
  const values = records
    .map((record) => Number(record.value))
    .filter(Number.isFinite);
  const prediction = buildPredictionForValues(values, options);
  const backtest = backtestPrediction(values, options);
  const leaderboard = backtestModelLeaderboard(values, options);
  const evidence = scorePredictionEvidence(values.length, prediction, backtest, leaderboard);

  return {
    ...prediction,
    backtest,
    leaderboard,
    evidence,
    notes: buildPredictionNotes(values.length, prediction, backtest, evidence, leaderboard)
  };
}

function buildPredictionForValues(values, options = state.analytics) {
  const cleanValues = values.filter(Number.isFinite);
  const lookback = clampInteger(Number(options.predictionLookback), 3, 10, 5);
  const minSimilarity = clampValue(Number(options.predictionSimilarity), 0.5, 1, 0.6);
  const recentWindow = clampInteger(Number(options.predictionRecent), 30, 500, 120);
  const tokens = cleanValues.map(binMultiplier);
  const currentTokens = tokens.slice(-lookback);
  const baseline = distributionFromValues(cleanValues);
  const recentValues = cleanValues.slice(-Math.min(recentWindow, cleanValues.length));
  const recent = distributionFromValues(recentValues);
  const similar = findSimilarNextOutcomes(cleanValues, tokens, currentTokens, lookback, minSimilarity);
  const similarDistribution = weightedDistributionFromOutcomes(similar.matches);
  const markov = markovTransitionExpectation(cleanValues, tokens);
  const regime = regimeExpectation(cleanValues, tokens, recentWindow);
  const lag = options.skipLagModel
    ? emptyLagExpectation()
    : lagExpectation(cleanValues, tokens, Number(options.maxLag) || 240);
  const models = [];

  if (baseline.sample > 0) {
    models.push({
      key: "baseline",
      label: "All-record baseline",
      sample: baseline.sample,
      distribution: baseline.probabilities,
      rawWeight: 0.35,
      status: "Observed frequency across all captured records"
    });
  }

  if (recent.sample >= 30) {
    models.push({
      key: "recent",
      label: "Recent window",
      sample: recent.sample,
      distribution: recent.probabilities,
      rawWeight: 0.18,
      status: `Last ${recent.sample} captured records`
    });
  }

  if (similar.matches.length > 0) {
    models.push({
      key: "similar",
      label: "Nearest patterns",
      sample: similar.matches.length,
      distribution: similarDistribution.probabilities,
      rawWeight: Math.min(0.32, 0.08 + similar.matches.length / 80),
      status: `${Math.round(minSimilarity * 100)}%+ binned sequence match`
    });
  }

  if (markov.sample >= 5) {
    models.push({
      key: "markov",
      label: "Markov transition",
      sample: markov.sample,
      distribution: markov.distribution.probabilities,
      rawWeight: Math.min(0.2, 0.06 + markov.sample / 140),
      status: `Next-band history after ${markov.currentToken}`
    });
  }

  if (regime.sample >= 30) {
    models.push({
      key: "regime",
      label: "Rolling regime",
      sample: regime.sample,
      distribution: regime.distribution.probabilities,
      rawWeight: Math.min(0.16, 0.05 + regime.drift * 0.2 + regime.sample / 1200),
      status: `${regime.label}, drift ${formatPercent(regime.drift)}`
    });
  }

  if (lag.values.length >= 15) {
    models.push({
      key: "lag",
      label: "Lag-cycle expectation",
      sample: lag.values.length,
      distribution: lag.distribution.probabilities,
      rawWeight: Math.min(0.15, 0.04 + Math.max(0, (lag.lift || 1) - 1) * 0.06 + lag.values.length / 1000),
      status: lag.bestLag ? `${lag.bestLag.lag}-round lag, ${formatLift(lag.lift)} lift` : "No strong lag"
    });
  }

  const normalizedModels = normalizeModelWeights(models);
  const probabilities = blendModelProbabilities(normalizedModels);
  const topBand = topProbabilityBand(probabilities);

  return {
    total: cleanValues.length,
    lookback,
    minSimilarity,
    recentWindow,
    currentTokens,
    baseline,
    recent,
    similar,
    markov,
    regime,
    lag,
    models: normalizedModels,
    probabilities,
    topBand
  };
}

function distributionFromValues(values) {
  const counts = emptyBandMap(0);
  const cleanValues = values.filter(Number.isFinite);

  cleanValues.forEach((value) => {
    counts[bandForValue(value).key] += 1;
  });

  return {
    sample: cleanValues.length,
    counts,
    probabilities: probabilitiesFromCounts(counts, cleanValues.length)
  };
}

function weightedDistributionFromOutcomes(matches) {
  const counts = emptyBandMap(0);
  const weightTotal = matches.reduce((total, match) => total + match.weight, 0);

  matches.forEach((match) => {
    counts[bandForValue(match.nextValue).key] += match.weight;
  });

  return {
    sample: matches.length,
    counts,
    probabilities: probabilitiesFromCounts(counts, weightTotal)
  };
}

function emptyBandMap(value) {
  return PREDICTION_BANDS.reduce((map, band) => {
    map[band.key] = value;
    return map;
  }, {});
}

function probabilitiesFromCounts(counts, total) {
  const probabilities = emptyBandMap(null);

  PREDICTION_BANDS.forEach((band) => {
    probabilities[band.key] = total ? counts[band.key] / total : null;
  });

  return probabilities;
}

function bandForValue(value) {
  return PREDICTION_BANDS.find((band) => value >= band.min && value < band.max) || PREDICTION_BANDS[0];
}

function findSimilarNextOutcomes(values, tokens, currentTokens, lookback, minSimilarity) {
  if (values.length <= lookback || currentTokens.length < lookback) {
    return { matches: [], currentTokens };
  }

  const matches = [];
  const lastStart = values.length - lookback;

  for (let start = 0; start < lastStart; start += 1) {
    const nextIndex = start + lookback;
    if (!Number.isFinite(values[nextIndex])) {
      continue;
    }

    const windowTokens = tokens.slice(start, start + lookback);
    const similarity = sequenceSimilarity(windowTokens, currentTokens);

    if (similarity < minSimilarity) {
      continue;
    }

    matches.push({
      start,
      sequence: windowTokens,
      nextValue: values[nextIndex],
      nextBand: bandForValue(values[nextIndex]),
      similarity,
      weight: Math.max(0.01, similarity * similarity)
    });
  }

  return {
    currentTokens,
    matches: matches
      .sort((a, b) => b.similarity - a.similarity || b.start - a.start)
      .slice(0, 250),
    topMatches: matches
      .sort((a, b) => b.similarity - a.similarity || b.start - a.start)
      .slice(0, 12)
  };
}

function sequenceSimilarity(left, right) {
  if (!left.length || left.length !== right.length) {
    return 0;
  }

  let matches = 0;
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] === right[index]) {
      matches += 1;
    }
  }

  return matches / left.length;
}

function markovTransitionExpectation(values, tokens) {
  if (tokens.length < 2) {
    return emptyMarkovExpectation();
  }

  const currentToken = tokens[tokens.length - 1];
  const nextValues = [];

  for (let index = 0; index < tokens.length - 1; index += 1) {
    if (tokens[index] === currentToken) {
      nextValues.push(values[index + 1]);
    }
  }

  return {
    currentToken,
    sample: nextValues.length,
    values: nextValues,
    distribution: distributionFromValues(nextValues)
  };
}

function emptyMarkovExpectation() {
  return {
    currentToken: "",
    sample: 0,
    values: [],
    distribution: distributionFromValues([])
  };
}

function regimeExpectation(values, tokens, recentWindow) {
  const windowSize = Math.min(Math.max(30, recentWindow), values.length);
  if (windowSize < 30) {
    return emptyRegimeExpectation();
  }

  const recentValues = values.slice(-windowSize);
  const previousValues = values.slice(Math.max(0, values.length - windowSize * 2), values.length - windowSize);
  const recentDistribution = distributionFromValues(recentValues);
  const previousDistribution = distributionFromValues(previousValues);
  const drift = distributionDrift(recentDistribution.probabilities, previousDistribution.probabilities);
  const recentHighRate = highBandRate(recentDistribution.probabilities);
  const previousHighRate = highBandRate(previousDistribution.probabilities);
  const label = regimeLabel(recentHighRate, previousHighRate, drift);

  return {
    label,
    sample: recentValues.length,
    drift,
    recentHighRate,
    previousHighRate,
    tokens: tokens.slice(-windowSize),
    distribution: recentDistribution
  };
}

function emptyRegimeExpectation() {
  return {
    label: "Needs data",
    sample: 0,
    drift: 0,
    recentHighRate: null,
    previousHighRate: null,
    tokens: [],
    distribution: distributionFromValues([])
  };
}

function distributionDrift(left, right) {
  if (!PREDICTION_BANDS.some((band) => Number.isFinite(right[band.key]))) {
    return 0;
  }

  const total = PREDICTION_BANDS.reduce((sum, band) => {
    return sum + Math.abs((left[band.key] || 0) - (right[band.key] || 0));
  }, 0);

  return total / 2;
}

function highBandRate(probabilities) {
  return (probabilities.ten_to_50 || 0) + (probabilities.fifty_plus || 0);
}

function regimeLabel(recentHighRate, previousHighRate, drift) {
  if (!Number.isFinite(recentHighRate) || !Number.isFinite(previousHighRate)) {
    return "Needs data";
  }

  if (drift < 0.06) {
    return "Stable regime";
  }

  if (recentHighRate > previousHighRate) {
    return "Hotter high-band regime";
  }

  return "Cooler high-band regime";
}

function lagExpectation(values, tokens, maxLag) {
  const scan = scanLagSimilarity(tokens, maxLag);
  const bestLag = scan.bestLag;

  if (!bestLag || values.length <= bestLag.lag) {
    return {
      bestLag,
      lift: bestLag?.lift || null,
      values: [],
      distribution: distributionFromValues([])
    };
  }

  const referenceToken = tokens[values.length - bestLag.lag];
  const matchedValues = [];

  for (let index = bestLag.lag; index < values.length; index += 1) {
    if (tokens[index - bestLag.lag] === referenceToken) {
      matchedValues.push(values[index]);
    }
  }

  return {
    bestLag,
    lift: bestLag.lift,
    referenceToken,
    values: matchedValues,
    distribution: distributionFromValues(matchedValues)
  };
}

function emptyLagExpectation() {
  return {
    bestLag: null,
    lift: null,
    values: [],
    distribution: distributionFromValues([])
  };
}

function normalizeModelWeights(models) {
  const totalWeight = models.reduce((total, model) => total + model.rawWeight, 0);

  return models.map((model) => ({
    ...model,
    weight: totalWeight ? model.rawWeight / totalWeight : 0
  }));
}

function blendModelProbabilities(models) {
  if (!models.length) {
    return emptyBandMap(null);
  }

  const probabilities = emptyBandMap(0);

  models.forEach((model) => {
    PREDICTION_BANDS.forEach((band) => {
      probabilities[band.key] += (model.distribution[band.key] || 0) * model.weight;
    });
  });

  return probabilities;
}

function topProbabilityBand(probabilities) {
  return PREDICTION_BANDS
    .map((band) => ({
      ...band,
      probability: probabilities[band.key]
    }))
    .filter((band) => Number.isFinite(band.probability))
    .sort((a, b) => b.probability - a.probability)[0] || null;
}

function backtestPrediction(values, options = state.analytics) {
  const cleanValues = values.filter(Number.isFinite);
  const lookback = clampInteger(Number(options.predictionLookback), 3, 10, 5);
  const requestedCases = clampInteger(Number(options.predictionBacktest), 50, 1000, 250);
  const firstTarget = Math.max(60, lookback + 30);
  const availableCases = Math.max(0, cleanValues.length - firstTarget);
  const caseCount = Math.min(requestedCases, availableCases);

  if (caseCount <= 0) {
    return {
      cases: 0,
      accuracy: null,
      baselineAccuracy: null,
      averageActualProbability: null,
      baselineAverageActualProbability: null
    };
  }

  let correct = 0;
  let baselineCorrect = 0;
  let probabilityTotal = 0;
  let baselineProbabilityTotal = 0;

  const startTarget = cleanValues.length - caseCount;
  for (let targetIndex = startTarget; targetIndex < cleanValues.length; targetIndex += 1) {
    const training = cleanValues.slice(0, targetIndex);
    const actualBand = bandForValue(cleanValues[targetIndex]);
    const prediction = buildPredictionForValues(training, {
      ...options,
      skipLagModel: true
    });
    const baseline = distributionFromValues(training);
    const topBand = topProbabilityBand(prediction.probabilities);
    const baselineTopBand = topProbabilityBand(baseline.probabilities);

    if (topBand?.key === actualBand.key) {
      correct += 1;
    }

    if (baselineTopBand?.key === actualBand.key) {
      baselineCorrect += 1;
    }

    probabilityTotal += prediction.probabilities[actualBand.key] || 0;
    baselineProbabilityTotal += baseline.probabilities[actualBand.key] || 0;
  }

  return {
    cases: caseCount,
    accuracy: correct / caseCount,
    baselineAccuracy: baselineCorrect / caseCount,
    averageActualProbability: probabilityTotal / caseCount,
    baselineAverageActualProbability: baselineProbabilityTotal / caseCount
  };
}

function backtestModelLeaderboard(values, options = state.analytics) {
  const cleanValues = values.filter(Number.isFinite);
  const lookback = clampInteger(Number(options.predictionLookback), 3, 10, 5);
  const requestedCases = clampInteger(Number(options.predictionBacktest), 50, 1000, 250);
  const firstTarget = Math.max(60, lookback + 30);
  const availableCases = Math.max(0, cleanValues.length - firstTarget);
  const caseCount = Math.min(requestedCases, availableCases);
  const models = {
    baseline: makeLeaderboardEntry("baseline", "All-record baseline"),
    recent: makeLeaderboardEntry("recent", "Recent window"),
    similar: makeLeaderboardEntry("similar", "Nearest patterns"),
    markov: makeLeaderboardEntry("markov", "Markov transition"),
    regime: makeLeaderboardEntry("regime", "Rolling regime"),
    ensemble: makeLeaderboardEntry("ensemble", "Weighted ensemble")
  };

  if (caseCount <= 0) {
    return Object.values(models);
  }

  const startTarget = cleanValues.length - caseCount;
  for (let targetIndex = startTarget; targetIndex < cleanValues.length; targetIndex += 1) {
    const training = cleanValues.slice(0, targetIndex);
    const actualBand = bandForValue(cleanValues[targetIndex]);
    const prediction = buildPredictionForValues(training, {
      ...options,
      skipLagModel: true
    });

    recordLeaderboardModel(models.baseline, prediction.baseline.probabilities, actualBand);
    recordLeaderboardModel(models.recent, prediction.recent.probabilities, actualBand, prediction.recent.sample >= 30);
    recordLeaderboardModel(
      models.similar,
      weightedDistributionFromOutcomes(prediction.similar.matches).probabilities,
      actualBand,
      prediction.similar.matches.length > 0
    );
    recordLeaderboardModel(models.markov, prediction.markov.distribution.probabilities, actualBand, prediction.markov.sample >= 5);
    recordLeaderboardModel(models.regime, prediction.regime.distribution.probabilities, actualBand, prediction.regime.sample >= 30);
    recordLeaderboardModel(models.ensemble, prediction.probabilities, actualBand, prediction.models.length > 0);
  }

  return Object.values(models)
    .map(finalizeLeaderboardEntry)
    .sort((a, b) => (b.accuracy || 0) - (a.accuracy || 0) || b.cases - a.cases);
}

function makeLeaderboardEntry(key, label) {
  return {
    key,
    label,
    cases: 0,
    correct: 0,
    actualProbabilityTotal: 0,
    accuracy: null,
    averageActualProbability: null
  };
}

function recordLeaderboardModel(entry, probabilities, actualBand, include = true) {
  if (!include || !probabilities || !Number.isFinite(probabilities[actualBand.key])) {
    return;
  }

  const topBand = topProbabilityBand(probabilities);
  entry.cases += 1;
  entry.actualProbabilityTotal += probabilities[actualBand.key] || 0;

  if (topBand?.key === actualBand.key) {
    entry.correct += 1;
  }
}

function finalizeLeaderboardEntry(entry) {
  if (!entry.cases) {
    return entry;
  }

  return {
    ...entry,
    accuracy: entry.correct / entry.cases,
    averageActualProbability: entry.actualProbabilityTotal / entry.cases
  };
}

function scorePredictionEvidence(total, prediction, backtest, leaderboard = []) {
  const sampleScore = Math.min(35, (total / 500) * 35);
  const matchScore = Math.min(25, (prediction.similar.matches.length / 30) * 25);
  const backtestVolumeScore = Math.min(15, (backtest.cases / 250) * 15);
  const backtestEdge = Number.isFinite(backtest.accuracy) && Number.isFinite(backtest.baselineAccuracy)
    ? Math.max(0, backtest.accuracy - backtest.baselineAccuracy)
    : 0;
  const bestModel = leaderboard.find((model) => model.key !== "baseline" && Number.isFinite(model.accuracy));
  const baselineModel = leaderboard.find((model) => model.key === "baseline");
  const leaderboardEdge = bestModel && baselineModel && Number.isFinite(baselineModel.accuracy)
    ? Math.max(0, bestModel.accuracy - baselineModel.accuracy)
    : 0;
  const backtestEdgeScore = Math.min(18, backtestEdge * 140);
  const leaderboardScore = Math.min(12, leaderboardEdge * 100);
  const score = Math.round(sampleScore + matchScore + backtestVolumeScore + backtestEdgeScore + leaderboardScore);

  return {
    score,
    label: evidenceLabel(score, total, backtest.cases)
  };
}

function evidenceLabel(score, total, backtestCases) {
  if (total < 100 || backtestCases < 25) {
    return "Needs data";
  }

  if (score >= 75) {
    return "Strong evidence";
  }

  if (score >= 50) {
    return "Developing evidence";
  }

  if (score >= 25) {
    return "Exploratory";
  }

  return "Weak evidence";
}

function buildPredictionNotes(total, prediction, backtest, evidence, leaderboard = []) {
  if (total < 60) {
    return [
      "Collect at least 60 records before the Prediction Lab can run a basic backtest.",
      "The app will not produce confident language until it has enough local records to compare against history.",
      "No external or invented data is used."
    ];
  }

  const notes = [
    `Prediction is grounded in ${total} captured record${total === 1 ? "" : "s"} and ${backtest.cases} historical backtest case${backtest.cases === 1 ? "" : "s"}.`
  ];

  if (prediction.topBand) {
    notes.push(`Current top empirical band is ${prediction.topBand.label} at ${formatPercent(prediction.topBand.probability)}.`);
  }

  notes.push(`Nearest-pattern model found ${prediction.similar.matches.length} historical window${prediction.similar.matches.length === 1 ? "" : "s"} at ${Math.round(prediction.minSimilarity * 100)}%+ bin similarity.`);

  if (prediction.lag.bestLag && prediction.lag.values.length) {
    notes.push(`Lag-cycle model used ${prediction.lag.values.length} prior cases linked to the current ${prediction.lag.referenceToken} lag reference.`);
  }

  if (prediction.markov.sample >= 5) {
    notes.push(`Markov transition model found ${prediction.markov.sample} historical next outcomes after the current ${prediction.markov.currentToken} band.`);
  }

  if (prediction.regime.sample >= 30) {
    notes.push(`Rolling regime is ${prediction.regime.label.toLowerCase()} across the latest ${prediction.regime.sample} records.`);
  }

  if (Number.isFinite(backtest.accuracy)) {
    notes.push(`Backtest top-band accuracy is ${formatPercent(backtest.accuracy)} versus ${formatPercent(backtest.baselineAccuracy)} for the all-record baseline.`);
  }

  const bestModel = leaderboard.find((model) => model.cases > 0 && Number.isFinite(model.accuracy));
  if (bestModel) {
    notes.push(`Leaderboard leader is ${bestModel.label} at ${formatPercent(bestModel.accuracy)} across ${bestModel.cases} tested cases.`);
  }

  if (evidence.label === "Needs data" || evidence.label === "Weak evidence") {
    notes.push("Evidence is not strong enough to treat the probability bands as an edge.");
  }

  notes.push("These are empirical probabilities from captured records only, not a guaranteed forecast or betting instruction.");
  return notes;
}

function analyzeLiveSignal(records, prediction, patternAnalysis, options = state.analytics) {
  const sequence = normalizeSignalRecords(records);
  const values = sequence.map((record) => record.value);
  const quality = analyzeDataQuality(sequence, prediction);
  const repeat = latestRepeatSignal(values, clampInteger(Number(options.predictionLookback), 3, 10, 5));
  const history = buildSignalHistory(sequence, options);
  const latest = sequence[sequence.length - 1] || null;
  const topBand = prediction.topBand || null;
  const status = chooseLiveStatus({
    total: sequence.length,
    quality,
    repeat,
    prediction,
    patternAnalysis
  });

  return {
    total: sequence.length,
    status,
    quality,
    repeat,
    history,
    topBand,
    latest,
    latestSource: latest ? sourceLabel(latest) : "-",
    predictionEvidence: prediction.evidence
  };
}

function normalizeSignalRecords(records) {
  return (records || [])
    .map((record) => ({
      ...record,
      value: Number(record.value)
    }))
    .filter((record) => Number.isFinite(record.value));
}

function analyzeDataQuality(records, prediction) {
  const total = records.length;
  const latest = records[total - 1] || null;
  const latestTime = latest?.capturedAt ? new Date(latest.capturedAt).getTime() : NaN;
  const ageMinutes = Number.isFinite(latestTime) ? (Date.now() - latestTime) / 60000 : null;
  const validIds = records.filter((record) => record.id).length;
  const uniqueIds = new Set(records.map((record) => record.id).filter(Boolean)).size;
  const duplicateIds = Math.max(0, validIds - uniqueIds);
  const sourceCount = new Set(records.map(sourceKey)).size;
  const backtestCases = prediction.backtest?.cases || 0;
  const sampleScore = Math.min(35, (total / 300) * 35);
  const freshnessScore = freshnessPoints(ageMinutes);
  const cleanlinessScore = total ? Math.max(0, 15 - duplicateIds * 3) : 0;
  const sourceScore = total ? (sourceCount > 0 ? 12 : 6) : 0;
  const backtestScore = Math.min(18, (backtestCases / 200) * 18);
  const score = Math.round(sampleScore + freshnessScore + cleanlinessScore + sourceScore + backtestScore);
  const notes = [];

  if (total < 60) {
    notes.push(`Only ${total} records available; 60+ are needed for basic signal review.`);
  } else {
    notes.push(`${total} records available for signal review.`);
  }

  if (ageMinutes == null) {
    notes.push("Latest capture time is unavailable.");
  } else if (ageMinutes <= 10) {
    notes.push("Latest capture is fresh.");
  } else if (ageMinutes <= 60) {
    notes.push(`Latest capture is ${Math.round(ageMinutes)} minutes old.`);
  } else {
    notes.push("Latest capture is stale; refresh collection before acting on live status.");
  }

  if (duplicateIds > 0) {
    notes.push(`${duplicateIds} duplicate record id${duplicateIds === 1 ? "" : "s"} detected.`);
  }

  if (sourceCount > 1) {
    notes.push(`${sourceCount} sources are mixed; use source breakdown before comparing rooms.`);
  } else if (sourceCount === 1) {
    notes.push("One source is active in the current dataset.");
  }

  if (backtestCases < 50) {
    notes.push("Backtest sample is thin; signals stay low-confidence.");
  } else {
    notes.push(`${backtestCases} backtest cases available.`);
  }

  return {
    score,
    label: qualityLabel(score, total),
    ageMinutes,
    duplicateIds,
    sourceCount,
    backtestCases,
    notes
  };
}

function freshnessPoints(ageMinutes) {
  if (!Number.isFinite(ageMinutes)) {
    return 0;
  }

  if (ageMinutes <= 10) {
    return 20;
  }

  if (ageMinutes <= 60) {
    return 12;
  }

  if (ageMinutes <= 360) {
    return 6;
  }

  return 0;
}

function qualityLabel(score, total) {
  if (total < 60) {
    return "Needs data";
  }

  if (score >= 80) {
    return "Strong";
  }

  if (score >= 60) {
    return "Good";
  }

  if (score >= 40) {
    return "Fair";
  }

  return "Weak";
}

function latestRepeatSignal(values, length) {
  if (values.length < length * 2) {
    return {
      repeated: false,
      count: 0,
      length,
      sequence: [],
      label: "Needs data"
    };
  }

  const tokens = values.map(binMultiplier);
  const latest = tokens.slice(-length);
  const latestKey = latest.join("|");
  let count = 0;

  for (let index = 0; index <= tokens.length - length; index += 1) {
    if (tokens.slice(index, index + length).join("|") === latestKey) {
      count += 1;
    }
  }

  return {
    repeated: count > 1,
    count,
    length,
    sequence: latest,
    label: count > 1 ? `Repeated ${count}x` : "No repeat"
  };
}

function chooseLiveStatus(context) {
  const { total, quality, repeat, prediction } = context;

  if (total < 60 || quality.score < 40) {
    return {
      label: "Needs data",
      tone: "low",
      reason: "STREAK needs more fresh, clean records before a live signal is useful."
    };
  }

  if (quality.score < 60) {
    return {
      label: "Data quality warning",
      tone: "watch",
      reason: "The dataset is usable, but quality checks are limiting signal confidence."
    };
  }

  if (repeat.repeated && prediction.evidence.score >= 50) {
    return {
      label: "Repeated sequence detected",
      tone: "strong",
      reason: `The latest ${repeat.length}-round binned sequence appeared ${repeat.count} times and model evidence is ${formatScore(prediction.evidence.score)}.`
    };
  }

  if (prediction.evidence.score >= 75) {
    return {
      label: "Strong historical match",
      tone: "strong",
      reason: "Current probability bands are backed by stronger sample, backtest, and pattern evidence."
    };
  }

  if (prediction.similar.matches.length >= 10 && prediction.evidence.score >= 45) {
    return {
      label: "Pattern forming",
      tone: "watch",
      reason: `${prediction.similar.matches.length} similar historical windows support the current probability profile.`
    };
  }

  return {
    label: "Monitoring",
    tone: "low",
    reason: "No strong live signal is active; STREAK is monitoring the latest captured records."
  };
}

function buildSignalHistory(records, options = state.analytics) {
  const values = records.map((record) => record.value);
  const lookback = clampInteger(Number(options.predictionLookback), 3, 10, 5);
  const firstTarget = Math.max(60, lookback * 2);
  const rows = [];

  const startIndex = Math.max(firstTarget, values.length - 600);

  for (let targetIndex = startIndex; targetIndex < values.length - 1; targetIndex += 1) {
    const trainingValues = values.slice(0, targetIndex + 1);
    const prediction = buildPredictionForValues(trainingValues, {
      ...options,
      skipLagModel: true
    });
    const repeat = latestRepeatSignal(trainingValues, lookback);
    const signal = historicalSignalLabel(prediction, repeat);

    if (!signal) {
      continue;
    }

    rows.push({
      capturedAt: records[targetIndex].capturedAt,
      source: sourceLabel(records[targetIndex]),
      signal,
      evidenceScore: historicalSignalScore(prediction, repeat),
      topBand: prediction.topBand?.label || "-",
      nextValue: values[targetIndex + 1],
      nextBand: bandForValue(values[targetIndex + 1]).label
    });
  }

  return rows.slice(-60).reverse();
}

function historicalSignalScore(prediction, repeat) {
  const repeatScore = repeat.repeated ? Math.min(35, repeat.count * 9) : 0;
  const matchScore = Math.min(30, prediction.similar.matches.length * 2);
  const markovScore = Math.min(20, prediction.markov.sample);
  const regimeScore = prediction.regime.drift >= 0.12 ? Math.min(15, prediction.regime.drift * 100) : 0;
  return Math.round(Math.min(100, repeatScore + matchScore + markovScore + regimeScore));
}

function historicalSignalLabel(prediction, repeat) {
  if (repeat.repeated && prediction.similar.matches.length >= 5) {
    return `Repeated sequence ${repeat.count}x`;
  }

  if (prediction.similar.matches.length >= 15) {
    return "Similar pattern cluster";
  }

  if (prediction.markov.sample >= 20) {
    return "Markov transition sample";
  }

  if (prediction.regime.sample >= 30 && prediction.regime.drift >= 0.12) {
    return prediction.regime.label;
  }

  return "";
}

function analyzePatterns(records, options = state.analytics) {
  const threshold = clampValue(Number(options.threshold), 2, 1000, 10);
  const sequenceLength = clampInteger(Number(options.sequenceLength), 4, 10, 5);
  const maxLag = clampInteger(Number(options.maxLag), 20, 1000, 240);
  const boardWindow = clampInteger(Number(options.boardWindow), 100, 2000, 600);
  const sequence = records
    .map((record) => ({
      ...record,
      value: Number(record.value)
    }))
    .filter((record) => Number.isFinite(record.value))
    .map((record, index) => ({
      ...record,
      index
    }));
  const highHits = sequence.filter((record) => record.value >= threshold);
  const hitIndexes = highHits.map((record) => record.index);
  const gaps = [];

  for (let index = 1; index < hitIndexes.length; index += 1) {
    gaps.push(hitIndexes[index] - hitIndexes[index - 1] - 1);
  }

  const board = sequence.slice(-boardWindow);
  const columnCount = 20;
  const positionBuckets = Array.from({ length: columnCount }, (_, index) => ({
    label: String(index + 1),
    total: 0,
    hits: 0
  }));

  sequence.forEach((record, index) => {
    const bucket = positionBuckets[index % columnCount];
    bucket.total += 1;
    if (record.value >= threshold) {
      bucket.hits += 1;
    }
  });

  const afterHit = analyzeAfterHit(sequence, hitIndexes, 5, threshold);
  const sources = analyzeSources(sequence, threshold);
  const recycle = analyzeRecycling(sequence, {
    threshold,
    sequenceLength,
    maxLag
  });
  const enterpriseModel = analyzeEnterpriseHighOdds(sequence, threshold);
  const currentGap = hitIndexes.length ? sequence.length - 1 - hitIndexes[hitIndexes.length - 1] : sequence.length;
  const clusteredHits = gaps.filter((gap) => gap <= 5).length;
  const avgGap = meanSafe(gaps);
  const medianGap = medianSafe(gaps);
  const analysis = {
    sequence,
    threshold,
    sequenceLength,
    maxLag,
    boardWindow,
    highHits,
    over10: highHits,
    gaps,
    board,
    positionBuckets,
    after10: afterHit,
    afterHit,
    sources,
    recycle,
    enterpriseModel,
    total: sequence.length,
    hitCount: highHits.length,
    hitRate: ratio(highHits.length, sequence.length),
    avgGap,
    medianGap,
    currentGap,
    longestGap: gaps.length ? Math.max(...gaps) : null,
    shortestGap: gaps.length ? Math.min(...gaps) : null,
    clusteredHits
  };

  return {
    ...analysis,
    notes: buildPatternNotes(analysis)
  };
}

function analyzeAfterHit(sequence, hitIndexes, maxOffset, threshold) {
  return Array.from({ length: maxOffset }, (_, offsetIndex) => {
    const offset = offsetIndex + 1;
    const values = hitIndexes
      .map((hitIndex) => sequence[hitIndex + offset]?.value)
      .filter(Number.isFinite);

    return {
      offset,
      count: values.length,
      average: meanSafe(values),
      over2Rate: ratio(values.filter((value) => value >= 2).length, values.length),
      overHighRate: ratio(values.filter((value) => value >= threshold).length, values.length),
      over10Rate: ratio(values.filter((value) => value >= threshold).length, values.length)
    };
  });
}

function analyzeSources(sequence, threshold) {
  const bySource = new Map();

  sequence.forEach((record) => {
    const key = sourceKey(record);
    const source = bySource.get(key) || {
      key,
      label: sourceLabel(record),
      records: [],
      values: []
    };
    source.records.push(record);
    source.values.push(record.value);
    bySource.set(key, source);
  });

  return [...bySource.values()]
    .map((source) => {
      const hitIndexes = [];
      source.values.forEach((value, index) => {
        if (value >= threshold) {
          hitIndexes.push(index);
        }
      });
      const gaps = [];
      for (let index = 1; index < hitIndexes.length; index += 1) {
        gaps.push(hitIndexes[index] - hitIndexes[index - 1] - 1);
      }

      const hitCount = source.values.filter((value) => value >= threshold).length;

      return {
        ...source,
        count: source.values.length,
        hitCount,
        hitRate: ratio(hitCount, source.values.length),
        averageGap: meanSafe(gaps)
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

function analyzeEnterpriseHighOdds(sequence, threshold, options = {}) {
  const highHits = sequence.filter((record) => record.value >= threshold);
  const events = highHits.map((record, hitIndex) => {
    const previous = highHits[hitIndex - 1] || null;
    const previousPrevious = highHits[hitIndex - 2] || null;
    const between = previous ? sequence.slice(previous.index + 1, record.index) : sequence.slice(0, record.index);
    const gap = previous ? record.index - previous.index - 1 : null;
    const previousGap = previous && previousPrevious ? previous.index - previousPrevious.index - 1 : null;

    return {
      number: hitIndex + 1,
      record,
      previous,
      leadIn: previous ? null : record.index,
      gap,
      previousGap,
      gapDelta: Number.isFinite(gap) && Number.isFinite(previousGap) ? gap - previousGap : null,
      valueDelta: previous ? record.value - previous.value : null,
      between: summarizeBetweenWindow(between, threshold),
      source: sourceLabel(record)
    };
  });
  const gaps = events.map((event) => event.gap).filter(Number.isFinite);
  const gapDeltas = events.map((event) => event.gapDelta).filter(Number.isFinite);
  const valueDeltas = events.map((event) => event.valueDelta).filter(Number.isFinite);
  const betweenValues = events.flatMap((event) => event.between.values);
  const currentGap = highHits.length ? sequence.length - 1 - highHits[highHits.length - 1].index : sequence.length;
  const avgGap = meanSafe(gaps);
  const medianGap = medianSafe(gaps);
  const gapVolatility = standardDeviation(gaps);
  const betweenAverage = meanSafe(betweenValues);
  const sources = summarizeEnterpriseSources(highHits);
  const currentWindowStart = highHits.length ? highHits[highHits.length - 1].index + 1 : 0;
  const currentWindow = summarizeBetweenWindow(sequence.slice(currentWindowStart), threshold);
  const baseModel = {
    sequence,
    total: sequence.length,
    threshold,
    thresholdLabel: formatThreshold(threshold),
    highHits,
    hitCount: highHits.length,
    hitRate: ratio(highHits.length, sequence.length),
    events,
    gaps,
    gapDeltas,
    valueDeltas,
    currentGap,
    avgGap,
    medianGap,
    gapVolatility,
    betweenAverage,
    currentWindow,
    sources,
    clusters: gaps.filter((gap) => gap <= 5).length,
    tailHits: highHits.filter((record) => record.value >= 50).length
  };
  const model = {
    ...baseModel,
    pressure: analyzeNextHighOddsPressure(baseModel, threshold)
  };

  return {
    ...model,
    notes: options.includeNotes === false ? [] : buildEnterpriseNotes(model)
  };
}

function summarizeBetweenWindow(records, threshold) {
  const values = records.map((record) => Number(record.value)).filter(Number.isFinite);
  const bandCounts = new Map();
  let longestUnder2 = 0;
  let currentUnder2 = 0;

  values.forEach((value) => {
    const band = binMultiplier(value);
    bandCounts.set(band, (bandCounts.get(band) || 0) + 1);

    if (value < 2) {
      currentUnder2 += 1;
      longestUnder2 = Math.max(longestUnder2, currentUnder2);
      return;
    }

    currentUnder2 = 0;
  });

  const dominantBand = [...bandCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

  return {
    count: values.length,
    values,
    average: meanSafe(values),
    median: medianSafe(values),
    max: values.length ? Math.max(...values) : null,
    over2Rate: ratio(values.filter((value) => value >= 2).length, values.length),
    over5Rate: ratio(values.filter((value) => value >= 5).length, values.length),
    overHighRate: ratio(values.filter((value) => value >= threshold).length, values.length),
    nearHighRate: ratio(values.filter((value) => value >= Math.max(5, threshold / 2) && value < threshold).length, values.length),
    dominantBand,
    longestUnder2
  };
}

function summarizeEnterpriseSources(highHits) {
  const sources = new Map();

  highHits.forEach((record) => {
    const key = sourceKey(record);
    const source = sources.get(key) || {
      key,
      label: sourceLabel(record),
      count: 0,
      max: null
    };
    source.count += 1;
    source.max = Math.max(source.max || 0, record.value);
    sources.set(key, source);
  });

  return [...sources.values()].sort((a, b) => b.count - a.count);
}

function analyzeNextHighOddsPressure(model, threshold) {
  const thresholdLabel = model.thresholdLabel;
  const components = [
    buildGapPercentileComponent(model),
    buildGapDeviationComponent(model),
    buildHazardEchoComponent(model),
    buildDeltaTrendComponent(model),
    buildClusterPulseComponent(model),
    buildBetweenStrengthComponent(model, threshold),
    buildNearMissDensityComponent(model, threshold),
    buildColdStreakStressComponent(model),
    buildRecentPaceComponent(model),
    buildVolatilityRegimeComponent(model, threshold),
    buildSourceEdgeComponent(model)
  ];
  const usable = components.filter((component) => Number.isFinite(component.score));
  const usableWeight = usable.reduce((total, component) => total + component.weight, 0);
  const rawScore = usableWeight
    ? usable.reduce((total, component) => total + component.score * component.weight, 0) / usableWeight
    : null;
  const confidence = pressureSampleConfidence(model, usable.length, components.length);
  const score = Number.isFinite(rawScore) ? 50 + (rawScore - 50) * (confidence / 100) : null;
  const status = pressureStatus(score, confidence, model.hitCount);
  const formula = "0.16Gp + 0.11Gz + 0.12H + 0.10D + 0.07C + 0.10B + 0.10N + 0.07S + 0.10P + 0.05V + 0.02R";

  return {
    thresholdLabel,
    rawScore,
    score,
    confidence,
    status,
    formula,
    components,
    reason: buildPressureReason({
      components,
      confidence,
      score,
      status,
      thresholdLabel,
      hitCount: model.hitCount,
      total: model.total
    })
  };
}

function buildGapPercentileComponent(model) {
  const percentile = empiricalPercentile(model.currentGap, model.gaps);
  const score = Number.isFinite(percentile) ? percentile * 100 : null;

  return {
    key: "gapPercentile",
    label: "Gap Percentile",
    weight: 0.16,
    score,
    evidence: Number.isFinite(percentile)
      ? `current gap ${model.currentGap} is above ${formatPercent(percentile)} of completed threshold gaps`
      : "not enough completed threshold gaps for percentile scoring"
  };
}

function buildGapDeviationComponent(model) {
  const divisor = Number.isFinite(model.gapVolatility) && model.gapVolatility > 0 ? model.gapVolatility : null;
  const zScore = divisor && Number.isFinite(model.medianGap) ? (model.currentGap - model.medianGap) / divisor : null;
  const score = Number.isFinite(zScore) ? clampValue(50 + zScore * 22, 0, 100, 50) : null;

  return {
    key: "gapDeviation",
    label: "Gap Deviation",
    weight: 0.11,
    score,
    evidence: Number.isFinite(zScore)
      ? `current gap is ${zScore.toFixed(2)} standard deviations from the median gap`
      : "not enough gap volatility data for deviation scoring"
  };
}

function buildHazardEchoComponent(model) {
  const gapCenter = model.currentGap;
  const windowRadius = Math.max(1, Math.round((model.medianGap || model.avgGap || 10) * 0.12));
  const lower = Math.max(0, gapCenter - windowRadius);
  const upper = gapCenter + windowRadius;
  const survivors = model.gaps.filter((gap) => gap >= lower);
  const endingsNearCurrent = model.gaps.filter((gap) => gap >= lower && gap <= upper);
  const localHazard = ratio(endingsNearCurrent.length, survivors.length);
  const baselineHazard = model.avgGap ? 1 / (model.avgGap + 1) : model.hitRate;
  const score = Number.isFinite(localHazard) && Number.isFinite(baselineHazard)
    ? clampValue(50 + (localHazard - baselineHazard) * 420, 0, 100, 50)
    : null;

  return {
    key: "hazardEcho",
    label: "Hazard Echo",
    weight: 0.12,
    score,
    evidence: Number.isFinite(localHazard)
      ? `${endingsNearCurrent.length}/${survivors.length} completed gaps that survived this far ended within ${windowRadius} round${windowRadius === 1 ? "" : "s"} of the current gap`
      : "not enough completed gaps for local hazard scoring"
  };
}

function buildDeltaTrendComponent(model) {
  const recentDeltas = model.gapDeltas.slice(-5);
  const averageDelta = meanSafe(recentDeltas);
  const gapScale = Math.max(1, model.medianGap || model.avgGap || 10);
  const score = Number.isFinite(averageDelta) ? clampValue(50 + (-averageDelta / gapScale) * 75, 0, 100, 50) : null;

  return {
    key: "deltaTrend",
    label: "Delta Trend",
    weight: 0.1,
    score,
    evidence: Number.isFinite(averageDelta)
      ? `recent completed gaps are moving by ${formatSignedRounds(averageDelta)} rounds on average`
      : "not enough consecutive gaps for delta trend scoring"
  };
}

function buildClusterPulseComponent(model) {
  const recentGaps = model.gaps.slice(-6);
  const smallGapLimit = Math.max(2, Math.min(5, Math.round((model.medianGap || model.avgGap || 10) * 0.35)));
  const recentClusterRate = ratio(recentGaps.filter((gap) => gap <= smallGapLimit).length, recentGaps.length);
  const currentBoost = model.currentGap <= smallGapLimit && model.hitCount > 0 ? 0.35 : 0;
  const score = Number.isFinite(recentClusterRate) ? clampValue((recentClusterRate + currentBoost) * 100, 0, 100, 50) : null;

  return {
    key: "clusterPulse",
    label: "Cluster Pulse",
    weight: 0.07,
    score,
    evidence: Number.isFinite(recentClusterRate)
      ? `${formatPercent(recentClusterRate)} of recent completed gaps were ${smallGapLimit} rounds or shorter`
      : "not enough recent gaps for cluster scoring"
  };
}

function buildBetweenStrengthComponent(model, threshold) {
  const current = model.currentWindow;
  const historicalWindows = model.events.map((event) => event.between).filter((between) => between.count > 0);

  if (!current.count || historicalWindows.length < 2) {
    return {
      key: "betweenStrength",
      label: "Between Strength",
      weight: 0.1,
      score: null,
      evidence: "not enough current and historical between-hit windows for scoring"
    };
  }

  const historicalAverage = meanSafe(historicalWindows.map((between) => between.average));
  const historicalOver2Rate = meanSafe(historicalWindows.map((between) => between.over2Rate));
  const historicalNearHighRate = meanSafe(historicalWindows.map((between) => between.nearHighRate));
  const averageLiftScore = Number.isFinite(historicalAverage) && historicalAverage > 0
    ? clampValue((current.average / historicalAverage) * 50, 0, 100, 50)
    : null;
  const over2Score = Number.isFinite(current.over2Rate) && Number.isFinite(historicalOver2Rate)
    ? clampValue(50 + (current.over2Rate - historicalOver2Rate) * 100, 0, 100, 50)
    : null;
  const nearHighScore = Number.isFinite(current.nearHighRate) && Number.isFinite(historicalNearHighRate)
    ? clampValue(50 + (current.nearHighRate - historicalNearHighRate) * 140, 0, 100, 50)
    : null;
  const maxScore = Number.isFinite(current.max) ? clampValue((current.max / threshold) * 100, 0, 100, 50) : null;
  const score = meanSafe([averageLiftScore, over2Score, nearHighScore, maxScore]);

  return {
    key: "betweenStrength",
    label: "Between Strength",
    weight: 0.1,
    score,
    evidence: Number.isFinite(score)
      ? `current between-window averages ${formatMultiplier(current.average)}, maxes at ${formatMultiplier(current.max)}, and has ${formatPercent(current.over2Rate)} 2x+ rate`
      : "current between-window strength is unavailable"
  };
}

function buildNearMissDensityComponent(model, threshold) {
  const current = model.currentWindow;
  const historicalWindows = model.events.map((event) => event.between).filter((between) => between.count > 0);
  const historicalNearHighRate = meanSafe(historicalWindows.map((between) => between.nearHighRate));
  const nearMissFloor = Math.max(2, Math.min(threshold - 0.01, Math.max(5, threshold * 0.6)));
  const currentNearMisses = current.values.filter((value) => value >= nearMissFloor && value < threshold).length;
  const maxRatio = Number.isFinite(current.max) ? current.max / threshold : null;
  const rateScore = Number.isFinite(current.nearHighRate) && Number.isFinite(historicalNearHighRate)
    ? clampValue(50 + (current.nearHighRate - historicalNearHighRate) * 180, 0, 100, 50)
    : null;
  const maxScore = Number.isFinite(maxRatio) ? clampValue(30 + maxRatio * 70, 0, 100, 50) : null;
  const score = meanSafe([rateScore, maxScore]);

  return {
    key: "nearMissDensity",
    label: "Near-Miss Density",
    weight: 0.1,
    score,
    evidence: Number.isFinite(score)
      ? `${currentNearMisses} current between-window value${currentNearMisses === 1 ? "" : "s"} reached ${formatMultiplier(nearMissFloor)} to below ${model.thresholdLabel}`
      : "not enough current and historical near-threshold activity for scoring"
  };
}

function buildColdStreakStressComponent(model) {
  const currentValues = model.currentWindow.values;
  const trailingUnder2 = trailingStreak(currentValues, (value) => value < 2);
  const historicalUnder2Runs = model.events
    .map((event) => event.between.longestUnder2)
    .filter(Number.isFinite);
  const percentile = empiricalPercentile(trailingUnder2, historicalUnder2Runs);
  const under2Rate = ratio(currentValues.filter((value) => value < 2).length, currentValues.length);
  const streakScore = Number.isFinite(percentile) ? percentile * 100 : null;
  const rateScore = Number.isFinite(under2Rate) ? clampValue(under2Rate * 100, 0, 100, 50) : null;
  const score = meanSafe([streakScore, rateScore]);

  return {
    key: "coldStreakStress",
    label: "Cold Streak Stress",
    weight: 0.07,
    score,
    evidence: Number.isFinite(score)
      ? `current window has a trailing sub-2x streak of ${trailingUnder2} and ${formatPercent(under2Rate)} sub-2x rate`
      : "not enough between-window low-streak history for scoring"
  };
}

function buildRecentPaceComponent(model) {
  const windowSize = Math.min(model.total, Math.max(40, Math.round((model.avgGap || 20) * 3)));
  const recent = model.sequence.slice(-windowSize);
  const recentHits = recent.filter((record) => record.value >= model.threshold).length;
  const recentRate = ratio(recentHits, recent.length);
  const baselineRate = model.hitRate;
  const score = Number.isFinite(recentRate) && Number.isFinite(baselineRate)
    ? clampValue(50 + (recentRate - baselineRate) * 360, 0, 100, 50)
    : null;

  return {
    key: "recentPace",
    label: "Recent Pace",
    weight: 0.1,
    score,
    evidence: Number.isFinite(recentRate)
      ? `latest ${recent.length} records show ${recentHits} ${model.thresholdLabel}+ event${recentHits === 1 ? "" : "s"} (${formatPercent(recentRate)} vs ${formatPercent(baselineRate)} baseline)`
      : "not enough recent records for pace scoring"
  };
}

function buildVolatilityRegimeComponent(model, threshold) {
  const allValues = model.sequence.map((record) => record.value).filter(Number.isFinite);
  const windowSize = Math.min(allValues.length, Math.max(40, Math.round((model.avgGap || 20) * 2)));
  const recentValues = allValues.slice(-windowSize);
  const recentVolatility = standardDeviation(recentValues);
  const globalVolatility = standardDeviation(allValues);
  const recentEnergy = ratio(recentValues.filter((value) => value >= Math.max(5, threshold / 2)).length, recentValues.length);
  const globalEnergy = ratio(allValues.filter((value) => value >= Math.max(5, threshold / 2)).length, allValues.length);
  const volatilityScore = Number.isFinite(recentVolatility) && Number.isFinite(globalVolatility) && globalVolatility > 0
    ? clampValue((recentVolatility / globalVolatility) * 50, 0, 100, 50)
    : null;
  const energyScore = Number.isFinite(recentEnergy) && Number.isFinite(globalEnergy)
    ? clampValue(50 + (recentEnergy - globalEnergy) * 180, 0, 100, 50)
    : null;
  const score = meanSafe([volatilityScore, energyScore]);

  return {
    key: "volatilityRegime",
    label: "Volatility Regime",
    weight: 0.05,
    score,
    evidence: Number.isFinite(score)
      ? `recent volatility is ${formatRounds(recentVolatility)} with ${formatPercent(recentEnergy)} near-threshold energy`
      : "not enough values for volatility regime scoring"
  };
}

function buildSourceEdgeComponent(model) {
  const latest = model.sequence[model.sequence.length - 1] || null;
  const latestSourceKey = latest ? sourceKey(latest) : "";
  const sourceRecords = latestSourceKey ? model.sequence.filter((record) => sourceKey(record) === latestSourceKey) : [];
  const sourceHits = sourceRecords.filter((record) => record.value >= model.threshold).length;
  const sourceRate = ratio(sourceHits, sourceRecords.length);
  const score = sourceRecords.length >= 25 && Number.isFinite(sourceRate) && Number.isFinite(model.hitRate)
    ? clampValue(50 + (sourceRate - model.hitRate) * 320, 0, 100, 50)
    : null;

  return {
    key: "sourceEdge",
    label: "Source Edge",
    weight: 0.02,
    score,
    evidence: Number.isFinite(score)
      ? `latest source has ${sourceHits}/${sourceRecords.length} ${model.thresholdLabel}+ events (${formatPercent(sourceRate)} vs ${formatPercent(model.hitRate)} overall)`
      : "not enough records from the latest source for source-edge scoring"
  };
}

function pressureSampleConfidence(model, usableComponentCount, componentCount) {
  const eventScore = clampValue((model.hitCount / 12) * 42, 0, 42, 0);
  const recordScore = clampValue((model.total / 500) * 24, 0, 24, 0);
  const gapScore = clampValue((model.gaps.length / 10) * 22, 0, 22, 0);
  const componentScore = clampValue((usableComponentCount / Math.max(1, componentCount)) * 12, 0, 12, 0);
  return Math.round(clampValue(eventScore + recordScore + gapScore + componentScore, 0, 100, 0));
}

function pressureStatus(score, confidence, hitCount) {
  if (!Number.isFinite(score) || confidence < 25 || hitCount < 3) {
    return { label: "Needs Data", tone: "needs-data" };
  }

  if (score >= 75) {
    return { label: "Strong", tone: "strong" };
  }

  if (score >= 60) {
    return { label: "Elevated", tone: "elevated" };
  }

  if (score >= 40) {
    return { label: "Watch", tone: "watch" };
  }

  return { label: "Low", tone: "low" };
}

function buildPressureReason(model) {
  if (model.status.tone === "needs-data") {
    return `Collect more ${model.thresholdLabel}+ events before using the formula; current sample has ${model.hitCount} threshold event${model.hitCount === 1 ? "" : "s"} across ${model.total} records.`;
  }

  const ranked = model.components
    .filter((component) => Number.isFinite(component.score))
    .sort((a, b) => Math.abs(b.score - 50) * b.weight - Math.abs(a.score - 50) * a.weight);
  const lead = ranked[0];
  const support = ranked[1];
  const confidenceText = `sample confidence is ${formatScore(model.confidence)}`;

  if (!lead) {
    return `Pressure is ${model.status.label.toLowerCase()}, but component evidence is still thin; ${confidenceText}.`;
  }

  if (!support) {
    return `Pressure is ${model.status.label.toLowerCase()} because ${lead.evidence}; ${confidenceText}.`;
  }

  return `Pressure is ${model.status.label.toLowerCase()} because ${lead.evidence}, with support from ${support.evidence}; ${confidenceText}.`;
}

function empiricalPercentile(value, values) {
  const clean = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!Number.isFinite(value) || !clean.length) {
    return null;
  }

  const belowOrEqual = clean.filter((item) => item <= value).length;
  return belowOrEqual / clean.length;
}

function buildEnterpriseNotes(model) {
  const thresholdLabel = model.thresholdLabel;

  if (!model.total) {
    return ["No records are available for the enterprise model yet."];
  }

  if (!model.hitCount) {
    return [
      `${thresholdLabel}+ has not appeared in the current ${model.total}-record sample.`,
      "The event sequence will activate after the first threshold hit is captured.",
      "This model is historical diagnostics only, not a guarantee of the next result."
    ];
  }

  const notes = [
    `${thresholdLabel}+ model isolated ${model.hitCount} event${model.hitCount === 1 ? "" : "s"} from ${model.total} records (${formatPercent(model.hitRate)}).`
  ];

  if (model.hitCount < 3) {
    notes.push("Collect at least three threshold events before treating gap deltas as meaningful.");
  }

  if (model.pressure) {
    notes.push(`Next ${thresholdLabel}+ pressure formula is ${model.pressure.status.label.toLowerCase()} at ${formatScore(model.pressure.score)} with ${formatScore(model.pressure.confidence)} sample confidence.`);
  }

  if (Number.isFinite(model.avgGap)) {
    notes.push(`Average inter-event gap is ${formatRounds(model.avgGap)} rounds; median gap is ${formatRounds(model.medianGap)}.`);
  }

  const lastGapEvent = [...model.events].reverse().find((event) => Number.isFinite(event.gapDelta));
  if (lastGapEvent) {
    const direction = lastGapEvent.gapDelta > 0 ? "expanded" : lastGapEvent.gapDelta < 0 ? "compressed" : "held flat";
    notes.push(`Latest completed interval ${direction} by ${Math.abs(lastGapEvent.gapDelta)} round${Math.abs(lastGapEvent.gapDelta) === 1 ? "" : "s"} versus the previous interval.`);
  }

  if (Number.isFinite(model.medianGap)) {
    const pressure = model.currentGap - model.medianGap;
    if (pressure > 0) {
      notes.push(`Current waiting gap is ${formatRounds(pressure)} round${Math.round(pressure) === 1 ? "" : "s"} longer than the median inter-event gap.`);
    } else if (pressure < 0) {
      notes.push(`Current waiting gap is ${formatRounds(Math.abs(pressure))} round${Math.round(Math.abs(pressure)) === 1 ? "" : "s"} shorter than the median inter-event gap.`);
    } else {
      notes.push("Current waiting gap is aligned with the median inter-event gap.");
    }
  }

  if (Number.isFinite(model.gapVolatility) && Number.isFinite(model.avgGap)) {
    const volatilityRatio = model.avgGap ? model.gapVolatility / model.avgGap : null;
    if (volatilityRatio > 0.8) {
      notes.push(`Gap volatility is high at ${formatRounds(model.gapVolatility)} rounds, so intervals are swinging widely.`);
    } else {
      notes.push(`Gap volatility is contained at ${formatRounds(model.gapVolatility)} rounds relative to the average gap.`);
    }
  }

  if (model.clusters > 0) {
    notes.push(`${model.clusters} threshold event${model.clusters === 1 ? "" : "s"} arrived within five rounds of the previous threshold event.`);
  }

  if (model.tailHits > 0) {
    notes.push(`${model.tailHits} event${model.tailHits === 1 ? "" : "s"} reached 50x+, useful for separating extreme-tail spikes from normal ${thresholdLabel}+ events.`);
  }

  const betweenWindows = model.events.map((event) => event.between).filter((between) => between.count > 0);
  const betweenOver2 = meanSafe(betweenWindows.map((between) => between.over2Rate));
  const dominantBand = mostCommonValue(betweenWindows.map((between) => between.dominantBand).filter((band) => band && band !== "-"));
  const longestUnder2 = Math.max(0, ...betweenWindows.map((between) => between.longestUnder2));

  if (Number.isFinite(model.betweenAverage)) {
    notes.push(`Between-event rounds average ${formatMultiplier(model.betweenAverage)} with a mean ${formatPercent(betweenOver2)} 2x+ rate.`);
  }

  if (dominantBand) {
    notes.push(`Most common between-event band is ${dominantBand}; longest sub-2x run inside those windows is ${longestUnder2} rounds.`);
  }

  if (model.sources.length > 1) {
    const topSource = model.sources[0];
    const sourceShare = ratio(topSource.count, model.hitCount);
    notes.push(`Top source for threshold events is ${topSource.label} with ${topSource.count}/${model.hitCount} events (${formatPercent(sourceShare)}).`);
  }

  const lastValueEvent = [...model.events].reverse().find((event) => Number.isFinite(event.valueDelta));
  if (lastValueEvent) {
    const movement = lastValueEvent.valueDelta > 0 ? "higher" : lastValueEvent.valueDelta < 0 ? "lower" : "unchanged";
    notes.push(`Latest ${thresholdLabel}+ value was ${movement} than the previous threshold event by ${formatSignedMultiplier(lastValueEvent.valueDelta)}.`);
  }

  notes.push("These enterprise model outputs describe the captured history only; they do not guarantee the next result.");
  return notes;
}

function analyzeRecycling(sequence, options) {
  const sequenceLength = clampInteger(Number(options.sequenceLength), 4, 10, 5);
  const maxLag = clampInteger(Number(options.maxLag), 20, 1000, 240);
  const values = sequence.map((record) => record.value).filter(Number.isFinite);
  const binnedTokens = values.map(binMultiplier);
  const exactTokens = values.map((value) => `${value.toFixed(2)}x`);
  const repeatedBinned = findRepeatedWindows(binnedTokens, sequenceLength, 10);
  const repeatedExact = findRepeatedWindows(exactTokens, sequenceLength, 10);
  const lagScan = scanLagSimilarity(binnedTokens, maxLag);
  const entropy = normalizedEntropy(binnedTokens);
  const windowCount = Math.max(0, binnedTokens.length - sequenceLength + 1);
  const duplicateRate = ratio(extraOccurrences(repeatedBinned), windowCount) || 0;
  const exactDuplicateRate = ratio(extraOccurrences(repeatedExact), windowCount) || 0;
  const liftBoost = Math.max(0, (lagScan.bestLag?.lift || 1) - 1);
  const lowEntropyBoost = entropy.normalized == null ? 0 : Math.max(0, 0.82 - entropy.normalized);
  const score = Math.min(
    100,
    duplicateRate * 360 + exactDuplicateRate * 720 + Math.min(liftBoost, 2.5) * 22 + lowEntropyBoost * 45
  );

  return {
    score,
    label: signalLabel(score),
    sequenceLength,
    maxLag,
    repeatedBinned,
    repeatedExact,
    lagResults: lagScan.results,
    bestLag: lagScan.bestLag,
    baselineMatchRate: lagScan.baseline,
    entropy,
    duplicateRate,
    exactDuplicateRate
  };
}

function binMultiplier(value) {
  if (value < 1.2) {
    return "1.00-1.19x";
  }

  if (value < 1.5) {
    return "1.20-1.49x";
  }

  if (value < 2) {
    return "1.50-1.99x";
  }

  if (value < 5) {
    return "2.00-4.99x";
  }

  if (value < 10) {
    return "5.00-9.99x";
  }

  if (value < 50) {
    return "10.00-49.99x";
  }

  return "50.00x+";
}

function findRepeatedWindows(tokens, length, limit) {
  if (tokens.length < length) {
    return [];
  }

  const windows = new Map();
  for (let index = 0; index <= tokens.length - length; index += 1) {
    const parts = tokens.slice(index, index + length);
    const key = parts.join(" > ");
    const existing = windows.get(key) || {
      sequence: parts,
      count: 0,
      firstIndex: index,
      lastIndex: index
    };
    existing.count += 1;
    existing.lastIndex = index;
    windows.set(key, existing);
  }

  return [...windows.values()]
    .filter((window) => window.count > 1)
    .sort((a, b) => b.count - a.count || b.lastIndex - a.lastIndex)
    .slice(0, limit);
}

function scanLagSimilarity(tokens, maxLag) {
  const baseline = expectedMatchRate(tokens);
  const limit = Math.min(Math.floor(maxLag), tokens.length - 1);
  const results = [];

  for (let lag = 1; lag <= limit; lag += 1) {
    const sample = tokens.length - lag;
    if (sample < 30) {
      continue;
    }

    let matches = 0;
    for (let index = lag; index < tokens.length; index += 1) {
      if (tokens[index] === tokens[index - lag]) {
        matches += 1;
      }
    }

    const matchRate = ratio(matches, sample) || 0;
    const lift = baseline ? matchRate / baseline : null;
    results.push({
      lag,
      sample,
      matches,
      matchRate,
      lift
    });
  }

  const bestLag = results
    .filter((result) => Number.isFinite(result.lift))
    .sort((a, b) => b.lift - a.lift || b.matchRate - a.matchRate || a.lag - b.lag)[0] || null;

  return {
    baseline,
    results,
    bestLag
  };
}

function expectedMatchRate(tokens) {
  if (!tokens.length) {
    return null;
  }

  const counts = new Map();
  tokens.forEach((token) => {
    counts.set(token, (counts.get(token) || 0) + 1);
  });

  return [...counts.values()].reduce((total, count) => {
    const probability = count / tokens.length;
    return total + probability * probability;
  }, 0);
}

function normalizedEntropy(tokens) {
  if (!tokens.length) {
    return { value: null, normalized: null, unique: 0 };
  }

  const counts = new Map();
  tokens.forEach((token) => {
    counts.set(token, (counts.get(token) || 0) + 1);
  });

  const value = [...counts.values()].reduce((total, count) => {
    const probability = count / tokens.length;
    return total - probability * Math.log2(probability);
  }, 0);
  const max = counts.size > 1 ? Math.log2(counts.size) : 0;

  return {
    value,
    normalized: max ? value / max : null,
    unique: counts.size
  };
}

function extraOccurrences(rows) {
  return rows.reduce((total, row) => total + row.count - 1, 0);
}

function signalLabel(score) {
  if (score >= 75) {
    return "Strong";
  }

  if (score >= 50) {
    return "Elevated";
  }

  if (score >= 25) {
    return "Watch";
  }

  return "Low";
}

function sourceKey(record) {
  if (record.sourceHost) {
    return `${record.sourceHost}${record.sourcePath || ""}`;
  }

  try {
    const url = new URL(record.frameUrl || record.pageUrl || "");
    return `${url.hostname}${url.pathname}`;
  } catch {
    return record.pageTitle || "Unknown source";
  }
}

function sourceLabel(record) {
  if (record.sourceHost) {
    return `${record.sourceHost}${record.sourcePath || ""}`;
  }

  try {
    const url = new URL(record.frameUrl || record.pageUrl || "");
    return `${url.hostname}${url.pathname}`;
  } catch {
    return record.pageTitle || "Unknown source";
  }
}

function buildPatternNotes(analysis) {
  const thresholdLabel = formatThreshold(analysis.threshold);

  if (analysis.total < 50) {
    return [
      "Collect at least 50 records before reading patterns.",
      `Use 200+ records before comparing room behavior or ${thresholdLabel}+ distribution.`,
      "Recycling signals need larger samples because repeated bins can happen naturally."
    ];
  }

  const notes = [
    `${thresholdLabel}+ appeared ${analysis.hitCount} time${analysis.hitCount === 1 ? "" : "s"} in ${analysis.total} records (${formatPercent(analysis.hitRate)}).`
  ];

  if (Number.isFinite(analysis.avgGap)) {
    notes.push(`Average gap between ${thresholdLabel}+ hits is ${analysis.avgGap.toFixed(1)} rounds; median gap is ${formatRounds(analysis.medianGap)}.`);
  }

  if (analysis.currentGap > analysis.avgGap * 1.5 && Number.isFinite(analysis.avgGap)) {
    notes.push(`Current gap is longer than the recent average gap (${analysis.currentGap} rounds since the last ${thresholdLabel}+).`);
  } else if (analysis.currentGap <= 5 && analysis.hitCount > 0) {
    notes.push(`A ${thresholdLabel}+ hit occurred recently (${analysis.currentGap} round${analysis.currentGap === 1 ? "" : "s"} ago).`);
  }

  if (analysis.clusteredHits > 0) {
    notes.push(`${analysis.clusteredHits} ${thresholdLabel}+ hit${analysis.clusteredHits === 1 ? " was" : "s were"} followed by another ${thresholdLabel}+ within 5 rounds.`);
  }

  const strongestPosition = strongestPositionBucket(analysis.positionBuckets);
  if (strongestPosition && strongestPosition.total >= 5) {
    notes.push(`Highest 20-column board rate is column ${strongestPosition.label} at ${formatPercent(strongestPosition.rate)} (${strongestPosition.hits}/${strongestPosition.total}).`);
  }

  if (analysis.sources.length > 1) {
    const topSource = analysis.sources[0];
    notes.push(`Largest source group is ${topSource.label} with ${topSource.count} records and ${formatPercent(topSource.hitRate)} ${thresholdLabel}+ rate.`);
  }

  if (analysis.recycle) {
    notes.push(`Recycle signal is ${analysis.recycle.label.toLowerCase()} at ${formatScore(analysis.recycle.score)} using ${analysis.recycle.sequenceLength}-round fingerprints.`);

    if (analysis.recycle.bestLag) {
      notes.push(`Strongest lag is ${analysis.recycle.bestLag.lag} rounds with ${formatLift(analysis.recycle.bestLag.lift)} cycle lift over the baseline bin-match rate.`);
    }

    if (analysis.recycle.repeatedBinned.length) {
      const topRepeat = analysis.recycle.repeatedBinned[0];
      notes.push(`Most repeated binned fingerprint appeared ${topRepeat.count} times: ${topRepeat.sequence.join(" > ")}.`);
    }

    if (analysis.recycle.repeatedExact.length) {
      const topExact = analysis.recycle.repeatedExact[0];
      notes.push(`Exact rounded fingerprint repeated ${topExact.count} times, which is worth reviewing against the source room/time range.`);
    }
  }

  notes.push("These are descriptive historical diagnostics only; they can flag repetition, but they do not prove recycling or predict the next round.");
  return notes;
}

function strongestPositionBucket(buckets) {
  return buckets
    .map((bucket) => ({
      ...bucket,
      rate: ratio(bucket.hits, bucket.total)
    }))
    .filter((bucket) => Number.isFinite(bucket.rate))
    .sort((a, b) => b.rate - a.rate)[0];
}

function renderLiveSignal(analysis) {
  elements.liveSignalScope.textContent = `${analysis.total} records / ${analysis.history.length} signal event${analysis.history.length === 1 ? "" : "s"}`;
  elements.liveSignalStatus.textContent = analysis.status.label;
  elements.liveSignalStatus.dataset.tone = analysis.status.tone;
  elements.liveEvidenceScore.textContent = formatScore(analysis.predictionEvidence?.score);
  setScoreRing(elements.liveEvidenceRing, elements.liveEvidenceRingValue, analysis.predictionEvidence?.score);
  elements.liveSignalReason.textContent = analysis.status.reason;
  elements.liveTopBand.textContent = analysis.topBand ? `${analysis.topBand.label} (${formatPercent(analysis.topBand.probability)})` : "-";
  elements.liveRepeatStatus.textContent = analysis.repeat.label;
  elements.liveLatestSource.textContent = analysis.latestSource;
  elements.liveLatestCapture.textContent = analysis.latest ? formatDateTime(analysis.latest.capturedAt) : "-";
  elements.liveDataQualityScore.textContent = `${analysis.quality.label} ${formatScore(analysis.quality.score)}`;
  setScoreRing(elements.liveDataQualityRing, elements.liveDataQualityRingValue, analysis.quality.score);
  elements.dataQualityBar.style.width = `${Math.max(0, Math.min(100, analysis.quality.score))}%`;
  elements.dataQualityBar.dataset.quality = qualityTone(analysis.quality.score);

  renderDataQualityNotes(analysis.quality.notes);
  renderSignalHistory(analysis.history);
}

function analyzeStreakBot(records, settings = state.botSettings) {
  const api = getStreakBotApi();
  if (!api?.analyze) {
    return {
      available: false,
      ready: false,
      total: records.length,
      settings,
      latestRecord: records[records.length - 1] || null,
      repeat: { repeated: false, count: 0, length: settings.repeatLength, sequence: [], reason: "Bot module unavailable." },
      currentGap: null,
      avgGap: null,
      recentHighHits: 0,
      triggers: [],
      notes: ["STREAK Bot module is unavailable in this dashboard tab. Reload the extension and reopen the dashboard."]
    };
  }

  const analysis = api.analyze(records, settings);
  return {
    available: true,
    ...analysis,
    notes: buildStreakBotNotes(analysis)
  };
}

function buildStreakBotNotes(analysis) {
  if (!analysis.available) {
    return analysis.notes || ["Bot module unavailable."];
  }

  const thresholdLabel = formatThreshold(analysis.settings.threshold);
  const notes = [];

  if (!analysis.ready) {
    notes.push(`STREAK Bot waits for ${analysis.settings.minRecords} captured records before it can arm alerts.`);
  } else {
    notes.push(`Bot is evaluating repeat, gap, and cluster signals from ${analysis.total} captured records.`);
  }

  if (analysis.repeat.repeated) {
    notes.push(`Latest ${analysis.repeat.length}-round sequence repeated ${analysis.repeat.count} times.`);
  } else {
    notes.push(`No repeated ${analysis.settings.repeatLength}-round sequence is active right now.`);
  }

  if (Number.isFinite(analysis.avgGap)) {
    notes.push(`Current ${thresholdLabel}+ gap is ${analysis.currentGap} rounds versus ${analysis.avgGap.toFixed(1)} average.`);
  } else {
    notes.push(`Need more ${thresholdLabel}+ hits before the gap alert can calibrate.`);
  }

  notes.push(`${analysis.recentHighHits} ${thresholdLabel}+ hit${analysis.recentHighHits === 1 ? "" : "s"} appeared in the latest 12 rounds.`);

  if (analysis.triggers.length) {
    notes.push(`${analysis.triggers.length} live trigger${analysis.triggers.length === 1 ? "" : "s"} currently meet the armed rules.`);
  } else if (analysis.ready) {
    notes.push("No live STREAK Bot trigger is active right now.");
  }

  notes.push("This bot is watch-only. It raises descriptive alerts from captured records and does not execute bets.");
  return notes;
}

function renderStreakBot(bot) {
  const tone = streakBotTone(bot);
  elements.botStatusChip.textContent = botStateLabel(bot);
  elements.botStatusChip.dataset.state = tone;
  elements.clearBotAlertsButton.disabled = state.botLogs.length === 0;
  elements.botPanelScope.textContent = bot.total
    ? `${bot.total} records / ${state.botLogs.length} stored alert${state.botLogs.length === 1 ? "" : "s"}`
    : "Waiting for records";
  elements.botStateValue.textContent = botStateLabel(bot);
  elements.botTriggerCount.textContent = String(bot.triggers.length);
  elements.botRepeatValue.textContent = bot.repeat.repeated ? `${bot.repeat.count}x` : "None";
  elements.botGapValue.textContent = Number.isFinite(bot.avgGap) ? `${bot.currentGap} / ${bot.avgGap.toFixed(1)}` : "-";
  elements.botRecentHitsValue.textContent = String(bot.recentHighHits || 0);
  elements.botAlertsLoggedValue.textContent = String(state.botLogs.length);
  elements.botTriggerState.textContent = bot.triggers.length ? `${bot.triggers.length} live` : (bot.ready ? "Monitoring" : "Needs data");
  elements.botConfidenceLabel.textContent = getConfidenceLabel(bot.total);

  const stateCard = elements.botStateValue.closest(".signal-card");
  if (stateCard) {
    stateCard.dataset.signal = tone;
  }

  renderBotTriggerSummary(bot.triggers);
  renderBotNotes(bot.notes || []);
  renderBotAlerts(state.botLogs);
}

function botStateLabel(bot) {
  if (!bot.available) {
    return "Unavailable";
  }

  if (!state.botSettings.enabled) {
    return "Off";
  }

  if (!bot.ready) {
    return "Waiting";
  }

  return bot.triggers.length ? "Armed" : "Monitoring";
}

function streakBotTone(bot) {
  if (!bot.available) {
    return "paused";
  }

  if (!state.botSettings.enabled) {
    return "paused";
  }

  if (!bot.ready) {
    return "low";
  }

  if (bot.triggers.some((trigger) => trigger.level === "strong")) {
    return "strong";
  }

  if (bot.triggers.length) {
    return "watch";
  }

  return "low";
}

function renderBotTriggerSummary(triggers) {
  if (!triggers.length) {
    elements.botTriggerSummary.replaceChildren(emptyInline("No live STREAK Bot triggers."));
    return;
  }

  elements.botTriggerSummary.replaceChildren(
    ...triggers.map((trigger) => {
      const card = document.createElement("article");
      card.className = "bot-trigger";
      card.dataset.level = trigger.level;

      const top = document.createElement("div");
      top.className = "bot-trigger-top";

      const title = document.createElement("strong");
      title.textContent = trigger.title;

      const badge = document.createElement("span");
      badge.textContent = `${trigger.level} ${formatScore(trigger.score)}`;

      const body = document.createElement("p");
      body.textContent = trigger.message;

      top.append(title, badge);
      card.append(top, body);
      return card;
    })
  );
}

function renderBotNotes(notes) {
  elements.botNotes.replaceChildren(
    ...notes.map((note) => {
      const item = document.createElement("li");
      item.textContent = note;
      return item;
    })
  );
}

function renderBotAlerts(logs) {
  const rows = [...logs].reverse();
  elements.botAlertCount.textContent = `${rows.length} alert${rows.length === 1 ? "" : "s"}`;

  if (!rows.length) {
    renderEmptyRow(elements.botAlertsBody, 5, "No STREAK Bot alerts stored yet.");
    return;
  }

  elements.botAlertsBody.replaceChildren(
    ...rows.slice(0, 40).map((entry) => {
      const tr = document.createElement("tr");
      const signalCell = tableCell(shortText(entry.message, 84), "sequence-cell");
      signalCell.title = entry.message;
      tr.append(
        tableCell(formatDateTime(entry.createdAt)),
        tableCell(entry.kind),
        tableCell(entry.level),
        signalCell,
        tableCell(formatScore(entry.score))
      );
      return tr;
    })
  );
}

function setScoreRing(ring, valueElement, score) {
  const cleanScore = Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : 0;
  ring.style.setProperty("--score", cleanScore);
  ring.dataset.tone = qualityTone(cleanScore);
  valueElement.textContent = Number.isFinite(score) ? String(Math.round(cleanScore)) : "-";
}

function qualityTone(score) {
  if (score >= 80) {
    return "strong";
  }

  if (score >= 60) {
    return "good";
  }

  if (score >= 40) {
    return "watch";
  }

  return "weak";
}

function renderDataQualityNotes(notes) {
  elements.dataQualityNotes.replaceChildren(
    ...notes.map((note) => {
      const item = document.createElement("li");
      item.textContent = note;
      return item;
    })
  );
}

function renderSignalHistory(rows) {
  if (!rows.length) {
    renderEmptyRow(elements.signalHistoryBody, 5, "No historical signal events derived yet.");
    return;
  }

  elements.signalHistoryBody.replaceChildren(
    ...rows.slice(0, 20).map((row) => {
      const tr = document.createElement("tr");
      tr.append(
        tableCell(formatDateTime(row.capturedAt)),
        tableCell(row.source, "source-name"),
        tableCell(row.signal),
        tableCell(formatScore(row.evidenceScore)),
        tableCell(`${formatMultiplier(row.nextValue)} (${row.nextBand})`, "value-cell")
      );
      return tr;
    })
  );
}

function renderPredictionLab(analysis) {
  elements.predictionScopeLabel.textContent = `${analysis.total} records analyzed`;
  elements.predictionSignal.textContent = `${analysis.evidence.label} ${formatScore(analysis.evidence.score)}`;
  elements.predictionTopBand.textContent = analysis.topBand?.label || "-";
  elements.predictionTopProbability.textContent = analysis.topBand ? formatPercent(analysis.topBand.probability) : "-";
  elements.predictionMatches.textContent = String(analysis.similar.matches.length);
  elements.predictionBacktestAccuracy.textContent = formatPercent(analysis.backtest.accuracy);
  elements.predictionBaselineAccuracy.textContent = formatPercent(analysis.backtest.baselineAccuracy);
  elements.predictionConfidenceLabel.textContent = analysis.evidence.label;
  elements.predictionGrounding.textContent = `${analysis.models.length} model${analysis.models.length === 1 ? "" : "s"} / ${analysis.backtest.cases} backtest case${analysis.backtest.cases === 1 ? "" : "s"}`;

  const signalCard = elements.predictionSignal.closest(".signal-card");
  if (signalCard) {
    signalCard.dataset.signal = predictionSignalTone(analysis.evidence.label);
  }

  renderProbabilityBars(analysis.probabilities);
  renderPredictionModels(analysis.models);
  renderModelLeaderboard(analysis.leaderboard);
  renderSimilarOutcomes(analysis.similar.topMatches || []);
  renderPredictionNotes(analysis.notes);
}

function predictionSignalTone(label) {
  if (label === "Strong evidence" || label === "Developing evidence") {
    return "watch";
  }

  if (label === "Exploratory") {
    return "elevated";
  }

  return "low";
}

function renderProbabilityBars(probabilities) {
  if (!PREDICTION_BANDS.some((band) => Number.isFinite(probabilities[band.key]))) {
    elements.predictionBars.replaceChildren(emptyInline("Collect more records to calculate empirical probability bands."));
    return;
  }

  elements.predictionBars.replaceChildren(
    ...PREDICTION_BANDS.map((band) => {
      const probability = probabilities[band.key];
      const row = document.createElement("div");
      row.className = "probability-row";

      const label = document.createElement("span");
      label.textContent = band.label;

      const track = document.createElement("div");
      track.className = "probability-track";

      const fill = document.createElement("i");
      fill.style.width = `${Math.max(0, Math.min(100, (probability || 0) * 100))}%`;
      track.append(fill);

      const value = document.createElement("strong");
      value.textContent = formatPercent(probability);

      row.append(label, track, value);
      return row;
    })
  );
}

function renderPredictionModels(models) {
  if (!models.length) {
    renderEmptyRow(elements.predictionModelsBody, 4, "No model has enough local data yet.");
    return;
  }

  elements.predictionModelsBody.replaceChildren(
    ...models.map((model) => {
      const topBand = topProbabilityBand(model.distribution);
      const tr = document.createElement("tr");
      tr.title = model.status;
      tr.append(
        tableCell(model.label),
        tableCell(String(model.sample)),
        metricBarCell(model.weight),
        tableCell(topBand ? `${topBand.label} (${formatPercent(topBand.probability)})` : "-")
      );
      return tr;
    })
  );
}

function renderModelLeaderboard(rows) {
  const usableRows = rows.filter((row) => row.cases > 0);

  if (!usableRows.length) {
    renderEmptyRow(elements.modelLeaderboardBody, 4, "Not enough historical cases to rank models yet.");
    return;
  }

  elements.modelLeaderboardBody.replaceChildren(
    ...usableRows.map((row) => {
      const tr = document.createElement("tr");
      tr.append(
        tableCell(row.label),
        tableCell(String(row.cases)),
        metricBarCell(row.accuracy),
        metricBarCell(row.averageActualProbability)
      );
      return tr;
    })
  );
}

function renderSimilarOutcomes(matches) {
  if (!matches.length) {
    renderEmptyRow(elements.similarOutcomesBody, 4, "No historical sequence windows meet the similarity threshold.");
    return;
  }

  elements.similarOutcomesBody.replaceChildren(
    ...matches.map((match) => {
      const tr = document.createElement("tr");
      const sequenceText = match.sequence.join(" > ");
      tr.append(
        tableCell(sequenceText, "sequence-cell"),
        tableCell(formatMultiplier(match.nextValue), "value-cell"),
        metricBarCell(match.similarity),
        tableCell(`#${match.start + 1}`)
      );
      tr.title = sequenceText;
      return tr;
    })
  );
}

function renderPredictionNotes(notes) {
  elements.predictionNotes.replaceChildren(
    ...notes.map((note) => {
      const item = document.createElement("li");
      item.textContent = note;
      return item;
    })
  );
}

function renderPatternAnalysis(analysis) {
  const thresholdLabel = `${formatThreshold(analysis.threshold)}+`;
  elements.patternScopeLabel.textContent = `${analysis.total} records analyzed`;
  elements.highHitsLabel.textContent = `${thresholdLabel} Hits`;
  elements.highRateLabel.textContent = `${thresholdLabel} Rate`;
  elements.afterThresholdLabel.textContent = `${thresholdLabel} Rate`;
  if (elements.sourceThresholdLabel) {
    elements.sourceThresholdLabel.textContent = thresholdLabel;
  }
  elements.over10Count.textContent = String(analysis.hitCount);
  elements.over10Rate.textContent = formatPercent(analysis.hitRate);
  elements.averageGap.textContent = formatRounds(analysis.avgGap);
  elements.currentGap.textContent = analysis.total ? `${analysis.currentGap}` : "-";
  elements.longestGap.textContent = formatRounds(analysis.longestGap);
  elements.clusteredHits.textContent = String(analysis.clusteredHits);
  elements.patternConfidenceLabel.textContent = getConfidenceLabel(analysis.total);
  elements.recycleSignal.textContent = analysis.total ? `${analysis.recycle.label} ${formatScore(analysis.recycle.score)}` : "-";
  const signalCard = elements.recycleSignal.closest(".signal-card");
  if (signalCard) {
    signalCard.dataset.signal = analysis.recycle.label.toLowerCase();
  }
  elements.bestLag.textContent = analysis.recycle.bestLag ? `${analysis.recycle.bestLag.lag}` : "-";
  elements.lagLift.textContent = analysis.recycle.bestLag ? formatLift(analysis.recycle.bestLag.lift) : "-";
  elements.repeatWindows.textContent = String(analysis.recycle.repeatedBinned.length);
  elements.exactRepeatWindows.textContent = String(analysis.recycle.repeatedExact.length);
  elements.entropyValue.textContent = Number.isFinite(analysis.recycle.entropy.normalized)
    ? analysis.recycle.entropy.normalized.toFixed(2)
    : "-";

  renderOver10Board(analysis.board, analysis.total, analysis.threshold);
  renderEnterpriseModel(analysis.enterpriseModel);
  drawPositionRateChart(elements.positionCanvas.getContext("2d"), elements.positionCanvas, analysis.positionBuckets);
  drawGapHistogram(elements.gapCanvas.getContext("2d"), elements.gapCanvas, analysis.gaps, analysis.threshold);
  drawLagChart(elements.lagCanvas.getContext("2d"), elements.lagCanvas, analysis.recycle.lagResults, analysis.recycle.bestLag);
  renderPatternNotes(analysis.notes);
  renderAfter10Table(analysis.after10);
  renderRepeatedSequences(elements.repeatedSequencesBody, analysis.recycle.repeatedBinned, "No repeated binned windows yet.");
  renderRepeatedSequences(elements.exactSequencesBody, analysis.recycle.repeatedExact, "No exact rounded repeats yet.");
  renderSourceBreakdown(analysis.sources);
}

function renderOver10Board(board, total, threshold) {
  elements.boardLabel.textContent = `Last ${board.length} of ${total} records`;

  if (!board.length) {
    elements.over10Board.replaceChildren(emptyInline("No records yet."));
    return;
  }

  elements.over10Board.replaceChildren(
    ...board.map((record, index) => {
      const cell = document.createElement("span");
      cell.className = `heat-cell ${record.value >= 50 ? "high" : record.value >= threshold ? "hit" : "low"}`;
      cell.title = `#${total - board.length + index + 1}: ${formatMultiplier(record.value)} at ${formatDateTime(record.capturedAt)}`;
      cell.textContent = record.value >= threshold ? formatCompactMultiplier(record.value) : "";
      return cell;
    })
  );
}

function renderEnterpriseModel(model) {
  if (!model) {
    return;
  }

  const thresholdLabel = `${model.thresholdLabel}+`;
  elements.enterpriseModelScope.textContent = model.total
    ? `${thresholdLabel} model across ${model.total} records`
    : "Waiting for records";
  elements.enterpriseHitCount.textContent = String(model.hitCount);

  const latestGapDelta = [...model.events].reverse().find((event) => Number.isFinite(event.gapDelta))?.gapDelta;
  const gapPressure = Number.isFinite(model.medianGap) ? model.currentGap - model.medianGap : null;

  elements.enterpriseGapDelta.textContent = formatSignedRounds(latestGapDelta);
  elements.enterpriseGapVolatility.textContent = formatRounds(model.gapVolatility);
  elements.enterpriseGapPressure.textContent = formatSignedRounds(gapPressure);
  elements.enterpriseBetweenAverage.textContent = formatMultiplier(model.betweenAverage);
  elements.enterpriseInsightCount.textContent = String(model.notes.length);
  setDeltaTone(elements.enterpriseGapDelta, latestGapDelta);
  setDeltaTone(elements.enterpriseGapPressure, gapPressure);

  renderEnterprisePressure(model.pressure);
  renderEnterpriseEventTable(model.events);
  renderEnterpriseBetweenTable(model.events);
  renderEnterpriseNotes(model.notes);
}

function renderEnterprisePressure(pressure) {
  if (!pressure) {
    return;
  }

  elements.enterprisePressureTitle.textContent = `Next ${pressure.thresholdLabel}+ Pressure`;
  elements.enterprisePressureScore.textContent = formatScore(pressure.score);
  elements.enterprisePressureStatus.textContent = pressure.status.label;
  elements.enterprisePressurePanel.dataset.level = pressure.status.tone;
  elements.enterprisePressureBar.style.width = `${Number.isFinite(pressure.score) ? Math.max(0, Math.min(100, pressure.score)) : 0}%`;
  elements.enterprisePressureReason.textContent = pressure.reason;
  elements.enterprisePressureFormula.textContent = pressure.formula;

  const components = Object.fromEntries(pressure.components.map((component) => [component.key, component]));
  renderPressureComponent(elements.pressureGapPercentile, components.gapPercentile);
  renderPressureComponent(elements.pressureGapDeviation, components.gapDeviation);
  renderPressureComponent(elements.pressureHazardEcho, components.hazardEcho);
  renderPressureComponent(elements.pressureDeltaTrend, components.deltaTrend);
  renderPressureComponent(elements.pressureClusterPulse, components.clusterPulse);
  renderPressureComponent(elements.pressureBetweenStrength, components.betweenStrength);
  renderPressureComponent(elements.pressureNearMissDensity, components.nearMissDensity);
  renderPressureComponent(elements.pressureColdStreak, components.coldStreakStress);
  renderPressureComponent(elements.pressureRecentPace, components.recentPace);
  renderPressureComponent(elements.pressureVolatilityRegime, components.volatilityRegime);
  renderPressureComponent(elements.pressureSourceEdge, components.sourceEdge);
  elements.pressureSampleConfidence.textContent = formatScore(pressure.confidence);
  elements.pressureSampleConfidence.title = "Sample confidence pulls the raw formula toward neutral when the dataset is thin.";
}

function renderPressureComponent(element, component) {
  if (!component) {
    element.textContent = "-";
    element.title = "";
    return;
  }

  element.textContent = formatScore(component.score);
  element.title = component.evidence;
}

function renderEnterpriseEventTable(events) {
  if (!events.length) {
    renderEmptyRow(elements.enterpriseEventBody, 7, "No threshold events captured yet.");
    return;
  }

  elements.enterpriseEventBody.replaceChildren(
    ...events.slice(-80).map((event) => {
      const tr = document.createElement("tr");
      const source = tableCell(shortText(event.source, 46), "source-name");
      const gapDelta = tableCell(formatSignedRounds(event.gapDelta), `delta-cell ${deltaClass(event.gapDelta)}`);
      const valueDelta = tableCell(formatSignedMultiplier(event.valueDelta), `delta-cell ${deltaClass(event.valueDelta)}`);
      source.title = event.source;
      tr.append(
        tableCell(`#${event.number}`),
        tableCell(formatMultiplier(event.record.value), "value-cell"),
        tableCell(Number.isFinite(event.gap) ? formatRounds(event.gap) : `Lead-in ${event.leadIn}`),
        gapDelta,
        valueDelta,
        source,
        tableCell(formatDateTime(event.record.capturedAt))
      );
      return tr;
    })
  );
}

function renderEnterpriseBetweenTable(events) {
  const rows = events.filter((event) => event.between.count > 0);

  if (!rows.length) {
    renderEmptyRow(elements.enterpriseBetweenBody, 6, "No in-between rounds available yet.");
    return;
  }

  elements.enterpriseBetweenBody.replaceChildren(
    ...rows.slice(-60).map((event) => {
      const tr = document.createElement("tr");
      const label = event.previous ? `#${event.number - 1} -> #${event.number}` : `Start -> #${event.number}`;
      tr.append(
        tableCell(label),
        tableCell(String(event.between.count)),
        tableCell(formatMultiplier(event.between.average)),
        tableCell(formatMultiplier(event.between.max)),
        tableCell(formatPercent(event.between.over2Rate)),
        tableCell(event.between.dominantBand)
      );
      return tr;
    })
  );
}

function renderEnterpriseNotes(notes) {
  elements.enterpriseNotes.replaceChildren(
    ...notes.map((note) => {
      const item = document.createElement("li");
      item.textContent = note;
      return item;
    })
  );
}


function renderPatternNotes(notes) {
  elements.patternNotes.replaceChildren(
    ...notes.map((note) => {
      const item = document.createElement("li");
      item.textContent = note;
      return item;
    })
  );
}

function renderAfter10Table(rows) {
  if (!rows.length || rows.every((row) => row.count === 0)) {
    renderEmptyRow(elements.after10Body, 4, "No complete after-hit samples yet.");
    return;
  }

  elements.after10Body.replaceChildren(
    ...rows.map((row) => {
      const tr = document.createElement("tr");
      tr.append(
        tableCell(`+${row.offset}`),
        tableCell(row.count ? formatMultiplier(row.average) : "-"),
        tableCell(row.count ? formatPercent(row.over2Rate) : "-"),
        tableCell(row.count ? formatPercent(row.overHighRate) : "-")
      );
      return tr;
    })
  );
}

function renderRepeatedSequences(tbody, rows, emptyText) {
  if (!rows.length) {
    renderEmptyRow(tbody, 3, emptyText);
    return;
  }

  tbody.replaceChildren(
    ...rows.map((row) => {
      const tr = document.createElement("tr");
      const sequenceText = row.sequence.join(" > ");
      tr.append(
        tableCell(sequenceText, "sequence-cell"),
        tableCell(String(row.count)),
        tableCell(`#${row.lastIndex + 1}`)
      );
      tr.title = sequenceText;
      return tr;
    })
  );
}

function renderSourceBreakdown(sources) {
  if (!sources.length) {
    renderEmptyRow(elements.sourceBreakdownBody, 5, "No source data yet.");
    return;
  }

  elements.sourceBreakdownBody.replaceChildren(
    ...sources.map((source) => {
      const tr = document.createElement("tr");
      tr.append(
        tableCell(source.label, "source-name"),
        tableCell(String(source.count)),
        tableCell(String(source.hitCount)),
        tableCell(formatPercent(source.hitRate)),
        tableCell(formatRounds(source.averageGap))
      );
      return tr;
    })
  );
}

function renderTable() {
  state.filtered = applyFilters(state.records).reverse();
  const totalPages = Math.max(1, Math.ceil(state.filtered.length / state.pageSize));
  state.page = Math.max(1, Math.min(state.page, totalPages));
  const start = (state.page - 1) * state.pageSize;
  const pageRecords = state.filtered.slice(start, start + state.pageSize);

  elements.tableCount.textContent = `${state.filtered.length} shown`;
  elements.pageLabel.textContent = `Page ${state.page} of ${totalPages}`;
  elements.prevPageButton.disabled = state.page <= 1;
  elements.nextPageButton.disabled = state.page >= totalPages;
  updateSelectionControls(pageRecords);

  if (!pageRecords.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 7;
    cell.textContent = "No records match the current filters.";
    row.append(cell);
    elements.recordsBody.replaceChildren(row);
    return;
  }

  elements.recordsBody.replaceChildren(
    ...pageRecords.map((record) => {
      const row = document.createElement("tr");
      row.append(
        selectionCell(record),
        tableCell(formatDateTime(record.capturedAt)),
        tableCell(formatMultiplier(Number(record.value)), "value-cell"),
        tableCell(record.mode || "-"),
        sourceCell(record),
        pageCell(record),
        syncCell(record)
      );
      return row;
    })
  );
}

function applyFilters(records) {
  const search = elements.searchInput.value.trim().toLowerCase();
  const min = Number(elements.filterMinInput.value);
  const max = Number(elements.filterMaxInput.value);
  const syncFilter = elements.syncFilterInput.value;

  return records.filter((record) => {
    const value = Number(record.value);

    if (Number.isFinite(min) && elements.filterMinInput.value !== "" && value < min) {
      return false;
    }

    if (Number.isFinite(max) && elements.filterMaxInput.value !== "" && value > max) {
      return false;
    }

    if (syncFilter === "synced" && !record.sheetSyncedAt) {
      return false;
    }

    if (syncFilter === "unsynced" && record.sheetSyncedAt) {
      return false;
    }

    if (!search) {
      return true;
    }

    const haystack = [
      record.value,
      record.raw,
      record.mode,
      record.pageTitle,
      record.pageUrl,
      record.frameUrl,
      record.sourceHost,
      record.sourceKind,
      record.sourceGroup,
      record.captureSessionId,
      record.capturedAt
    ].join(" ").toLowerCase();

    return haystack.includes(search);
  });
}

function tableCell(text, className = "") {
  const cell = document.createElement("td");
  if (className) {
    cell.className = className;
  }
  cell.textContent = text;
  return cell;
}

function deltaClass(value) {
  if (!Number.isFinite(value) || value === 0) {
    return "delta-flat";
  }

  return value > 0 ? "delta-positive" : "delta-negative";
}

function setDeltaTone(element, value) {
  element.classList.remove("delta-positive", "delta-negative", "delta-flat");
  element.classList.add(deltaClass(value));
}

function selectionCell(record) {
  const cell = document.createElement("td");
  cell.className = "select-column";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = state.selectedIds.has(String(record.id));
  checkbox.setAttribute("aria-label", `Select record ${formatMultiplier(Number(record.value))}`);
  checkbox.addEventListener("change", () => {
    toggleRecordSelection(record.id, checkbox.checked);
  });
  cell.append(checkbox);
  return cell;
}

function metricBarCell(value) {
  const cell = document.createElement("td");
  cell.className = "metric-bar-cell";

  const track = document.createElement("span");
  track.className = "mini-meter";

  const fill = document.createElement("i");
  fill.style.width = `${Math.max(0, Math.min(100, (value || 0) * 100))}%`;
  track.append(fill);

  const label = document.createElement("strong");
  label.textContent = formatPercent(value);

  cell.append(track, label);
  return cell;
}

function pageCell(record) {
  const cell = document.createElement("td");
  cell.className = "page-cell";
  const title = document.createElement("strong");
  title.textContent = record.pageTitle || "Untitled page";
  const url = document.createElement("span");
  url.textContent = record.pageUrl || "";
  cell.append(title, url);
  return cell;
}

function sourceCell(record) {
  const cell = document.createElement("td");
  cell.className = "source-cell";
  const label = document.createElement("strong");
  label.textContent = record.sourceHost || hostFromUrl(record.frameUrl || record.pageUrl) || "Unknown source";
  const details = document.createElement("span");
  const parts = [
    record.frameRole,
    record.sourceKind,
    record.sourceGroup ? shortText(record.sourceGroup, 48) : ""
  ].filter(Boolean);
  details.textContent = parts.length ? parts.join(" / ") : "No source metadata";
  details.title = record.sourceGroup || details.textContent;
  cell.append(label, details);
  return cell;
}

function syncCell(record) {
  const cell = document.createElement("td");
  const badge = document.createElement("span");
  badge.className = `sync-state ${record.sheetSyncedAt ? "synced" : "unsynced"}`;
  badge.textContent = record.sheetSyncedAt ? "Synced" : "Unsynced";
  cell.append(badge);
  return cell;
}

function changePage(delta) {
  state.page += delta;
  renderTable();
}

function getCurrentPageRecords() {
  const totalPages = Math.max(1, Math.ceil(state.filtered.length / state.pageSize));
  const page = Math.max(1, Math.min(state.page, totalPages));
  const start = (page - 1) * state.pageSize;
  return state.filtered.slice(start, start + state.pageSize);
}

function toggleRecordSelection(id, selected) {
  const key = String(id);
  if (selected) {
    state.selectedIds.add(key);
  } else {
    state.selectedIds.delete(key);
  }
  renderTable();
}

function togglePageSelection() {
  const pageRecords = getCurrentPageRecords();
  const shouldSelect = elements.selectPageCheckbox.checked;

  pageRecords.forEach((record) => {
    const id = String(record.id);
    if (shouldSelect) {
      state.selectedIds.add(id);
    } else {
      state.selectedIds.delete(id);
    }
  });

  renderTable();
}

function updateSelectionControls(pageRecords) {
  const pageIds = pageRecords.map((record) => String(record.id));
  const selectedOnPage = pageIds.filter((id) => state.selectedIds.has(id)).length;
  const selectedCount = state.selectedIds.size;

  elements.selectedCount.textContent = `${selectedCount} selected`;
  elements.clearSelectionButton.disabled = selectedCount === 0;
  elements.deleteSelectedButton.disabled = selectedCount === 0;
  elements.selectPageCheckbox.disabled = pageIds.length === 0;
  elements.selectPageCheckbox.checked = pageIds.length > 0 && selectedOnPage === pageIds.length;
  elements.selectPageCheckbox.indeterminate = selectedOnPage > 0 && selectedOnPage < pageIds.length;
}

function normalizeRecords(records) {
  return records
    .filter((record) => record && record.id)
    .map((record) => ({
      ...record,
      value: Number(record.value),
      sourceHost: record.sourceHost || hostFromUrl(record.frameUrl || record.pageUrl)
    }))
    .filter((record) => Number.isFinite(record.value))
    .sort((a, b) => String(a.capturedAt || "").localeCompare(String(b.capturedAt || "")));
}

function hostFromUrl(url) {
  if (!url) {
    return "";
  }

  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

function shortText(text, limit) {
  const value = String(text || "");
  return value.length > limit ? `${value.slice(0, limit - 1)}...` : value;
}

function computeStats(values) {
  if (!values.length) {
    return { average: null, median: null, highest: null };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((total, value) => total + value, 0);
  const middle = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
  return {
    average: sum / values.length,
    median,
    highest: sorted[sorted.length - 1]
  };
}

function ratio(count, total) {
  return total ? count / total : null;
}

function meanSafe(values) {
  const clean = values.filter(Number.isFinite);
  if (!clean.length) {
    return null;
  }

  return clean.reduce((total, value) => total + value, 0) / clean.length;
}

function medianSafe(values) {
  const clean = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!clean.length) {
    return null;
  }

  const middle = Math.floor(clean.length / 2);
  return clean.length % 2 === 0 ? (clean[middle - 1] + clean[middle]) / 2 : clean[middle];
}

function standardDeviation(values) {
  const clean = values.filter(Number.isFinite);
  if (clean.length < 2) {
    return null;
  }

  const mean = meanSafe(clean);
  const variance = meanSafe(clean.map((value) => (value - mean) ** 2));
  return Number.isFinite(variance) ? Math.sqrt(variance) : null;
}

function mostCommonValue(values) {
  const counts = new Map();

  values.forEach((value) => {
    counts.set(value, (counts.get(value) || 0) + 1);
  });

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "";
}

function trailingStreak(values, predicate) {
  let count = 0;

  for (let index = values.length - 1; index >= 0; index -= 1) {
    if (!predicate(values[index])) {
      break;
    }

    count += 1;
  }

  return count;
}

function drawLineChart(ctx, canvas, values) {
  clearCanvas(ctx, canvas);
  drawChartFrame(ctx, canvas);

  if (values.length < 2) {
    drawEmptyChart(ctx, canvas, "Waiting for more data");
    return;
  }

  const width = canvas.width;
  const height = canvas.height;
  const pad = 34;
  const capped = values.map((value) => Math.min(value, 20));
  const max = Math.max(2, ...capped);
  const points = capped.map((value, index) => {
    const x = pad + (index / (capped.length - 1)) * (width - pad * 2);
    const y = height - pad - (value / max) * (height - pad * 2);
    return [x, y];
  });

  ctx.strokeStyle = "#0f766e";
  ctx.lineWidth = 3;
  ctx.beginPath();
  points.forEach(([x, y], index) => {
    if (index === 0) {
      ctx.moveTo(x, y);
      return;
    }
    ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.fillStyle = "#0f766e";
  points.slice(-12).forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = "#637083";
  ctx.font = "12px system-ui, sans-serif";
  ctx.fillText("20x values are capped for readability", pad, height - 10);
}

function drawBarChart(ctx, canvas, buckets) {
  clearCanvas(ctx, canvas);
  drawChartFrame(ctx, canvas);

  const width = canvas.width;
  const height = canvas.height;
  const pad = 34;
  const max = Math.max(1, ...buckets.map(([, count]) => count));
  const barGap = 12;
  const barWidth = (width - pad * 2 - barGap * (buckets.length - 1)) / buckets.length;

  buckets.forEach(([label, count], index) => {
    const x = pad + index * (barWidth + barGap);
    const barHeight = (count / max) * (height - pad * 2);
    const y = height - pad - barHeight;

    ctx.fillStyle = "#0f766e";
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.fillStyle = "#16212c";
    ctx.font = "13px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(count), x + barWidth / 2, Math.max(18, y - 8));
    ctx.fillStyle = "#637083";
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillText(label, x + barWidth / 2, height - 12);
  });

  ctx.textAlign = "left";
}

function drawPositionRateChart(ctx, canvas, buckets) {
  clearCanvas(ctx, canvas);
  drawChartFrame(ctx, canvas);

  if (!buckets.some((bucket) => bucket.total > 0)) {
    drawEmptyChart(ctx, canvas, "Waiting for records");
    return;
  }

  const chartBuckets = buckets.map((bucket) => ({
    label: bucket.label,
    count: bucket.hits,
    rate: ratio(bucket.hits, bucket.total) || 0,
    total: bucket.total
  }));
  const maxRate = Math.max(0.01, ...chartBuckets.map((bucket) => bucket.rate));
  const width = canvas.width;
  const height = canvas.height;
  const pad = 34;
  const barGap = 4;
  const barWidth = (width - pad * 2 - barGap * (chartBuckets.length - 1)) / chartBuckets.length;

  chartBuckets.forEach((bucket, index) => {
    const x = pad + index * (barWidth + barGap);
    const barHeight = (bucket.rate / maxRate) * (height - pad * 2);
    const y = height - pad - barHeight;

    ctx.fillStyle = bucket.count > 0 ? "#0f766e" : "#d8e0e8";
    ctx.fillRect(x, y, barWidth, barHeight);

    if (index % 2 === 0) {
      ctx.fillStyle = "#637083";
      ctx.font = "11px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(bucket.label, x + barWidth / 2, height - 12);
    }
  });

  const best = [...chartBuckets].sort((a, b) => b.rate - a.rate)[0];
  ctx.fillStyle = "#16212c";
  ctx.font = "12px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`Top column: ${best.label} (${formatPercent(best.rate)})`, pad, 18);
}

function drawGapHistogram(ctx, canvas, gaps, threshold) {
  const buckets = [
    ["0-5", gaps.filter((gap) => gap <= 5).length],
    ["6-10", gaps.filter((gap) => gap >= 6 && gap <= 10).length],
    ["11-20", gaps.filter((gap) => gap >= 11 && gap <= 20).length],
    ["21-40", gaps.filter((gap) => gap >= 21 && gap <= 40).length],
    ["41+", gaps.filter((gap) => gap >= 41).length]
  ];

  clearCanvas(ctx, canvas);
  drawChartFrame(ctx, canvas);

  if (!gaps.length) {
    drawEmptyChart(ctx, canvas, `Need at least two ${formatThreshold(threshold)}+ hits`);
    return;
  }

  const width = canvas.width;
  const height = canvas.height;
  const pad = 34;
  const max = Math.max(1, ...buckets.map(([, count]) => count));
  const barGap = 12;
  const barWidth = (width - pad * 2 - barGap * (buckets.length - 1)) / buckets.length;

  buckets.forEach(([label, count], index) => {
    const x = pad + index * (barWidth + barGap);
    const barHeight = (count / max) * (height - pad * 2);
    const y = height - pad - barHeight;

    ctx.fillStyle = "#0f766e";
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.fillStyle = "#16212c";
    ctx.font = "13px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(count), x + barWidth / 2, Math.max(18, y - 8));
    ctx.fillStyle = "#637083";
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillText(label, x + barWidth / 2, height - 12);
  });

  ctx.textAlign = "left";
}

function drawLagChart(ctx, canvas, results, bestLag) {
  clearCanvas(ctx, canvas);
  drawChartFrame(ctx, canvas);

  if (results.length < 2) {
    drawEmptyChart(ctx, canvas, "Need more records for lag scan");
    return;
  }

  const width = canvas.width;
  const height = canvas.height;
  const pad = 34;
  const maxLift = Math.max(1.2, ...results.map((result) => Math.min(result.lift || 0, 3)));
  const points = results.map((result, index) => {
    const lift = Math.min(result.lift || 0, 3);
    const x = pad + (index / (results.length - 1)) * (width - pad * 2);
    const y = height - pad - (lift / maxLift) * (height - pad * 2);
    return { ...result, x, y };
  });
  const baselineY = height - pad - (1 / maxLift) * (height - pad * 2);

  ctx.strokeStyle = "#9eacba";
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(pad, baselineY);
  ctx.lineTo(width - pad, baselineY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = "#2563eb";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
      return;
    }
    ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();

  if (bestLag) {
    const bestPoint = points.find((point) => point.lag === bestLag.lag);
    if (bestPoint) {
      ctx.strokeStyle = "#b42318";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bestPoint.x, pad);
      ctx.lineTo(bestPoint.x, height - pad);
      ctx.stroke();

      ctx.fillStyle = "#b42318";
      ctx.beginPath();
      ctx.arc(bestPoint.x, bestPoint.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.fillStyle = "#16212c";
  ctx.font = "12px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(
    bestLag ? `Best lag: ${bestLag.lag} rounds (${formatLift(bestLag.lift)})` : "No significant lag lift yet",
    pad,
    18
  );
  ctx.fillStyle = "#637083";
  ctx.fillText("Dashed line = baseline", pad, height - 10);
}

function drawChartFrame(ctx, canvas) {
  const width = canvas.width;
  const height = canvas.height;
  ctx.strokeStyle = "#d8e0e8";
  ctx.lineWidth = 1;

  for (let index = 1; index < 4; index += 1) {
    const y = (height / 4) * index;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawEmptyChart(ctx, canvas, text) {
  ctx.fillStyle = "#637083";
  ctx.font = "14px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  ctx.textAlign = "left";
}

function clearCanvas(ctx, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function renderEmptyRow(tbody, colspan, text) {
  const row = document.createElement("tr");
  const cell = document.createElement("td");
  cell.colSpan = colspan;
  cell.textContent = text;
  row.append(cell);
  tbody.replaceChildren(row);
}

function emptyInline(text) {
  const node = document.createElement("span");
  node.className = "empty-inline";
  node.textContent = text;
  return node;
}

async function exportCsv() {
  if (!state.records.length) {
    setMessage("No records to export.");
    return;
  }

  const header = ["id", "captured_at", "value", "raw", "mode", "page_title", "page_url", "sheet_synced_at"];
  const rows = state.records.map((record) =>
    [
      record.id,
      record.capturedAt,
      record.value,
      record.raw,
      record.mode,
      record.pageTitle,
      record.pageUrl,
      record.sheetSyncedAt
    ].map(csvCell).join(",")
  );

  const blob = new Blob([[header.join(","), ...rows].join("\n")], {
    type: "text/csv;charset=utf-8"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `multiplier-dashboard-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  setMessage(`Exported ${state.records.length} records.`);
}

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function formatMultiplier(value) {
  return Number.isFinite(value) ? `${value.toFixed(2)}x` : "-";
}

function formatThreshold(value) {
  if (!Number.isFinite(value)) {
    return "10x";
  }

  return `${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1)}x`;
}

function formatCompactMultiplier(value) {
  if (!Number.isFinite(value)) {
    return "";
  }

  if (value >= 100) {
    return `${Math.round(value)}x`;
  }

  return `${value.toFixed(value >= 20 ? 0 : 1)}x`;
}

function formatPercent(value) {
  return Number.isFinite(value) ? `${(value * 100).toFixed(1)}%` : "-";
}

function formatScore(value) {
  return Number.isFinite(value) ? `${Math.round(value)}/100` : "-";
}

function formatLift(value) {
  return Number.isFinite(value) ? `${value.toFixed(2)}x` : "-";
}

function formatRounds(value) {
  return Number.isFinite(value) ? `${value.toFixed(value % 1 === 0 ? 0 : 1)}` : "-";
}

function formatSignedRounds(value) {
  if (!Number.isFinite(value)) {
    return "-";
  }

  if (value === 0) {
    return "0";
  }

  return `${value > 0 ? "+" : ""}${formatRounds(value)}`;
}

function formatSignedMultiplier(value) {
  if (!Number.isFinite(value)) {
    return "-";
  }

  if (value === 0) {
    return "0.00x";
  }

  return `${value > 0 ? "+" : ""}${value.toFixed(2)}x`;
}

function formatDateTime(iso) {
  if (!iso) {
    return "-";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date(iso));
}

function setBusy(isBusy) {
  [
    elements.saveSheetsButton,
    elements.testSheetsButton,
    elements.syncButton,
    elements.pullButton,
    elements.markUnsyncedButton,
    elements.clearLocalButton
  ].forEach((button) => {
    button.disabled = isBusy;
  });
}

function setMessage(text) {
  elements.message.textContent = text;
}
