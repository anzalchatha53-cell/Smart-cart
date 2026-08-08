import { CartItem, CURRENCIES } from "../types";
import { sounds } from "./soundEffects";

/**
 * Escapes text strings for safe CSV inclusion (handles quotes, commas, and line breaks)
 */
function escapeCSVField(field: string | number): string {
  if (field === undefined || field === null) return '""';
  const str = String(field);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Generates and triggers download of a CSV file containing cart items and budget summary
 */
export function exportCartToCSV(items: CartItem[], budgetLimit: number, currencyCode: string) {
  sounds.playClick();
  const curr = CURRENCIES[currencyCode] || CURRENCIES.PKR;
  const totalSpent = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const checkedCount = items.filter((i) => i.checked).length;
  const remainingBudget = budgetLimit - totalSpent;
  const formattedDate = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const csvRows: string[] = [];

  // 1. Executive Summary Headers
  csvRows.push(escapeCSVField("SMART CART AI - HOUSEHOLD EXPENSES & BUDGET REPORT"));
  csvRows.push(`Export Date,${escapeCSVField(formattedDate)}`);
  csvRows.push(`Selected Currency,${escapeCSVField(`${curr.code} (${curr.symbol})`)}`);
  csvRows.push(`Total Budget Limit,${escapeCSVField(budgetLimit)}`);
  csvRows.push(`Total Cart Spent,${escapeCSVField(totalSpent)}`);
  csvRows.push(`Remaining Budget,${escapeCSVField(remainingBudget)}`);
  csvRows.push(`Total Items Count,${escapeCSVField(items.length)}`);
  csvRows.push(`Purchased / Completed Items,${escapeCSVField(`${checkedCount} / ${items.length}`)}`);
  csvRows.push(""); // Blank row separator

  // 2. Itemized Table Column Headers
  const tableHeaders = [
    "Item #",
    "Item Name",
    "Category",
    "Quantity",
    "Unit",
    `Unit Price (${curr.symbol})`,
    `Total Amount (${curr.symbol})`,
    "Status",
    "Added Date",
  ];
  csvRows.push(tableHeaders.map(escapeCSVField).join(","));

  // 3. Item Rows
  items.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    const addedDateStr = new Date(item.addedAt).toLocaleDateString();
    const row = [
      index + 1,
      item.name,
      item.category,
      item.quantity,
      item.unit,
      item.price,
      itemTotal,
      item.checked ? "Completed (Checked)" : "Pending (In Cart)",
      addedDateStr,
    ];
    csvRows.push(row.map(escapeCSVField).join(","));
  });

  // 4. Create Blob & Trigger Download
  const csvContent = csvRows.join("\n");
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" }); // UTF-8 BOM for Excel compatibility
  const url = URL.createObjectURL(blob);

  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", url);
  downloadAnchor.setAttribute(
    "download",
    `smart_cart_expenses_${currencyCode}_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  document.body.removeChild(downloadAnchor);
  URL.revokeObjectURL(url);
}
