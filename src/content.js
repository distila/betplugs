(() => {
  if (window.__visibleMultiplierLoggerLoaded) {
    return;
  }

  window.__visibleMultiplierLoggerLoaded = true;

  const RECORDS_KEY = "visibleMultiplierLogger.records";
  const SETTINGS_KEY = "visibleMultiplierLogger.settings";
  const SITE_KEY = "visibleMultiplierLogger.site";
  const SINGLE_MULTIPLIER_PATTERN = /^\s*\d{1,5}(?:[.,]\d{1,2})?\s*x\s*$/i;
  const SKIPPED_CAPTURE_TAGS = new Set([
    "BODY",
    "HTML",
    "HEAD",
    "SCRIPT",
    "STYLE",
    "NOSCRIPT",
    "META",
    "LINK",
    "SVG",
    "PATH",
    "CANVAS",
    "IFRAME",
    "INPUT",
    "TEXTAREA",
    "SELECT",
    "OPTION",
    "BUTTON"
  ]);
  const INTERACTIVE_SELECTOR = "button,a,input,textarea,select,label,[role='button'],[contenteditable='true']";

  const DEFAULT_SETTINGS = {
    selector: "",
    regex: "\\b\\d+(?:\\.\\d+)?x\\b",
    order: "newest-first",
    minValue: 1,
    maxValue: 100000,
    maxRecords: 5000,
    captureExisting: true
  };

  const DEFAULT_SITE_SETTINGS = {
    pepetaAutoStart: false
  };

  const PEPETA_SETTINGS = {
    selector: "",
    regex: "\\b\\d+(?:\\.\\d{1,2})?x\\b",
    order: "newest-first",
    minValue: 1,
    maxValue: 10000,
    maxRecords: 20000,
    captureExisting: true
  };

  const state = {
    running: false,
    observer: null,
    pollTimer: null,
    scheduled: false,
    lastSnapshot: [],
    lastCaptureAt: null,
    settings: { ...DEFAULT_SETTINGS },
    panel: null,
    contextInvalidated: false,
    sessionId: `session-${Date.now()}-${Math.random().toString(16).slice(2)}`
  };

  function storageGet(keys) {
    return new Promise((resolve) => {
      if (!isExtensionContextAvailable()) {
        markExtensionContextInvalidated();
        resolve({});
        return;
      }

      try {
        chrome.storage.local.get(keys, (result) => {
          const error = lastChromeError();
          if (error) {
            handleChromeApiError(error);
            resolve({});
            return;
          }
          resolve(result || {});
        });
      } catch (error) {
        handleChromeApiError(error);
        resolve({});
      }
    });
  }

  function storageSet(payload) {
    return new Promise((resolve) => {
      if (!isExtensionContextAvailable()) {
        markExtensionContextInvalidated();
        resolve(false);
        return;
      }

      try {
        chrome.storage.local.set(payload, () => {
          const error = lastChromeError();
          if (error) {
            handleChromeApiError(error);
            resolve(false);
            return;
          }
          resolve(true);
        });
      } catch (error) {
        handleChromeApiError(error);
        resolve(false);
      }
    });
  }

  function isExtensionContextAvailable() {
    return typeof chrome !== "undefined" && Boolean(chrome.runtime?.id);
  }

  function lastChromeError() {
    try {
      return chrome.runtime.lastError;
    } catch (error) {
      handleChromeApiError(error);
      return error;
    }
  }

  function addStorageChangeListener(listener) {
    if (!isExtensionContextAvailable()) {
      markExtensionContextInvalidated();
      return;
    }

    try {
      chrome.storage.onChanged.addListener(listener);
    } catch (error) {
      handleChromeApiError(error);
    }
  }

  function addRuntimeMessageListener(listener) {
    if (!isExtensionContextAvailable()) {
      markExtensionContextInvalidated();
      return;
    }

    try {
      chrome.runtime.onMessage.addListener(listener);
    } catch (error) {
      handleChromeApiError(error);
    }
  }

  function handleChromeApiError(error) {
    if (isContextInvalidatedError(error)) {
      markExtensionContextInvalidated();
    }
  }

  function isContextInvalidatedError(error) {
    return /extension context invalidated/i.test(String(error?.message || error || ""));
  }

  function markExtensionContextInvalidated() {
    if (state.contextInvalidated) {
      return;
    }

    state.contextInvalidated = true;
    state.running = false;
    stopObservers();

    if (state.panel) {
      state.panel.status.textContent = "Extension was reloaded. Refresh this tab to reconnect.";
    }
  }

  function isTopFrame() {
    return window.top === window;
  }

  function isPepetaCaptureHost() {
    const host = location.hostname.toLowerCase();
    return (
      host === "pepeta.com" ||
      host.endsWith(".pepeta.com") ||
      host.endsWith(".spribegaming.com")
    );
  }

  function isPepetaPage() {
    const host = location.hostname.toLowerCase();
    return host === "pepeta.com" || host.endsWith(".pepeta.com");
  }

  function normalizeSettings(settings = {}) {
    const merged = { ...DEFAULT_SETTINGS, ...settings };
    merged.selector = String(merged.selector || "").trim();
    if (/^(body|html|:root)$/i.test(merged.selector)) {
      merged.selector = "";
    }
    merged.regex = String(merged.regex || DEFAULT_SETTINGS.regex);
    merged.order = merged.order === "oldest-first" ? "oldest-first" : "newest-first";
    merged.minValue = toFiniteNumber(merged.minValue, DEFAULT_SETTINGS.minValue);
    merged.maxValue = toFiniteNumber(merged.maxValue, DEFAULT_SETTINGS.maxValue);
    merged.maxRecords = Math.max(100, Math.min(100000, Math.floor(toFiniteNumber(merged.maxRecords, 5000))));
    merged.captureExisting = Boolean(merged.captureExisting);
    return merged;
  }

  function normalizeSiteSettings(settings = {}) {
    return {
      ...DEFAULT_SITE_SETTINGS,
      ...settings,
      pepetaAutoStart: Boolean(settings.pepetaAutoStart)
    };
  }

  function toFiniteNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function buildRegex(pattern) {
    try {
      const source = String(pattern || DEFAULT_SETTINGS.regex);
      return new RegExp(source, "g");
    } catch {
      return new RegExp(DEFAULT_SETTINGS.regex, "g");
    }
  }

  function rootsForSelector(selector) {
    if (!selector) {
      return [document.body].filter(Boolean);
    }

    try {
      const nodes = Array.from(document.querySelectorAll(selector));
      return nodes.length ? nodes : [];
    } catch {
      return [];
    }
  }

  function textFromRoots(roots) {
    return roots
      .map((node) => node.innerText || node.textContent || "")
      .join("\n")
      .replace(/\s+/g, " ")
      .trim();
  }

  function extractNumber(raw) {
    const text = String(raw).trim();
    const normalized = /,\d{1,2}\s*x?$/i.test(text) && !text.includes(".")
      ? text.replace(",", ".")
      : text.replace(/,/g, "");
    const match = normalized.match(/\d+(?:\.\d+)?/);
    return match ? Number(match[0]) : NaN;
  }

  function readSnapshot() {
    const roots = rootsForSelector(state.settings.selector);
    if (!roots.length) {
      return [];
    }

    if (!state.settings.selector) {
      return detectVisibleResultTokens();
    }

    const exactTokens = detectSingleMultiplierElements(roots);
    if (exactTokens.length) {
      return exactTokens.slice(0, 300);
    }

    const regex = buildRegex(state.settings.regex);
    const text = textFromRoots(roots);
    const tokens = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
      const raw = match[0].trim();
      const value = extractNumber(raw);

      if (
        Number.isFinite(value) &&
        value >= state.settings.minValue &&
        value <= state.settings.maxValue
      ) {
        tokens.push({ raw, value });
      }

      if (match.index === regex.lastIndex) {
        regex.lastIndex += 1;
      }
    }

    return tokens.slice(0, 300);
  }

  function detectVisibleResultTokens() {
    const candidates = detectSingleMultiplierElements([document.body]);
    if (candidates.length < 2) {
      return [];
    }

    const grouped = new Map();
    candidates.forEach((candidate) => {
      const group = grouped.get(candidate.groupKey) || [];
      group.push(candidate);
      grouped.set(candidate.groupKey, group);
    });

    const eligibleGroups = [...grouped.values()]
      .filter((group) => group.length >= 2)
      .sort((a, b) => b.length - a.length);

    if (!eligibleGroups.length) {
      return [];
    }

    return eligibleGroups[0]
      .sort((a, b) => a.documentOrder - b.documentOrder)
      .map(({ raw, value, sourceKind, groupKey, documentOrder }) => ({
        raw,
        value,
        sourceKind,
        groupKey,
        documentOrder
      }))
      .slice(0, 300);
  }

  function detectSingleMultiplierElements(roots) {
    const candidates = [];
    const seenElements = new WeakSet();
    let documentOrder = 0;

    roots.forEach((root) => {
      const elements = root.matches?.("*") ? [root, ...root.querySelectorAll("*")] : Array.from(root.querySelectorAll("*"));

      elements.forEach((element) => {
        if (seenElements.has(element)) {
          return;
        }
        seenElements.add(element);
        documentOrder += 1;

        const token = tokenFromExactElement(element);
        if (!token) {
          return;
        }

        candidates.push({
          ...token,
          groupKey: resultGroupKey(element),
          documentOrder
        });
      });
    });

    return candidates;
  }

  function tokenFromExactElement(element) {
    if (!isReadableResultElement(element)) {
      return null;
    }

    const text = normalizeElementText(element);
    if (!SINGLE_MULTIPLIER_PATTERN.test(text)) {
      return null;
    }

    if (hasChildMultiplierElement(element)) {
      return null;
    }

    const value = extractNumber(text);
    if (
      !Number.isFinite(value) ||
      value < state.settings.minValue ||
      value > state.settings.maxValue
    ) {
      return null;
    }

    return {
      raw: text.replace(/\s+/g, ""),
      value,
      sourceKind: "result-element"
    };
  }

  function isReadableResultElement(element) {
    if (!element || SKIPPED_CAPTURE_TAGS.has(element.tagName)) {
      return false;
    }

    if (element.closest(INTERACTIVE_SELECTOR)) {
      return false;
    }

    const text = normalizeElementText(element);
    if (text.length < 2 || text.length > 14) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    if (rect.width < 12 || rect.height < 8 || rect.width > 180 || rect.height > 82) {
      return false;
    }

    const style = window.getComputedStyle(element);
    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      Number(style.opacity) === 0
    ) {
      return false;
    }

    const fontSize = Number.parseFloat(style.fontSize);
    if (Number.isFinite(fontSize) && fontSize > 42) {
      return false;
    }

    return true;
  }

  function hasChildMultiplierElement(element) {
    return Array.from(element.children).some((child) => {
      if (SINGLE_MULTIPLIER_PATTERN.test(normalizeElementText(child))) {
        return true;
      }

      return hasChildMultiplierElement(child);
    });
  }

  function normalizeElementText(element) {
    return (element.innerText || element.textContent || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function resultGroupKey(element) {
    const parent = element.parentElement;
    const grandparent = parent?.parentElement;
    return [
      signaturePart(grandparent),
      signaturePart(parent),
      element.tagName
    ].join(">");
  }

  function signaturePart(element) {
    if (!element) {
      return "none";
    }

    const classNames = Array.from(element.classList || [])
      .filter(Boolean)
      .slice(0, 4)
      .join(".");

    return `${element.tagName}.${classNames}`;
  }

  async function loadCaptureSettings() {
    const stored = await storageGet(SETTINGS_KEY);
    const settings = stored[SETTINGS_KEY] || (isPepetaCaptureHost() ? PEPETA_SETTINGS : DEFAULT_SETTINGS);
    return normalizeSettings(isPepetaCaptureHost() ? { ...PEPETA_SETTINGS, ...settings } : settings);
  }

  function tokenKey(token) {
    return Number(token.value).toFixed(2);
  }

  function sameKeys(a, b) {
    if (a.length !== b.length) {
      return false;
    }

    return a.every((key, index) => key === b[index]);
  }

  function newestFirstDelta(previous, current) {
    if (!previous.length) {
      return state.settings.captureExisting ? [...current].reverse() : [];
    }

    const previousKeys = previous.map(tokenKey);
    const currentKeys = current.map(tokenKey);
    const maxOverlap = Math.min(previousKeys.length, currentKeys.length, 80);

    for (let start = 0; start < Math.min(currentKeys.length, 80); start += 1) {
      for (let length = maxOverlap; length >= 2; length -= 1) {
        const currentSlice = currentKeys.slice(start, start + length);
        const previousSlice = previousKeys.slice(0, length);

        if (sameKeys(currentSlice, previousSlice)) {
          return current.slice(0, start).reverse();
        }
      }
    }

    if (currentKeys[0] && currentKeys[0] !== previousKeys[0]) {
      return [current[0]];
    }

    return [];
  }

  function oldestFirstDelta(previous, current) {
    if (!previous.length) {
      return state.settings.captureExisting ? current : [];
    }

    const previousKeys = previous.map(tokenKey);
    const currentKeys = current.map(tokenKey);
    const maxOverlap = Math.min(previousKeys.length, currentKeys.length, 80);

    for (let length = maxOverlap; length >= 2; length -= 1) {
      const previousTail = previousKeys.slice(previousKeys.length - length);
      const currentHead = currentKeys.slice(0, length);

      if (sameKeys(previousTail, currentHead)) {
        return current.slice(length);
      }
    }

    const lastPrevious = previousKeys[previousKeys.length - 1];
    const lastCurrent = currentKeys[currentKeys.length - 1];

    if (lastCurrent && lastCurrent !== lastPrevious) {
      return [current[current.length - 1]];
    }

    return [];
  }

  function snapshotDelta(previous, current) {
    if (state.settings.order === "oldest-first") {
      return oldestFirstDelta(previous, current);
    }

    return newestFirstDelta(previous, current);
  }

  function trimStoredOverlap(records, incoming) {
    if (!records.length || !incoming.length) {
      return incoming;
    }

    const recordKeys = records.map((record) => Number(record.value).toFixed(2));
    const incomingKeys = incoming.map(tokenKey);
    const maxOverlap = Math.min(recordKeys.length, incomingKeys.length, 80);

    for (let length = maxOverlap; length >= 2; length -= 1) {
      const recordTail = recordKeys.slice(recordKeys.length - length);
      const incomingHead = incomingKeys.slice(0, length);

      if (sameKeys(recordTail, incomingHead)) {
        return incoming.slice(length);
      }
    }

    return incoming;
  }

  async function appendTokens(tokens, mode) {
    if (!tokens.length) {
      return 0;
    }

    const stored = await storageGet(RECORDS_KEY);
    const records = Array.isArray(stored[RECORDS_KEY]) ? stored[RECORDS_KEY] : [];
    const cleanTokens = trimStoredOverlap(records, tokens);

    if (!cleanTokens.length) {
      return 0;
    }

    const capturedAt = new Date().toISOString();
    const additions = cleanTokens.map((token, index) => ({
      id: `${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`,
      value: token.value,
      raw: token.raw,
      sourceKind: token.sourceKind || (state.settings.selector ? "selector-text" : "dom-text"),
      sourceGroup: token.groupKey || "",
      sourceOrdinal: Number.isInteger(token.documentOrder) ? token.documentOrder : null,
      frameUrl: location.href,
      frameTitle: document.title,
      frameRole: isTopFrame() ? "top" : "iframe",
      sourceHost: location.hostname,
      sourcePath: location.pathname,
      captureSessionId: state.sessionId,
      capturedAt,
      mode,
      pageTitle: document.title,
      pageUrl: location.href
    }));

    const nextRecords = records.concat(additions).slice(-state.settings.maxRecords);
    await storageSet({ [RECORDS_KEY]: nextRecords });
    state.lastCaptureAt = capturedAt;

    try {
      const notification = chrome.runtime.sendMessage({
        type: "VISIBLE_MULTIPLIER_CAPTURED",
        count: additions.length
      });

      if (notification?.catch) {
        notification.catch(() => {});
      }
    } catch {
      // The popup may be closed, which is fine. Data is already saved.
    }

    return additions.length;
  }

  async function captureSnapshot(mode = "auto") {
    const snapshot = readSnapshot();
    const delta = mode === "manual" ? visibleSnapshotInChronologicalOrder(snapshot) : snapshotDelta(state.lastSnapshot, snapshot);

    state.lastSnapshot = snapshot;
    return appendTokens(delta, mode);
  }

  function visibleSnapshotInChronologicalOrder(snapshot) {
    return state.settings.order === "newest-first" ? [...snapshot].reverse() : snapshot;
  }

  function scheduleCapture() {
    if (!state.running || state.scheduled) {
      return;
    }

    state.scheduled = true;
    window.setTimeout(async () => {
      state.scheduled = false;
      await captureSnapshot("auto");
    }, 600);
  }

  async function startCapture(settings) {
    state.settings = normalizeSettings(settings);
    state.running = true;
    state.lastSnapshot = [];

    stopObservers();

    if (document.body) {
      state.observer = new MutationObserver(scheduleCapture);
      state.observer.observe(document.body, {
        childList: true,
        characterData: true,
        subtree: true
      });
    }

    state.pollTimer = window.setInterval(() => {
      captureSnapshot("poll").catch(() => {});
    }, 2000);

    const imported = await captureSnapshot("start");
    return statusPayload({ imported });
  }

  function stopObservers() {
    if (state.observer) {
      state.observer.disconnect();
      state.observer = null;
    }

    if (state.pollTimer) {
      window.clearInterval(state.pollTimer);
      state.pollTimer = null;
    }
  }

  function stopCapture() {
    state.running = false;
    stopObservers();
    return statusPayload();
  }

  function statusPayload(extra = {}) {
    return {
      ok: true,
      running: state.running,
      settings: state.settings,
      lastCaptureAt: state.lastCaptureAt,
      lastSnapshotCount: state.lastSnapshot.length,
      frameUrl: location.href,
      frameTitle: document.title,
      ...extra
    };
  }

  async function initSiteAutoStart() {
    if (!isPepetaCaptureHost()) {
      return;
    }

    const stored = await storageGet([SITE_KEY, SETTINGS_KEY]);
    const siteSettings = normalizeSiteSettings(stored[SITE_KEY]);

    if (!siteSettings.pepetaAutoStart) {
      return;
    }

    const settings = normalizeSettings({
      ...PEPETA_SETTINGS,
      ...(stored[SETTINGS_KEY] || {})
    });
    await startCapture(settings);
  }

  function initPinnedPanel() {
    if (!isTopFrame() || !isPepetaPage()) {
      return;
    }

    if (document.getElementById("visible-multiplier-logger-panel")) {
      return;
    }

    const host = document.createElement("div");
    host.id = "visible-multiplier-logger-panel";
    host.style.position = "fixed";
    host.style.right = "14px";
    host.style.bottom = "14px";
    host.style.zIndex = "2147483647";
    document.documentElement.appendChild(host);

    const root = host.attachShadow({ mode: "open" });
    root.innerHTML = `
      <style>
        :host { all: initial; }
        .panel {
          width: 280px;
          border: 1px solid #d8e0e8;
          border-radius: 8px;
          background: #ffffff;
          color: #16212c;
          box-shadow: 0 16px 42px rgba(0, 0, 0, 0.22);
          font: 12px/1.35 Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          overflow: hidden;
        }
        .top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          border-bottom: 1px solid #edf1f5;
          padding: 8px 10px;
        }
        .title {
          display: grid;
          gap: 1px;
        }
        strong {
          font-size: 13px;
        }
        span {
          color: #637083;
        }
        .body {
          display: grid;
          gap: 8px;
          padding: 10px;
        }
        .actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
        }
        button {
          min-height: 30px;
          border: 1px solid #d8e0e8;
          border-radius: 7px;
          background: #fff;
          color: #16212c;
          cursor: pointer;
          font: inherit;
          font-weight: 700;
          padding: 0 8px;
        }
        button:hover {
          border-color: #9eacba;
        }
        .primary {
          border-color: #0f766e;
          background: #0f766e;
          color: #fff;
        }
        .danger {
          color: #b42318;
        }
        .wide {
          grid-column: span 2;
        }
        .signal-row {
          display: grid;
          grid-column: span 2;
          grid-template-columns: 1fr auto;
          gap: 6px;
        }
        .signal-row .wide {
          grid-column: auto;
        }
        .repeat-indicator {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 30px;
          min-width: 94px;
          border: 1px solid #d8e0e8;
          border-radius: 7px;
          background: #f8fafc;
          color: #637083;
          font-weight: 800;
          white-space: nowrap;
          padding: 0 8px;
        }
        .repeat-indicator::before {
          content: "";
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: #9eacba;
          margin-right: 6px;
        }
        .repeat-indicator.active {
          border-color: rgba(180, 35, 24, 0.28);
          background: rgba(180, 35, 24, 0.09);
          color: #b42318;
        }
        .repeat-indicator.active::before {
          background: #b42318;
          box-shadow: 0 0 0 4px rgba(180, 35, 24, 0.12);
        }
        .status {
          min-height: 17px;
          color: #637083;
        }
        .meta {
          display: grid;
          gap: 3px;
          border-top: 1px solid #edf1f5;
          padding-top: 7px;
        }
        .row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }
        .row b {
          white-space: nowrap;
        }
        .collapsed .body {
          display: none;
        }
      </style>
      <section class="panel" aria-label="Multiplier logger panel">
        <div class="top">
          <div class="title">
            <strong>STREAK</strong>
            <span id="panelSubtitle">Pepeta page</span>
          </div>
          <button id="collapseButton" type="button">Hide</button>
        </div>
        <div class="body">
          <div class="actions">
            <button id="panelStartButton" class="primary" type="button">Start</button>
            <button id="panelStopButton" class="danger" type="button">Stop</button>
            <button id="panelScanButton" type="button">Scan</button>
            <button id="panelDashboardButton" type="button">Dashboard</button>
            <div class="signal-row">
              <button id="panelAutoButton" class="wide" type="button">Auto start: Off</button>
              <span id="panelRepeatIndicator" class="repeat-indicator" title="Latest 5-round binned sequence has not repeated yet">Repeat: No</span>
            </div>
          </div>
          <div id="panelStatus" class="status">Ready.</div>
          <div class="meta">
            <div class="row"><span>Samples</span><b id="panelSamples">0</b></div>
            <div class="row"><span>Frames</span><b id="panelFrames">-</b></div>
            <div class="row"><span>Result chips</span><b id="panelVisible">-</b></div>
          </div>
        </div>
      </section>
    `;

    const panel = {
      host,
      root,
      shell: root.querySelector(".panel"),
      collapseButton: root.getElementById("collapseButton"),
      startButton: root.getElementById("panelStartButton"),
      stopButton: root.getElementById("panelStopButton"),
      scanButton: root.getElementById("panelScanButton"),
      dashboardButton: root.getElementById("panelDashboardButton"),
      autoButton: root.getElementById("panelAutoButton"),
      repeatIndicator: root.getElementById("panelRepeatIndicator"),
      status: root.getElementById("panelStatus"),
      samples: root.getElementById("panelSamples"),
      frames: root.getElementById("panelFrames"),
      visible: root.getElementById("panelVisible")
    };
    state.panel = panel;

    panel.collapseButton.addEventListener("click", () => {
      const collapsed = panel.shell.classList.toggle("collapsed");
      panel.collapseButton.textContent = collapsed ? "Show" : "Hide";
    });
    panel.startButton.addEventListener("click", () => runPanelCommand("start"));
    panel.stopButton.addEventListener("click", () => runPanelCommand("stop"));
    panel.scanButton.addEventListener("click", () => runPanelCommand("scan"));
    panel.dashboardButton.addEventListener("click", () => {
      sendRuntimeMessage({ type: "VISIBLE_MULTIPLIER_OPEN_DASHBOARD" });
    });
    panel.autoButton.addEventListener("click", togglePepetaAutoStart);

    addStorageChangeListener((changes, area) => {
      if (area === "local" && changes[RECORDS_KEY]) {
        updatePanelSamples(changes[RECORDS_KEY].newValue || []);
      }
      if (area === "local" && changes[SITE_KEY]) {
        updateAutoButton(normalizeSiteSettings(changes[SITE_KEY].newValue));
      }
    });

    refreshPanel();
  }

  async function refreshPanel() {
    if (!state.panel) {
      return;
    }

    const stored = await storageGet([RECORDS_KEY, SITE_KEY]);
    updatePanelSamples(stored[RECORDS_KEY] || []);
    updateAutoButton(normalizeSiteSettings(stored[SITE_KEY]));
  }

  function updatePanelSamples(records) {
    if (!state.panel) {
      return;
    }
    state.panel.samples.textContent = String(Array.isArray(records) ? records.length : 0);
    updateRepeatIndicator(records);
  }

  function updateAutoButton(siteSettings) {
    if (!state.panel) {
      return;
    }
    state.panel.autoButton.textContent = `Auto start: ${siteSettings.pepetaAutoStart ? "On" : "Off"}`;
  }

  function updateRepeatIndicator(records) {
    if (!state.panel?.repeatIndicator) {
      return;
    }

    const signal = repeatedSequenceSignal(records, 5);
    state.panel.repeatIndicator.classList.toggle("active", signal.repeated);
    state.panel.repeatIndicator.textContent = signal.repeated ? `Repeat: ${signal.count}x` : "Repeat: No";
    state.panel.repeatIndicator.title = signal.repeated
      ? `Latest ${signal.length}-round binned sequence repeated ${signal.count} times. ${signal.sequence.join(" > ")}`
      : signal.reason;
  }

  function repeatedSequenceSignal(records, length) {
    const values = (Array.isArray(records) ? records : [])
      .map((record) => Number(record.value))
      .filter(Number.isFinite);

    if (values.length < length * 2) {
      return {
        repeated: false,
        count: 0,
        length,
        sequence: [],
        reason: `Need at least ${length * 2} records to check repeated sequences.`
      };
    }

    const tokens = values.map(binMultiplier);
    const latest = tokens.slice(-length);
    const latestKey = latest.join("|");
    let count = 0;

    for (let index = 0; index <= tokens.length - length; index += 1) {
      const key = tokens.slice(index, index + length).join("|");
      if (key === latestKey) {
        count += 1;
      }
    }

    return {
      repeated: count > 1,
      count,
      length,
      sequence: latest,
      reason: `Latest ${length}-round binned sequence has not repeated yet.`
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

  async function runPanelCommand(command) {
    if (!state.panel) {
      return;
    }

    state.panel.status.textContent = command === "scan" ? "Scanning frames..." : `${command} requested...`;
    const settings = await loadCaptureSettings();
    const response = await sendRuntimeMessage({
      type: "VISIBLE_MULTIPLIER_TAB_COMMAND",
      command,
      settings
    });

    updatePanelFromResponse(response);
  }

  async function togglePepetaAutoStart() {
    const stored = await storageGet(SITE_KEY);
    const current = normalizeSiteSettings(stored[SITE_KEY]);
    const next = {
      ...current,
      pepetaAutoStart: !current.pepetaAutoStart
    };
    await storageSet({ [SITE_KEY]: next });
    updateAutoButton(next);

    if (next.pepetaAutoStart) {
      await runPanelCommand("start");
      return;
    }

    if (state.panel) {
      state.panel.status.textContent = "Auto start disabled.";
    }
  }

  function updatePanelFromResponse(response) {
    if (!state.panel) {
      return;
    }

    if (!response?.ok) {
      state.panel.status.textContent = response?.error || "Command failed.";
      return;
    }

    state.panel.frames.textContent = String(response.frameCount || 0);
    state.panel.visible.textContent = String(response.scanCount ?? response.lastSnapshotCount ?? 0);

    if (Number.isFinite(response.imported)) {
      state.panel.status.textContent = response.imported > 0
        ? `Started. Imported ${response.imported} confirmed result${response.imported === 1 ? "" : "s"}.`
        : "Started. No confirmed result chips found yet.";
      return;
    }

    if (Number.isFinite(response.captured)) {
      state.panel.status.textContent = `Captured ${response.captured} result${response.captured === 1 ? "" : "s"}.`;
      return;
    }

    if (Number.isFinite(response.scanCount)) {
      state.panel.status.textContent = `Scan found ${response.scanCount} visible result chip${response.scanCount === 1 ? "" : "s"}.`;
      return;
    }

    state.panel.status.textContent = response.running ? "Capture is running." : "Capture stopped.";
  }

  function sendRuntimeMessage(message) {
    return new Promise((resolve) => {
      if (!isExtensionContextAvailable()) {
        markExtensionContextInvalidated();
        resolve({ ok: false, error: "Extension was reloaded. Refresh this tab to reconnect." });
        return;
      }

      try {
        chrome.runtime.sendMessage(message, (response) => {
          const error = lastChromeError();
          if (error) {
            handleChromeApiError(error);
            resolve({ ok: false, error: error.message });
            return;
          }
          resolve(response);
        });
      } catch (error) {
        handleChromeApiError(error);
        resolve({ ok: false, error: error.message });
      }
    });
  }

  addRuntimeMessageListener((message, _sender, sendResponse) => {
    if (!message || !message.type) {
      return false;
    }

    if (message.type === "VISIBLE_MULTIPLIER_PING") {
      sendResponse(statusPayload());
      return false;
    }

    if (message.type === "VISIBLE_MULTIPLIER_START") {
      startCapture(message.settings)
        .then(sendResponse)
        .catch((error) => sendResponse({ ok: false, error: error.message }));
      return true;
    }

    if (message.type === "VISIBLE_MULTIPLIER_STOP") {
      sendResponse(stopCapture());
      return false;
    }

    if (message.type === "VISIBLE_MULTIPLIER_CAPTURE_NOW") {
      captureSnapshot("manual")
        .then((captured) => sendResponse(statusPayload({ captured })))
        .catch((error) => sendResponse({ ok: false, error: error.message }));
      return true;
    }

    if (message.type === "VISIBLE_MULTIPLIER_SCAN") {
      try {
        state.settings = normalizeSettings(message.settings || state.settings);
        const snapshot = readSnapshot();
        sendResponse(statusPayload({
          scanCount: snapshot.length,
          preview: snapshot.slice(0, 12).map((token) => token.raw)
        }));
      } catch (error) {
        sendResponse({ ok: false, error: error.message, frameUrl: location.href });
      }
      return false;
    }

    return false;
  });

  initPinnedPanel();
  initSiteAutoStart().catch((error) => handleChromeApiError(error));
})();
