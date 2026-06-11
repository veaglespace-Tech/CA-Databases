/**
 * Converts an array of objects to a CSV string and triggers a browser download.
 * Works without any external library. Opens correctly in Microsoft Excel.
 *
 * @param {string[]} headers  - Column header labels (display names)
 * @param {string[]} keys     - Object keys matching each header
 * @param {object[]} rows     - Data rows
 * @param {string}   filename - Download filename (without extension)
 */
export function downloadCsv(headers, keys, rows, filename = "export") {
  function escapeCell(value) {
    if (value === null || value === undefined) return "";
    const str = String(value);
    // Wrap in quotes if the value contains commas, quotes, or newlines
    if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
      return `"${str.replaceAll('"', '""')}"`;
    }
    return str;
  }

  const headerRow = headers.map(escapeCell).join(",");
  const dataRows = rows.map((row) => keys.map((key) => escapeCell(row[key])).join(","));

  // BOM (byte-order mark) ensures Excel opens the file with correct UTF-8 encoding
  const bom = "\uFEFF";
  const csv = bom + [headerRow, ...dataRows].join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
