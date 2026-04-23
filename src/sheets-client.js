(function () {
  const RECORDS_KEY = "visibleMultiplierLogger.records";
  const SHEETS_KEY = "visibleMultiplierLogger.sheets";

  const DEFAULT_SHEETS_SETTINGS = {
    endpoint: "",
    token: "",
    autoSync: false,
    lastSyncAt: "",
    lastPullAt: ""
  };

  let syncInFlight = null;

  function storageGet(keys) {
    return new Promise((resolve) => {
      if (!isExtensionContextAvailable()) {
        resolve({});
        return;
      }

      try {
        chrome.storage.local.get(keys, (result) => {
          if (lastChromeError()) {
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

  function normalizeSettings(settings = {}) {
    return {
      endpoint: String(settings.endpoint || "").trim(),
      token: String(settings.token || "").trim(),
      autoSync: Boolean(settings.autoSync),
      lastSyncAt: String(settings.lastSyncAt || ""),
      lastPullAt: String(settings.lastPullAt || "")
    };
  }

  async function getSettings() {
    const stored = await storageGet(SHEETS_KEY);
    return normalizeSettings({
      ...DEFAULT_SHEETS_SETTINGS,
      ...(stored[SHEETS_KEY] || {})
    });
  }

  async function saveSettings(settings) {
    const previous = await getSettings();
    const next = normalizeSettings({ ...previous, ...settings });
    await storageSet({ [SHEETS_KEY]: next });
    return next;
  }

  function requireEndpoint(settings) {
    if (!settings.endpoint) {
      throw new Error("Add your Google Apps Script Web App URL first.");
    }
  }

  function serializeRecord(record) {
    return {
      id: String(record.id || ""),
      capturedAt: String(record.capturedAt || ""),
      value: Number(record.value),
      raw: String(record.raw || ""),
      mode: String(record.mode || ""),
      pageTitle: String(record.pageTitle || ""),
      pageUrl: String(record.pageUrl || ""),
      sourceKind: String(record.sourceKind || ""),
      sourceGroup: String(record.sourceGroup || ""),
      frameUrl: String(record.frameUrl || record.pageUrl || ""),
      frameRole: String(record.frameRole || ""),
      sourceHost: String(record.sourceHost || ""),
      captureSessionId: String(record.captureSessionId || "")
    };
  }

  function isValidRecord(record) {
    return record?.id && Number.isFinite(Number(record.value));
  }

  async function requestJson(settings, payload, method = "POST") {
    requireEndpoint(settings);

    const url = method === "GET" ? withQuery(settings.endpoint, payload) : settings.endpoint;
    const init =
      method === "GET"
        ? { method: "GET", redirect: "follow" }
        : {
            method: "POST",
            redirect: "follow",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(payload)
          };

    const response = await fetch(url, init);
    const text = await response.text();

    if (!response.ok) {
      throw new Error(`Sheets request failed: ${response.status} ${text.slice(0, 120)}`);
    }

    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Sheets returned a non-JSON response: ${text.slice(0, 120)}`);
    }
  }

  function withQuery(endpoint, params) {
    const url = new URL(endpoint);
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    });
    return url.toString();
  }

  async function testConnection() {
    const settings = await getSettings();
    const result = await requestJson(settings, {
      action: "status",
      token: settings.token
    }, "GET");

    if (!result.ok) {
      throw new Error(result.error || "Google Sheets test failed.");
    }

    return result;
  }

  async function syncUnsyncedRecords(options = {}) {
    if (syncInFlight) {
      return syncInFlight;
    }

    syncInFlight = doSyncUnsyncedRecords(options).finally(() => {
      syncInFlight = null;
    });

    return syncInFlight;
  }

  async function doSyncUnsyncedRecords(options = {}) {
    const stored = await storageGet([RECORDS_KEY, SHEETS_KEY]);
    const settings = normalizeSettings({
      ...DEFAULT_SHEETS_SETTINGS,
      ...(stored[SHEETS_KEY] || {})
    });
    requireEndpoint(settings);

    const records = Array.isArray(stored[RECORDS_KEY]) ? stored[RECORDS_KEY] : [];
    const candidates = records
      .filter((record) => isValidRecord(record))
      .filter((record) => options.forceAll || !record.sheetSyncedAt)
      .map(serializeRecord);

    if (!candidates.length) {
      return { ok: true, appended: 0, skipped: 0, sent: 0, message: "No unsynced records." };
    }

    const result = await requestJson(settings, {
      action: "append",
      token: settings.token,
      records: candidates
    });

    if (!result.ok) {
      throw new Error(result.error || "Google Sheets sync failed.");
    }

    const syncedAt = new Date().toISOString();
    const syncedIds = new Set((result.syncedIds || candidates.map((record) => record.id)).map(String));
    const latest = await storageGet(RECORDS_KEY);
    const latestRecords = Array.isArray(latest[RECORDS_KEY]) ? latest[RECORDS_KEY] : [];
    const nextRecords = latestRecords.map((record) => {
      if (!syncedIds.has(String(record.id))) {
        return record;
      }

      const { sheetSyncError, ...rest } = record;
      return { ...rest, sheetSyncedAt: syncedAt };
    });

    await storageSet({
      [RECORDS_KEY]: nextRecords,
      [SHEETS_KEY]: { ...settings, lastSyncAt: syncedAt }
    });

    return {
      ...result,
      sent: candidates.length,
      syncedAt
    };
  }

  async function pullRecords() {
    const settings = await getSettings();
    const result = await requestJson(settings, {
      action: "list",
      token: settings.token
    }, "GET");

    if (!result.ok) {
      throw new Error(result.error || "Could not read records from Google Sheets.");
    }

    const pulled = Array.isArray(result.records) ? result.records.filter(isValidRecord) : [];
    const stored = await storageGet(RECORDS_KEY);
    const current = Array.isArray(stored[RECORDS_KEY]) ? stored[RECORDS_KEY] : [];
    const byId = new Map(current.map((record) => [String(record.id), record]));
    const pulledAt = new Date().toISOString();

    pulled.forEach((record) => {
      const id = String(record.id);
      const existing = byId.get(id) || {};
      byId.set(id, {
        ...existing,
        ...serializeRecord(record),
        sheetSyncedAt: existing.sheetSyncedAt || pulledAt
      });
    });

    const merged = Array.from(byId.values()).sort((a, b) => {
      return String(a.capturedAt || "").localeCompare(String(b.capturedAt || ""));
    });

    await storageSet({
      [RECORDS_KEY]: merged,
      [SHEETS_KEY]: { ...settings, lastPullAt: pulledAt }
    });

    return {
      ok: true,
      pulled: pulled.length,
      total: merged.length,
      pulledAt
    };
  }

  async function markAllUnsynced() {
    const stored = await storageGet(RECORDS_KEY);
    const records = Array.isArray(stored[RECORDS_KEY]) ? stored[RECORDS_KEY] : [];
    const nextRecords = records.map((record) => {
      const { sheetSyncedAt, sheetSyncError, ...rest } = record;
      return rest;
    });
    await storageSet({ [RECORDS_KEY]: nextRecords });
    return { ok: true, count: nextRecords.length };
  }

  function getSyncSummary(records, settings) {
    const valid = (records || []).filter(isValidRecord);
    const synced = valid.filter((record) => record.sheetSyncedAt).length;
    return {
      connected: Boolean(settings?.endpoint),
      total: valid.length,
      synced,
      unsynced: valid.length - synced
    };
  }

  globalThis.SheetsClient = {
    RECORDS_KEY,
    SHEETS_KEY,
    DEFAULT_SHEETS_SETTINGS,
    getSettings,
    saveSettings,
    testConnection,
    syncUnsyncedRecords,
    pullRecords,
    markAllUnsynced,
    getSyncSummary
  };
})();
