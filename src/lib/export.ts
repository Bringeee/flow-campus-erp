/** Minimal CSV export (opens natively in Excel) + printable PDF report. */
export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((r) =>
      r
        .map((cell) => {
          const v = String(cell ?? "");
          return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
        })
        .join(","),
    )
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function printPdf(title: string, headers: string[], rows: (string | number)[][]) {
  const win = window.open("", "_blank", "width=1024,height=768");
  if (!win) return false;
  win.document.write(`<!doctype html><html><head><title>${title}</title>
  <style>
    body{font-family:ui-sans-serif,system-ui,sans-serif;padding:32px;color:#0f172a}
    h1{font-size:20px;margin:0}
    p{color:#64748b;font-size:12px;margin:4px 0 20px}
    table{width:100%;border-collapse:collapse;font-size:12px}
    th,td{border:1px solid #e2e8f0;padding:6px 8px;text-align:left}
    th{background:#f1f5f9}
  </style></head><body>
  <h1>VTOP — ${title}</h1>
  <p>VIT On Top. Complete Control. · Generated ${new Date().toLocaleString("en-IN")}</p>
  <table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
  <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>
  </body></html>`);
  win.document.close();
  win.focus();
  win.print();
  return true;
}
