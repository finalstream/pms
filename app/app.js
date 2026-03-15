const STORAGE_KEY = "pms_monthly_performances_v1";

const form = document.getElementById("performance-form");
const historyBody = document.getElementById("history-body");
const comparison = document.getElementById("comparison");

const dashRevenue = document.getElementById("dashRevenue");
const dashCost = document.getElementById("dashCost");
const dashGrossProfit = document.getElementById("dashGrossProfit");
const dashGrossMargin = document.getElementById("dashGrossMargin");
const dashOrders = document.getElementById("dashOrders");
const dashInternal = document.getElementById("dashInternal");

const targetMonth = document.getElementById("targetMonth");
const revenue = document.getElementById("revenue");
const cost = document.getElementById("cost");
const ordersReceived = document.getElementById("ordersReceived");
const internalOrders = document.getElementById("internalOrders");
const note = document.getElementById("note");

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveData(rows) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function formatNumber(value) {
  return Number(value).toLocaleString("ja-JP", { maximumFractionDigits: 2 });
}

function toPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function grossProfit(rec) {
  return Number(rec.revenue) - Number(rec.cost);
}

function grossMargin(rec) {
  const rev = Number(rec.revenue);
  if (rev === 0) return 0;
  return grossProfit(rec) / rev;
}

function sortByMonthDesc(rows) {
  return [...rows].sort((a, b) => b.targetMonth.localeCompare(a.targetMonth));
}

function render() {
  const rows = sortByMonthDesc(loadData());

  historyBody.innerHTML = rows
    .map((rec) => {
      const gp = grossProfit(rec);
      const gm = grossMargin(rec);
      return `
      <tr>
        <td>${rec.targetMonth}</td>
        <td>${formatNumber(rec.revenue)}</td>
        <td>${formatNumber(rec.cost)}</td>
        <td>${formatNumber(gp)}</td>
        <td>${toPercent(gm)}</td>
        <td>${formatNumber(rec.ordersReceived)}</td>
        <td>${formatNumber(rec.internalOrders)}</td>
        <td>${rec.note ?? ""}</td>
      </tr>
    `;
    })
    .join("");

  if (!rows.length) {
    historyBody.innerHTML = '<tr><td colspan="8" class="muted">データがありません。</td></tr>';
    [dashRevenue, dashCost, dashGrossProfit, dashGrossMargin, dashOrders, dashInternal].forEach((el) => {
      el.textContent = "-";
    });
    comparison.textContent = "前月データがありません。";
    return;
  }

  const latest = rows[0];
  const prev = rows[1];

  dashRevenue.textContent = formatNumber(latest.revenue);
  dashCost.textContent = formatNumber(latest.cost);
  dashGrossProfit.textContent = formatNumber(grossProfit(latest));
  dashGrossMargin.textContent = toPercent(grossMargin(latest));
  dashOrders.textContent = formatNumber(latest.ordersReceived);
  dashInternal.textContent = formatNumber(latest.internalOrders);

  if (!prev) {
    comparison.textContent = "前月データがありません。";
    return;
  }

  const revDiff = Number(latest.revenue) - Number(prev.revenue);
  const gpDiff = grossProfit(latest) - grossProfit(prev);
  const revRate = Number(prev.revenue) === 0 ? 0 : revDiff / Number(prev.revenue);

  comparison.textContent = `前月比: 売上 ${revDiff >= 0 ? "+" : ""}${formatNumber(revDiff)} (${toPercent(
    revRate
  )}) / 粗利 ${gpDiff >= 0 ? "+" : ""}${formatNumber(gpDiff)}`;
}

function upsertRecord(event) {
  event.preventDefault();

  const newRecord = {
    targetMonth: targetMonth.value,
    revenue: Number(revenue.value || 0),
    cost: Number(cost.value || 0),
    ordersReceived: Number(ordersReceived.value || 0),
    internalOrders: Number(internalOrders.value || 0),
    note: note.value.trim(),
  };

  const rows = loadData();
  const existingIdx = rows.findIndex((r) => r.targetMonth === newRecord.targetMonth);

  if (existingIdx >= 0) {
    rows[existingIdx] = newRecord;
  } else {
    rows.push(newRecord);
  }

  saveData(rows);
  render();
  form.reset();
}

function resetForm() {
  form.reset();
}

function clearAll() {
  const accepted = window.confirm("全データを削除します。よろしいですか？");
  if (!accepted) return;
  saveData([]);
  render();
}

function downloadCsv() {
  const rows = sortByMonthDesc(loadData());
  if (!rows.length) {
    window.alert("出力対象データがありません。");
    return;
  }

  const header = ["target_month", "revenue", "cost", "gross_profit", "gross_margin", "orders_received", "internal_orders", "note"];
  const lines = rows.map((rec) => {
    const gp = grossProfit(rec);
    const gm = grossMargin(rec);
    return [
      rec.targetMonth,
      rec.revenue,
      rec.cost,
      gp,
      gm,
      rec.ordersReceived,
      rec.internalOrders,
      `"${String(rec.note ?? "").replaceAll('"', '""')}"`,
    ].join(",");
  });

  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `performances_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

form.addEventListener("submit", upsertRecord);
document.getElementById("reset-button").addEventListener("click", resetForm);
document.getElementById("clear-all").addEventListener("click", clearAll);
document.getElementById("download-csv").addEventListener("click", downloadCsv);

render();
