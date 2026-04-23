const SHEET_NAME = "AviatorResults";
const HEADERS = [
  "id",
  "capturedAt",
  "value",
  "raw",
  "mode",
  "pageTitle",
  "pageUrl",
  "sourceKind",
  "sourceGroup",
  "frameUrl",
  "frameRole",
  "sourceHost",
  "captureSessionId",
  "storedAt"
];

function doGet(e) {
  return handleRequest(e, "GET");
}

function doPost(e) {
  return handleRequest(e, "POST");
}

function handleRequest(e, method) {
  try {
    const request = method === "GET" ? e.parameter : parseBody(e);
    verifyToken(request.token);

    const action = request.action || "status";

    if (action === "append") {
      return jsonResponse(appendRecords(request.records || []));
    }

    if (action === "list") {
      return jsonResponse(listRecords());
    }

    return jsonResponse(status());
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message });
  }
}

function parseBody(e) {
  if (!e.postData || !e.postData.contents) {
    return {};
  }

  return JSON.parse(e.postData.contents);
}

function verifyToken(token) {
  const expected = PropertiesService.getScriptProperties().getProperty("ACCESS_TOKEN");
  if (expected && token !== expected) {
    throw new Error("Invalid access token.");
  }
}

function getSpreadsheet() {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (spreadsheetId) {
    return SpreadsheetApp.openById(spreadsheetId);
  }

  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (!active) {
    throw new Error("No active spreadsheet. Add SPREADSHEET_ID in Script Properties.");
  }

  return active;
}

function getSheet() {
  const spreadsheet = getSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  ensureHeaders(sheet);
  return sheet;
}

function ensureHeaders(sheet) {
  const firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const needsHeaders = HEADERS.some(function (header, index) {
    return firstRow[index] !== header;
  });

  if (needsHeaders) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
}

function appendRecords(records) {
  const sheet = getSheet();
  const existingIds = getExistingIds(sheet);
  const storedAt = new Date().toISOString();
  const rows = [];
  const syncedIds = [];
  let skipped = 0;

  records.forEach(function (record) {
    if (!record || !record.id || existingIds[record.id]) {
      skipped += 1;
      return;
    }

    rows.push([
      String(record.id),
      String(record.capturedAt || ""),
      Number(record.value),
      String(record.raw || ""),
      String(record.mode || ""),
      String(record.pageTitle || ""),
      String(record.pageUrl || ""),
      String(record.sourceKind || ""),
      String(record.sourceGroup || ""),
      String(record.frameUrl || record.pageUrl || ""),
      String(record.frameRole || ""),
      String(record.sourceHost || ""),
      String(record.captureSessionId || ""),
      storedAt
    ]);
    syncedIds.push(String(record.id));
    existingIds[record.id] = true;
  });

  if (rows.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, HEADERS.length).setValues(rows);
  }

  return {
    ok: true,
    appended: rows.length,
    skipped: skipped,
    syncedIds: syncedIds,
    rows: Math.max(0, sheet.getLastRow() - 1),
    sheetName: sheet.getName()
  };
}

function getExistingIds(sheet) {
  const lastRow = sheet.getLastRow();
  const ids = {};

  if (lastRow <= 1) {
    return ids;
  }

  const values = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  values.forEach(function (row) {
    if (row[0]) {
      ids[String(row[0])] = true;
    }
  });

  return ids;
}

function listRecords() {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return { ok: true, records: [], rows: 0, sheetName: sheet.getName() };
  }

  const values = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  const records = values.map(function (row) {
    return {
      id: String(row[0] || ""),
      capturedAt: toIsoString(row[1]),
      value: Number(row[2]),
      raw: String(row[3] || ""),
      mode: String(row[4] || ""),
      pageTitle: String(row[5] || ""),
      pageUrl: String(row[6] || ""),
      sourceKind: String(row[7] || ""),
      sourceGroup: String(row[8] || ""),
      frameUrl: String(row[9] || row[6] || ""),
      frameRole: String(row[10] || ""),
      sourceHost: String(row[11] || ""),
      captureSessionId: String(row[12] || "")
    };
  }).filter(function (record) {
    return record.id && isFinite(record.value);
  });

  return {
    ok: true,
    records: records,
    rows: records.length,
    sheetName: sheet.getName()
  };
}

function status() {
  const sheet = getSheet();
  return {
    ok: true,
    rows: Math.max(0, sheet.getLastRow() - 1),
    sheetName: sheet.getName()
  };
}

function toIsoString(value) {
  if (Object.prototype.toString.call(value) === "[object Date]" && !isNaN(value.getTime())) {
    return value.toISOString();
  }

  return String(value || "");
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
