(function (globalScope) {
  const BOT_KEY = "visibleMultiplierLogger.bot";
  const BOT_LOG_KEY = "visibleMultiplierLogger.botLog";
  const DEFAULT_BOT_SETTINGS = {
    enabled: false,
    repeatAlerts: true,
    gapAlerts: true,
    clusterAlerts: true,
    minRecords: 120,
    repeatLength: 5,
    threshold: 10,
    cooldownMinutes: 30
  };

  function normalizeSettings(settings = {}) {
    return {
      ...DEFAULT_BOT_SETTINGS,
      ...settings,
      enabled: Boolean(settings.enabled),
      repeatAlerts: settings.repeatAlerts !== false,
      gapAlerts: settings.gapAlerts !== false,
      clusterAlerts: settings.clusterAlerts !== false,
      minRecords: clampInteger(settings.minRecords, 50, 5000, DEFAULT_BOT_SETTINGS.minRecords),
      repeatLength: clampInteger(settings.repeatLength, 3, 10, DEFAULT_BOT_SETTINGS.repeatLength),
      threshold: clampValue(settings.threshold, 2, 1000, DEFAULT_BOT_SETTINGS.threshold),
      cooldownMinutes: clampInteger(settings.cooldownMinutes, 5, 1440, DEFAULT_BOT_SETTINGS.cooldownMinutes)
    };
  }

  function analyze(records, rawSettings = DEFAULT_BOT_SETTINGS) {
    const settings = normalizeSettings(rawSettings);
    const cleanRecords = Array.isArray(records) ? records.filter(Boolean) : [];
    const values = cleanRecords
      .map((record) => Number(record.value))
      .filter(Number.isFinite);
    const total = values.length;
    const latestRecord = cleanRecords[cleanRecords.length - 1] || null;
    const repeat = latestRepeatSignal(values, settings.repeatLength);
    const highHitIndexes = [];

    values.forEach((value, index) => {
      if (value >= settings.threshold) {
        highHitIndexes.push(index);
      }
    });

    const gaps = [];
    for (let index = 1; index < highHitIndexes.length; index += 1) {
      gaps.push(highHitIndexes[index] - highHitIndexes[index - 1] - 1);
    }

    const avgGap = meanSafe(gaps);
    const currentGap = highHitIndexes.length ? total - 1 - highHitIndexes[highHitIndexes.length - 1] : total;
    const recentWindow = values.slice(-12);
    const recentHighHits = recentWindow.filter((value) => value >= settings.threshold).length;
    const ready = total >= settings.minRecords;
    const triggers = [];

    if (
      ready &&
      settings.repeatAlerts &&
      repeat.repeated
    ) {
      triggers.push({
        kind: "repeat",
        level: repeat.count >= 3 ? "strong" : "watch",
        title: `Repeated ${repeat.length}-round sequence`,
        message: `Latest ${repeat.length}-round binned sequence repeated ${repeat.count} times.`,
        signature: `${repeat.length}:${repeat.sequence.join("|")}`,
        score: Math.min(100, 40 + repeat.count * 15)
      });
    }

    if (
      ready &&
      settings.gapAlerts &&
      Number.isFinite(avgGap) &&
      highHitIndexes.length >= 6 &&
      currentGap >= Math.max(10, avgGap * 1.75)
    ) {
      triggers.push({
        kind: "gap",
        level: "watch",
        title: `${formatThreshold(settings.threshold)}+ dry stretch`,
        message: `Current gap is ${currentGap} rounds versus ${avgGap.toFixed(1)} average.`,
        signature: `${settings.threshold}:${Math.round(currentGap)}`,
        score: Math.min(100, 35 + Math.round((currentGap / Math.max(avgGap, 1)) * 18))
      });
    }

    if (
      ready &&
      settings.clusterAlerts &&
      recentWindow.length >= 8 &&
      recentHighHits >= 2
    ) {
      triggers.push({
        kind: "cluster",
        level: recentHighHits >= 3 ? "strong" : "watch",
        title: `${formatThreshold(settings.threshold)}+ cluster`,
        message: `${recentHighHits} high hits appeared in the last ${recentWindow.length} rounds.`,
        signature: `${settings.threshold}:${recentHighHits}:${recentWindow.length}`,
        score: Math.min(100, 30 + recentHighHits * 18)
      });
    }

    return {
      ready,
      total,
      settings,
      latestRecord,
      repeat,
      currentGap,
      avgGap,
      recentHighHits,
      triggers
    };
  }

  function latestRepeatSignal(values, length) {
    if (values.length < length * 2) {
      return {
        repeated: false,
        count: 0,
        length,
        sequence: [],
        reason: `Need at least ${length * 2} records.`
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
      reason: count > 1 ? "Repeated sequence detected." : "No repeated sequence."
    };
  }

  function shouldNotify(signal, logs, settings, now = Date.now()) {
    const cooldownMs = normalizeSettings(settings).cooldownMinutes * 60 * 1000;
    const recentMatch = findRecentLogMatch(signal, logs, cooldownMs, now);

    return !recentMatch;
  }

  function getCooldownState(logs, rawSettings = DEFAULT_BOT_SETTINGS, triggers = [], now = Date.now()) {
    const settings = normalizeSettings(rawSettings);
    const cooldownMs = settings.cooldownMinutes * 60 * 1000;
    const muted = (Array.isArray(triggers) ? triggers : [])
      .map((trigger) => {
        const entry = findRecentLogMatch(trigger, logs, cooldownMs, now);
        if (!entry) {
          return null;
        }

        const createdAtMs = Date.parse(entry.createdAt || 0);
        const remainingMs = cooldownMs - (now - createdAtMs);
        if (!Number.isFinite(remainingMs) || remainingMs <= 0) {
          return null;
        }

        return {
          trigger,
          entry,
          createdAtMs,
          remainingMs
        };
      })
      .filter(Boolean)
      .sort((left, right) => left.remainingMs - right.remainingMs);

    return {
      cooling: muted.length > 0,
      mutedCount: muted.length,
      activeTriggerCount: Array.isArray(triggers) ? triggers.length : 0,
      nextReadyMs: muted[0]?.remainingMs || 0,
      fullClearMs: muted.length ? muted[muted.length - 1].remainingMs : 0,
      cooldownMs,
      entries: muted
    };
  }

  function findRecentLogMatch(signal, logs, cooldownMs, now = Date.now()) {
    const entries = Array.isArray(logs) ? logs : [];
    let latestMatch = null;
    let latestCreatedAt = -Infinity;

    entries.forEach((entry) => {
      if (!entry || entry.kind !== signal.kind || entry.signature !== signal.signature) {
        return;
      }

      const createdAtMs = Date.parse(entry.createdAt || 0);
      if (!Number.isFinite(createdAtMs)) {
        return;
      }

      if (now - createdAtMs >= cooldownMs) {
        return;
      }

      if (createdAtMs > latestCreatedAt) {
        latestCreatedAt = createdAtMs;
        latestMatch = entry;
      }
    });

    return latestMatch;
  }

  function formatDuration(ms) {
    const totalSeconds = Math.max(0, Math.ceil(Number(ms) / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
    }

    if (minutes > 0) {
      return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
    }

    return `${seconds}s`;
  }

  function makeLogEntry(signal, analysis) {
    return {
      id: `${signal.kind}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      kind: signal.kind,
      level: signal.level,
      title: signal.title,
      message: signal.message,
      signature: signal.signature,
      score: signal.score,
      createdAt: new Date().toISOString(),
      total: analysis.total,
      latestValue: Number(analysis.latestRecord?.value) || null
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

  function formatThreshold(value) {
    return Number.isFinite(value) && value % 1 !== 0 ? `${value.toFixed(1)}x` : `${Number(value).toFixed(0)}x`;
  }

  function meanSafe(values) {
    return values.length ? values.reduce((total, value) => total + value, 0) / values.length : null;
  }

  function clampValue(value, min, max, fallback) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return fallback;
    }

    return Math.max(min, Math.min(max, numeric));
  }

  function clampInteger(value, min, max, fallback) {
    return Math.floor(clampValue(value, min, max, fallback));
  }

  const api = {
    BOT_KEY,
    BOT_LOG_KEY,
    DEFAULT_BOT_SETTINGS,
    normalizeSettings,
    analyze,
    shouldNotify,
    makeLogEntry,
    getCooldownState,
    formatDuration
  };

  globalScope.StreakBot = api;
})(typeof self !== "undefined" ? self : window);
