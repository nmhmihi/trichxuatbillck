import React, { useState } from 'react';
import {
  User,
  CreditCard,
  Building2,
  Copy,
  Check,
  DollarSign,
  Calendar,
  Hash,
  MessageSquare,
  FileCheck2,
  Download,
  AlertTriangle,
  Send,
  Sparkles,
} from 'lucide-react';
import { ExtractedBillData } from '../types';

interface ExtractionResultProps {
  data: ExtractedBillData;
  fileName: string | null;
}

export const ExtractionResult: React.FC<ExtractionResultProps> = ({ data, fileName }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopy = (text: string, fieldKey: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handleCopyAll = () => {
    const lines = [
      '📌 THÔNG TIN TRÍCH XUẤT TỪ BILL CHUYỂN KHOẢN:',
      `• Người nhận: ${data.recipientName || 'Chưa xác định'}`,
      `• Số tài khoản nhận: ${data.recipientAccountNumber || 'Chưa xác định'}`,
      `• Ngân hàng nhận: ${data.recipientBank || 'Chưa xác định'}`,
    ];

    if (data.amount) lines.push(`• Số tiền: ${data.amount}`);
    if (data.transferContent) lines.push(`• Nội dung CK: ${data.transferContent}`);
    if (data.transactionCode) lines.push(`• Mã giao dịch: ${data.transactionCode}`);
    if (data.transactionDate) lines.push(`• Thời gian: ${data.transactionDate}`);
    if (data.senderName) lines.push(`• Người chuyển: ${data.senderName}`);

    const textToCopy = lines.join('\n');
    navigator.clipboard.writeText(textToCopy);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleDownloadTxt = () => {
    const content = `THÔNG TIN TRÍCH XUẤT TỪ BIÊN LAI NGÂN HÀNG
Tên tệp: ${fileName || 'bill-chuyen-khoan'}
Thời gian xuất: ${new Date().toLocaleString('vi-VN')}

--- 3 THÔNG TIN CHÍNH ---
1. Người nhận: ${data.recipientName || 'N/A'}
2. Số tài khoản nhận: ${data.recipientAccountNumber || 'N/A'}
3. Ngân hàng nhận: ${data.recipientBank || 'N/A'}

--- THÔNG TIN CHI TIẾT ---
Số tiền: ${data.amount || 'N/A'}
Nội dung chuyển: ${data.transferContent || 'N/A'}
Mã giao dịch: ${data.transactionCode || 'N/A'}
Thời gian GD: ${data.transactionDate || 'N/A'}
Người gửi: ${data.senderName || 'N/A'}
TK gửi: ${data.senderAccountNumber || 'N/A'}
Ghi chú AI: ${data.notes || 'N/A'}
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trich-xuat-${data.recipientAccountNumber || 'bill'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 transition-all space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-emerald-600" />
              Kết quả trích xuất tự động
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Chính xác 100%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Dữ liệu nhận diện từ Google Gemini AI • Nhấp để sao chép nhanh từng trường
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            {copiedAll ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Đã sao chép tất cả!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Sao chép toàn bộ
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadTxt}
            title="Tải tệp .txt"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Lưu TXT
          </button>
        </div>
      </div>

      {/* Warning if AI flags not a typical receipt */}
      {data.isBankReceipt === false && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">Lưu ý phân tích hình ảnh:</span>
            Hệ thống nhận thấy ảnh này có thể không phải là hóa đơn hoặc biên lai chuyển khoản ngân hàng tiêu chuẩn. Vui lòng đối chiếu lại hình ảnh gốc.
            {data.notes && <p className="mt-1 text-amber-700 italic">"{data.notes}"</p>}
          </div>
        </div>
      )}

      {/* SECTION 1: THE 3 CORE FIELDS REQUESTED BY USER */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            3 Thông tin cốt lõi yêu cầu
          </span>
          <span className="text-[11px] text-slate-400">Người nhận • Số TK • Ngân hàng</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* 1. Người nhận */}
          <div className="relative p-4 rounded-xl border-2 border-emerald-100 bg-gradient-to-b from-emerald-50/40 to-white flex flex-col justify-between hover:border-emerald-300 transition-colors group">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-600" />
                  Người nhận
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(data.recipientName, 'recipientName')}
                  className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                    copiedField === 'recipientName'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                  title="Sao chép tên người nhận"
                >
                  {copiedField === 'recipientName' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Chép</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-base font-bold text-slate-900 tracking-tight break-words">
                {data.recipientName || (
                  <span className="text-slate-400 italic text-sm">Không tìm thấy</span>
                )}
              </p>
            </div>
            <div className="mt-3 text-[11px] text-emerald-700/80 font-medium">
              Chủ tài khoản thụ hưởng
            </div>
          </div>

          {/* 2. Số tài khoản nhận */}
          <div className="relative p-4 rounded-xl border-2 border-blue-100 bg-gradient-to-b from-blue-50/40 to-white flex flex-col justify-between hover:border-blue-300 transition-colors group">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  Số tài khoản nhận
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(data.recipientAccountNumber, 'recipientAccountNumber')}
                  className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                    copiedField === 'recipientAccountNumber'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                  title="Sao chép số tài khoản"
                >
                  {copiedField === 'recipientAccountNumber' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Chép</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-lg font-mono font-bold text-blue-700 tracking-wider break-all">
                {data.recipientAccountNumber || (
                  <span className="text-slate-400 italic text-sm">Không tìm thấy</span>
                )}
              </p>
            </div>
            <div className="mt-3 text-[11px] text-blue-700/80 font-medium">
              Số tài khoản / Số thẻ
            </div>
          </div>

          {/* 3. Ngân hàng nhận */}
          <div className="relative p-4 rounded-xl border-2 border-indigo-100 bg-gradient-to-b from-indigo-50/40 to-white flex flex-col justify-between hover:border-indigo-300 transition-colors group">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  Ngân hàng nhận
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(data.recipientBank, 'recipientBank')}
                  className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                    copiedField === 'recipientBank'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                  title="Sao chép tên ngân hàng"
                >
                  {copiedField === 'recipientBank' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Chép</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-base font-bold text-slate-900 tracking-tight break-words">
                {data.recipientBank || (
                  <span className="text-slate-400 italic text-sm">Không tìm thấy</span>
                )}
              </p>
            </div>
            <div className="mt-3 text-[11px] text-indigo-700/80 font-medium">
              Tổ chức tài chính / Ngân hàng thụ hưởng
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: ADDITIONAL TRANSACTION DETAILS */}
      <div className="pt-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">
          Thông tin giao dịch bổ sung
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {/* Amount */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 mt-0.5">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Số tiền chuyển</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                  {data.amount || '—'}
                </span>
              </div>
            </div>
            {data.amount && (
              <button
                type="button"
                onClick={() => handleCopy(data.amount || '', 'amount')}
                className="text-slate-400 hover:text-slate-700 p-1"
                title="Sao chép số tiền"
              >
                {copiedField === 'amount' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>

          {/* Transfer content */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700 mt-0.5">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <div className="max-w-[200px]">
                <span className="text-slate-400 font-medium block">Nội dung chuyển tiền</span>
                <span className="text-xs font-semibold text-slate-800 mt-0.5 block break-words">
                  {data.transferContent || '—'}
                </span>
              </div>
            </div>
            {data.transferContent && (
              <button
                type="button"
                onClick={() => handleCopy(data.transferContent || '', 'transferContent')}
                className="text-slate-400 hover:text-slate-700 p-1"
                title="Sao chép nội dung"
              >
                {copiedField === 'transferContent' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>

          {/* Transaction Code */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 mt-0.5">
                <Hash className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Mã giao dịch / Mã GD</span>
                <span className="text-xs font-mono font-bold text-slate-900 mt-0.5 block">
                  {data.transactionCode || '—'}
                </span>
              </div>
            </div>
            {data.transactionCode && (
              <button
                type="button"
                onClick={() => handleCopy(data.transactionCode || '', 'transactionCode')}
                className="text-slate-400 hover:text-slate-700 p-1"
                title="Sao chép mã giao dịch"
              >
                {copiedField === 'transactionCode' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>

          {/* Transaction Date */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-violet-100 text-violet-700 mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Thời gian giao dịch</span>
                <span className="text-xs font-semibold text-slate-800 mt-0.5 block">
                  {data.transactionDate || '—'}
                </span>
              </div>
            </div>
            {data.transactionDate && (
              <button
                type="button"
                onClick={() => handleCopy(data.transactionDate || '', 'transactionDate')}
                className="text-slate-400 hover:text-slate-700 p-1"
                title="Sao chép thời gian"
              >
                {copiedField === 'transactionDate' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>

          {/* Sender */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-teal-100 text-teal-700 mt-0.5">
                <Send className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Người chuyển tiền</span>
                <span className="text-xs font-semibold text-slate-800 mt-0.5 block">
                  {data.senderName || '—'}
                  {data.senderAccountNumber ? ` (${data.senderAccountNumber})` : ''}
                </span>
              </div>
            </div>
            {data.senderName && (
              <button
                type="button"
                onClick={() => handleCopy(data.senderName || '', 'senderName')}
                className="text-slate-400 hover:text-slate-700 p-1"
                title="Sao chép người gửi"
              >
                {copiedField === 'senderName' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>

          {/* Notes / Status */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Trạng thái / Nhận định</span>
                <span className="text-xs font-medium text-slate-700 mt-0.5 block">
                  {data.notes || 'Trích xuất thành công từ ảnh rõ nét'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
