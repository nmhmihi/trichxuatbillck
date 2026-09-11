import React from 'react';
import { History, Trash2, ArrowUpRight, Copy, Check } from 'lucide-react';
import { ExtractionHistoryItem } from '../types';

interface HistoryListProps {
  history: ExtractionHistoryItem[];
  onSelect: (item: ExtractionHistoryItem) => void;
  onClear: () => void;
  onRemoveItem: (id: string) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  onSelect,
  onClear,
  onRemoveItem,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  if (history.length === 0) {
    return null;
  }

  const handleQuickCopy = (e: React.MouseEvent, item: ExtractionHistoryItem) => {
    e.stopPropagation();
    const text = `${item.data.recipientName} - ${item.data.recipientAccountNumber} - ${item.data.recipientBank}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-slate-600" />
          <h3 className="text-base font-bold text-slate-900">
            Lịch sử trích xuất gần đây ({history.length})
          </h3>
        </div>

        <button
          type="button"
          onClick={onClear}
          className="text-xs font-medium text-slate-400 hover:text-red-600 flex items-center gap-1 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Xóa lịch sử
        </button>
      </div>

      <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
        {history.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect(item)}
            className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-emerald-50/40 hover:border-emerald-200 flex items-center justify-between gap-3 cursor-pointer transition-all group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                <img
                  src={item.imagePreview}
                  alt={item.fileName}
                  className="w-full h-full object-contain p-0.5"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {item.data.recipientName || 'Chưa rõ tên'}
                  </span>
                  {item.data.amount && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded">
                      {item.data.amount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">
                  {item.data.recipientAccountNumber} • {item.data.recipientBank}
                </p>
                <span className="text-[10px] text-slate-400">
                  {new Date(item.timestamp).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  - {new Date(item.timestamp).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={(e) => handleQuickCopy(e, item)}
                title="Sao chép nhanh 3 thông tin"
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors"
              >
                {copiedId === item.id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveItem(item.id);
                }}
                title="Xóa mục này"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div className="p-1.5 text-slate-400 group-hover:text-emerald-600 transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
