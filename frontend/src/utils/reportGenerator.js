import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';

const API_URL = `http://${window.location.hostname}:5000/api`;

export async function downloadDailyReport() {
  const { data } = await axios.get(`${API_URL}/admin/report`);
  const doc = new jsPDF();
  const orange = [252, 128, 25];
  const dark   = [30, 30, 30];

  /* ── Header ── */
  doc.setFillColor(...orange);
  doc.rect(0, 0, 210, 38, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('SmartCanteen', 14, 16);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Daily Sales Report', 14, 25);
  doc.text(`Date: ${data.date}   |   Generated: ${data.generated_at}`, 14, 33);

  /* ── Summary cards ── */
  doc.setTextColor(...dark);
  doc.setFontSize(10);
  const stats = [
    ['Total Orders', data.total_orders],
    ['Completed',    data.completed],
    ['Active',       data.active],
    ['Total Revenue',`Rs.${data.total_revenue}`],
    ['Avg Order',    `Rs.${data.avg_order}`],
  ];
  let sx = 14;
  stats.forEach(([label, val]) => {
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(sx, 44, 36, 20, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...orange);
    doc.text(String(val), sx + 18, 57, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(label, sx + 18, 62, { align: 'center' });
    sx += 39;
  });

  /* ── Top Items ── */
  doc.setTextColor(...dark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Top Selling Items', 14, 76);
  autoTable(doc, {
    startY: 80,
    head: [['Rank', 'Item Name', 'Qty Sold']],
    body: data.top_items.map((it, i) => [i + 1, it.name, it.qty]),
    headStyles: { fillColor: orange, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [252, 242, 230] },
    styles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
    tableWidth: 90,
  });

  /* ── All Orders Table ── */
  const afterTop = doc.lastAutoTable.finalY + 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...dark);
  doc.text('All Orders', 14, afterTop);

  autoTable(doc, {
    startY: afterTop + 4,
    head: [['Token', 'Order ID', 'Items', 'Total', 'Pickup', 'Status']],
    body: data.orders.map(o => [
      `#${o.token_number}`,
      o.order_id,
      o.items.map(i => `${i.quantity}x ${i.name}`).join(', '),
      `Rs.${o.total_price}`,
      o.pickup_time,
      o.status,
    ]),
    headStyles: { fillColor: dark, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 14 },
      1: { cellWidth: 24 },
      2: { cellWidth: 64 },
      3: { cellWidth: 18 },
      4: { cellWidth: 28 },
      5: { cellWidth: 22 },
    },
    margin: { left: 14, right: 14 },
    didParseCell(data) {
      if (data.column.index === 5 && data.section === 'body') {
        const s = data.cell.raw;
        data.cell.styles.textColor =
          s === 'Completed' ? [34, 139, 34] :
          s === 'Ready'     ? [0, 160, 100] :
          s === 'Preparing' ? [30, 120, 220] : [200, 150, 0];
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  /* ── Footer ── */
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`SmartCanteen — Confidential   |   Page ${i} of ${pages}`, 105, 292, { align: 'center' });
  }

  doc.save(`SmartCanteen_Report_${data.date.replace(/ /g, '_')}.pdf`);
}
