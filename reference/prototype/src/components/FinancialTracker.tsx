import React, { useState } from 'react';
import { FinancialTransaction } from '../types/clinic';
import { CLINIC_INFO } from '../data/initialData';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Plus, 
  Download, 
  Trash2, 
  Filter, 
  CreditCard, 
  Banknote, 
  Building,
  Check
} from 'lucide-react';

interface FinancialTrackerProps {
  transactions: FinancialTransaction[];
  onAddTransaction: (txn: Omit<FinancialTransaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
}

export const FinancialTracker: React.FC<FinancialTrackerProps> = ({
  transactions,
  onAddTransaction,
  onDeleteTransaction,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Form State
  const [txnType, setTxnType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState<FinancialTransaction['category']>('Tıbbi Sarf Malzeme (Bant, İğne, Örtü)');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'Nakit' | 'Kredi Kartı' | 'Havale/EFT'>('Havale/EFT');
  const [patientName, setPatientName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2026-11-02');

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  const filteredTransactions = transactions.filter(t => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesSearch = 
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.patientName && t.patientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Calculate expense categories breakdown
  const expenseByCategory: Record<string, number> = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
    });

  // Calculate income categories breakdown
  const incomeByCategory: Record<string, number> = {};
  transactions
    .filter(t => t.type === 'income')
    .forEach(t => {
      incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
    });

  const handleExportCSV = () => {
    const headers = ['İşlem ID', 'Tarih', 'Tür', 'Kategori', 'Tutar (TL)', 'Ödeme Türü', 'Açıklama', 'Hasta', 'Makbuz/Fatura No'];
    const rows = filteredTransactions.map(t => [
      t.id,
      t.date,
      t.type === 'income' ? 'Gelir' : 'Gider',
      `"${t.category}"`,
      t.amount,
      t.paymentMethod,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${t.patientName || '-'}"`,
      t.receiptNumber,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hamit_Gumus_Klinik_Mali_Rapor_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    onAddTransaction({
      date,
      type: txnType,
      category,
      amount: Number(amount),
      paymentMethod,
      patientName: txnType === 'income' ? patientName : undefined,
      description: description || (txnType === 'income' ? `${patientName} seans ödemesi` : category),
      receiptNumber: txnType === 'income' ? `MAK-${Date.now().toString().slice(-4)}` : `GDR-${Date.now().toString().slice(-4)}`,
    });

    setIsAddModalOpen(false);
    setAmount('');
    setDescription('');
    setPatientName('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Klinik Finans, Kasa & Gider Takibi</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Fzt. Hamit Gümüş Mersin Limonluk kliniği seans gelirleri, kira ve sarf malzeme gider defteri
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Rapor İndirildi!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-slate-500" />
                <span>Excel / CSV Dışa Aktar</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#82A381] hover:bg-[#6D8E6C] rounded-lg transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Gelir / Gider Ekle</span>
          </button>
        </div>
      </div>

      {/* KPI Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Income */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Toplam Seans & Paket Gelirleri</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {totalIncome.toLocaleString('tr-TR')} ₺
            </span>
            <span className="text-[11px] text-emerald-600 block mt-1 font-medium">
              +{transactions.filter(t => t.type === 'income').length} tahsilat kaydedildi
            </span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Klinik Giderleri & Sarf Malzeme</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-rose-600 tabular-nums">
              {totalExpenses.toLocaleString('tr-TR')} ₺
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Kira (Hantaş Prestij), medikal bant, elektrik
            </span>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Net Klinik Bakiyesi (Kâr)</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-teal-800 tabular-nums">
              {netBalance.toLocaleString('tr-TR')} ₺
            </span>
            <span className="text-[11px] text-teal-700 block mt-1 font-medium">
              Kâr Marjı: %{totalIncome > 0 ? Math.round((netBalance / totalIncome) * 100) : 0}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Breakdowns: Income vs Expense Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Income Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center justify-between">
            <span>Gelir Dağılımı (Paketler & Seanslar)</span>
            <span className="text-[11px] font-mono text-emerald-700 font-semibold">{totalIncome.toLocaleString('tr-TR')} ₺</span>
          </h3>
          <div className="space-y-2.5">
            {Object.entries(incomeByCategory).map(([cat, val]) => {
              const pct = totalIncome > 0 ? Math.round((val / totalIncome) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-700 font-medium">{cat}</span>
                    <span className="font-mono text-slate-900 font-semibold">{val.toLocaleString('tr-TR')} ₺ (%{pct})</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expense Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center justify-between">
            <span>Klinik Gider Kalemleri</span>
            <span className="text-[11px] font-mono text-rose-600 font-semibold">{totalExpenses.toLocaleString('tr-TR')} ₺</span>
          </h3>
          <div className="space-y-2.5">
            {Object.entries(expenseByCategory).map(([cat, val]) => {
              const pct = totalExpenses > 0 ? Math.round((val / totalExpenses) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-700 font-medium truncate pr-2">{cat}</span>
                    <span className="font-mono text-rose-600 font-semibold shrink-0">{val.toLocaleString('tr-TR')} ₺ (%{pct})</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter bar for transactions */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold w-full sm:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md transition-colors ${filterType === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'}`}
          >
            Tüm İşlemler ({transactions.length})
          </button>
          <button
            onClick={() => setFilterType('income')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md transition-colors ${filterType === 'income' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600'}`}
          >
            Sadece Gelirler
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md transition-colors ${filterType === 'expense' ? 'bg-white text-rose-800 shadow-2xs' : 'text-slate-600'}`}
          >
            Sadece Giderler
          </button>
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="İşlem veya açıklama ara..."
          className="text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 w-full sm:w-64 focus:outline-teal-600"
        />
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Tarih</th>
                <th className="py-3 px-4">Tür & Kategori</th>
                <th className="py-3 px-4">Açıklama / Hasta</th>
                <th className="py-3 px-4">Ödeme Yöntemi</th>
                <th className="py-3 px-4">Makbuz / Fatura</th>
                <th className="py-3 px-4 text-right">Tutar</th>
                <th className="py-3 px-4 text-right">Sil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((txn) => {
                const isIncome = txn.type === 'income';

                return (
                  <tr key={txn.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {txn.date}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isIncome ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className="font-semibold text-slate-900">{txn.category}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-700">
                      <div>{txn.description}</div>
                      {txn.patientName && (
                        <span className="text-[11px] text-teal-800 font-medium">Hasta: {txn.patientName}</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <span className="inline-flex items-center gap-1 font-medium">
                        {txn.paymentMethod === 'Kredi Kartı' && <CreditCard className="w-3 h-3 text-slate-400" />}
                        {txn.paymentMethod === 'Nakit' && <Banknote className="w-3 h-3 text-slate-400" />}
                        {txn.paymentMethod === 'Havale/EFT' && <Building className="w-3 h-3 text-slate-400" />}
                        {txn.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-400">
                      {txn.receiptNumber}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-sm whitespace-nowrap">
                      <span className={isIncome ? 'text-emerald-700' : 'text-rose-600'}>
                        {isIncome ? '+' : '-'}{txn.amount.toLocaleString('tr-TR')} ₺
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onDeleteTransaction(txn.id)}
                        className="p-1 text-slate-300 hover:text-rose-600 rounded transition-colors opacity-0 group-hover:opacity-100"
                        title="İşlemi Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Yeni Finansal İşlem Ekle</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              {/* Type Switcher */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">İşlem Türü</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTxnType('income');
                      setCategory('Paket Satışı (10 Seans)');
                    }}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                      txnType === 'income'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    + Gelir (Seans / Paket Tahsilatı)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTxnType('expense');
                      setCategory('Tıbbi Sarf Malzeme (Bant, İğne, Örtü)');
                    }}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                      txnType === 'expense'
                        ? 'border-rose-600 bg-rose-50 text-rose-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    - Gider (Kira, Sarf Malzeme, Fatura)
                  </button>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FinancialTransaction['category'])}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-teal-600"
                >
                  {txnType === 'income' ? (
                    <>
                      <option value="Paket Satışı (10 Seans)">Paket Satışı (10 Seans)</option>
                      <option value="Paket Satışı (8 Seans)">Paket Satışı (8 Seans)</option>
                      <option value="Paket Satışı (6 Seans)">Paket Satışı (6 Seans)</option>
                      <option value="Seans Ücreti">Tek Seans Ücreti</option>
                      <option value="Değerlendirme & Konsültasyon">İlk Değerlendirme & Konsültasyon</option>
                    </>
                  ) : (
                    <>
                      <option value="Kira (Hantaş Prestij)">Kira (Hantaş Prestij Limonluk)</option>
                      <option value="Tıbbi Sarf Malzeme (Bant, İğne, Örtü)">Tıbbi Sarf Malzeme (Bant, İğne, Sedye Örtüsü)</option>
                      <option value="Elektrik, Su & Aidat">Elektrik, Su & İş Merkezi Aidatı</option>
                      <option value="Personel & Asistan">Personel & Klinik Asistanı</option>
                      <option value="Cihaz Bakım & Donanım">Cihaz Bakım & Tedavi Masası Donanımı</option>
                      <option value="Pazarlama & Sosyal Medya">Instagram & Klinik Tanıtımı</option>
                    </>
                  )}
                </select>
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Tutar (TL)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Örn: 15000"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-teal-600 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">İşlem Tarihi</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-teal-600"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Ödeme Yöntemi</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-teal-600"
                >
                  <option value="Nakit">Nakit (Elden)</option>
                  <option value="Kredi Kartı">Kredi Kartı (POS)</option>
                  <option value="Havale/EFT">Banka Havale / EFT</option>
                </select>
              </div>

              {/* Patient Name if Income */}
              {txnType === 'income' && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Hasta Adı (Opsiyonel)</label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Örn: Ahmet Karadeniz"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-teal-600"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Açıklama / Not</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="İşlem ile ilgili detay..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-teal-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs"
                >
                  İşlemi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
