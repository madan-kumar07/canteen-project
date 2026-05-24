import { useState, useEffect } from 'react';
import { ArrowLeft, Download, FileText, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiGetReport } from '../../api';
import { Button } from '../ui/Button';
import { formatCurrency, cn } from '../../lib/utils';

export default function ReportsPage() {
  const { navigate, toast } = useApp();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await apiGetReport();
      setReport(data);
    } catch { toast('error', 'Error', 'Could not load report'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReport(); }, []);

  const downloadPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      if (!report) return;
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });

      // Header
      doc.setFillColor(255, 96, 25);
      doc.rect(0, 0, 210, 28, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text('SmartCanteen — Daily Report', 14, 13);
      doc.setFontSize(10);
      doc.text(`${report.date} · Generated at ${report.generated_at}`, 14, 22);

      // Stats
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.text('Summary', 14, 40);
      doc.setFontSize(10);
      const stats = [
        ['Total Orders',    report.total_orders],
        ['Completed',       report.completed],
        ['Active/Pending',  report.active],
        ['Total Revenue',   formatCurrency(report.total_revenue)],
        ['Avg Order Value', formatCurrency(report.avg_order)],
      ];
      stats.forEach(([k, v], i) => {
        doc.text(`${k}:`, 14, 50 + i * 8);
        doc.text(String(v), 80, 50 + i * 8);
      });

      // Top Items
      doc.setFontSize(12);
      doc.text('Top Selling Items', 14, 100);
      doc.setFontSize(10);
      (report.top_items || []).forEach((item, i) => {
        doc.text(`${i + 1}. ${item.name}`, 14, 110 + i * 7);
        doc.text(`${item.qty} units`, 120, 110 + i * 7);
      });

      doc.save(`smartcanteen-report-${new Date().toISOString().slice(0,10)}.pdf`);
      toast('success', 'Downloaded', 'Report exported as PDF');
    } catch (err) {
      toast('error', 'Export Failed', err.message || 'Could not generate PDF');
    }
  };

  const downloadCSV = () => {
    if (!report?.orders?.length) { toast('error', 'No Data', 'No orders to export'); return; }
    const rows = [
      ['Token', 'Items', 'Total', 'Status', 'Payment', 'Placed At'],
      ...(report.orders || []).map(o => [
        o.token || o.token_number,
        (o.items || []).map(i => `${i.name}x${i.qty||1}`).join(';'),
        o.total_price || o.total || 0,
        o.status,
        o.payment_method || 'counter',
        new Date((o.placedAt || o.timestamp * 1000) || Date.now()).toLocaleString('en-IN'),
      ])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `orders-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast('success', 'Downloaded', 'Orders exported as CSV');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-10 pt-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('admin')} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-h1">Reports</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchReport} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400">
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>
          <Button variant="secondary" size="sm" icon={<Download className="w-3.5 h-3.5" />} onClick={downloadCSV}>Export CSV</Button>
          <Button variant="primary"   size="sm" icon={<FileText  className="w-3.5 h-3.5" />} onClick={downloadPDF}>Export PDF</Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-32 rounded-2xl bg-surface-100 dark:bg-surface-800 animate-pulse" />)}
        </div>
      ) : report ? (
        <div className="space-y-5">
          {/* Report header */}
          <div className="p-5 bg-gradient-to-r from-brand-500 to-brand-700 rounded-2xl text-white">
            <p className="text-white/80 text-sm">Daily Report</p>
            <p className="font-display font-bold text-2xl mt-1">{report.date}</p>
            <p className="text-white/70 text-xs mt-1">Generated at {report.generated_at}</p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Total Orders',    value: report.total_orders  },
              { label: 'Completed',       value: report.completed     },
              { label: 'Active',          value: report.active        },
              { label: 'Total Revenue',   value: formatCurrency(report.total_revenue) },
              { label: 'Avg Order',       value: formatCurrency(report.avg_order)     },
              { label: 'Completion Rate', value: `${report.total_orders ? Math.round(report.completed / report.total_orders * 100) : 0}%` },
            ].map(s => (
              <div key={s.label} className="p-4 bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 rounded-2xl">
                <p className="text-xl font-bold text-surface-900 dark:text-surface-50">{s.value}</p>
                <p className="text-xs text-surface-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Top Items */}
          <div className="p-5 bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 rounded-2xl">
            <h2 className="font-bold text-surface-900 dark:text-surface-100 mb-4">Top 10 Items</h2>
            <div className="space-y-3">
              {(report.top_items || []).map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-brand-500/10 flex items-center justify-center text-xs font-bold text-brand-500 flex-shrink-0">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-surface-900 dark:text-surface-100">{item.name}</span>
                      <span className="text-sm font-bold text-surface-900 dark:text-surface-50">{item.qty} sold</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-100 dark:bg-surface-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand-500"
                        style={{ width: `${(item.qty / (report.top_items[0]?.qty || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Orders table */}
          <div className="bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-100 dark:border-surface-800">
              <h2 className="font-bold text-surface-900 dark:text-surface-100">All Orders ({(report.orders || []).length})</h2>
            </div>
            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-xs">
                <thead className="bg-surface-50 dark:bg-surface-800/50 sticky top-0">
                  <tr>
                    {['Token', 'Items', 'Total', 'Status', 'Payment'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-bold text-surface-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                  {(report.orders || []).map((o, i) => (
                    <tr key={i} className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors">
                      <td className="px-4 py-2.5 font-mono font-bold">#{o.token || o.token_number}</td>
                      <td className="px-4 py-2.5 text-surface-500 max-w-[180px] truncate">{(o.items || []).map(i => `${i.name}×${i.qty||1}`).join(', ')}</td>
                      <td className="px-4 py-2.5 font-semibold">{formatCurrency(o.total_price || o.total || 0)}</td>
                      <td className="px-4 py-2.5">
                        <span className={cn('px-2 py-1 rounded-full text-xs font-semibold',
                          o.status === 'Completed' ? 'bg-green-500/15 text-green-600' :
                          o.status === 'Cancelled' ? 'bg-red-500/15 text-red-600'    : 'bg-amber-500/15 text-amber-600'
                        )}>{o.status}</span>
                      </td>
                      <td className="px-4 py-2.5 text-surface-400 capitalize">{o.payment_method || 'counter'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center text-surface-400">
          <p>No report data available</p>
        </div>
      )}
    </div>
  );
}
