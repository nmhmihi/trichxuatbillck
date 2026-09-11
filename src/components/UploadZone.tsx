import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileImage,
  Sparkles,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertCircle,
  ClipboardPaste,
} from 'lucide-react';
import { SAMPLE_BILLS } from '../data/sampleBills';
import { SampleBill } from '../types';

interface UploadZoneProps {
  imagePreview: string | null;
  fileName: string | null;
  fileSize: string | null;
  onImageSelected: (base64: string, name: string, size?: string) => void;
  onClear: () => void;
  onExtract: () => void;
  isLoading: boolean;
  onViewImage: () => void;
  errorMessage: string | null;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  imagePreview,
  fileName,
  fileSize,
  onImageSelected,
  onClear,
  onExtract,
  isLoading,
  onViewImage,
  errorMessage,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [pasteNotice, setPasteNotice] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Global paste handler to allow pasting screenshots directly
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (isLoading) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
            setPasteNotice(true);
            setTimeout(() => setPasteNotice(false), 3000);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isLoading]);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn một tệp hình ảnh (PNG, JPG, JPEG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const sizeStr = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
      onImageSelected(result, file.name, sizeStr);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isLoading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleSelectSample = (sample: SampleBill) => {
    if (isLoading) return;
    onImageSelected(sample.svgDataUrl, `${sample.title}.svg`, 'Mẫu thử nghiệm');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileImage className="w-5 h-5 text-emerald-600" />
            Tải lên ảnh Bill chuyển khoản
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Hỗ trợ kéo thả, chọn tệp từ thiết bị hoặc dán ảnh chụp màn hình (Ctrl+V)
          </p>
        </div>

        {pasteNotice && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 animate-fade-in">
            <ClipboardPaste className="w-3.5 h-3.5" />
            Đã nhận ảnh dán!
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {!imagePreview ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
            isDragOver
              ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
              : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50/70 bg-slate-50/40'
          }`}
        >
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-emerald-600 mb-3 group-hover:scale-105 transition-transform">
            <UploadCloud className="w-7 h-7" />
          </div>

          <p className="text-sm font-semibold text-slate-800">
            Kéo và thả ảnh bill ngân hàng vào đây
          </p>
          <p className="text-xs text-slate-500 mt-1">hoặc nhấp để chọn tệp từ máy tính / điện thoại</p>
          <p className="text-[11px] text-slate-400 mt-3">
            Hỗ trợ JPG, PNG, WEBP, HEIC • Tối đa 30MB
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-xl border border-slate-200 bg-slate-50 p-3 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-36 h-40 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0 group">
              <img
                src={imagePreview}
                alt="Xem trước bill"
                className="w-full h-full object-contain p-1"
              />
              <button
                type="button"
                onClick={onViewImage}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity gap-1 text-xs font-medium"
              >
                <Eye className="w-4 h-4" />
                Xem phóng to
              </button>
            </div>

            <div className="flex-1 w-full text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-emerald-600 text-xs font-semibold mb-1">
                <CheckCircle2 className="w-4 h-4" />
                Ảnh đã sẵn sàng trích xuất
              </div>
              <p className="text-sm font-bold text-slate-800 truncate max-w-sm" title={fileName || ''}>
                {fileName || 'Ảnh biên lai chuyển khoản'}
              </p>
              {fileSize && <p className="text-xs text-slate-500 mt-0.5">Dung lượng: {fileSize}</p>}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                <button
                  type="button"
                  onClick={onViewImage}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Xem ảnh gốc
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Đổi ảnh khác
                </button>
                <button
                  type="button"
                  onClick={onClear}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50/50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>

          {/* Primary Extract Button */}
          <button
            type="button"
            onClick={onExtract}
            disabled={isLoading}
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide text-white flex items-center justify-center gap-2 shadow-sm transition-all ${
              isLoading
                ? 'bg-emerald-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] shadow-emerald-600/25 cursor-pointer'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                AI đang đọc và trích xuất thông tin bill...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Nhấn Trích Xuất Thông Tin Bill
              </>
            )}
          </button>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">Không thể trích xuất:</span>
            {errorMessage}
          </div>
        </div>
      )}

      {/* Quick Sample Bills for Instant Testing */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-slate-700">
            Chưa có sẵn ảnh? Thử ngay mẫu biên lai thực tế:
          </span>
          <span className="text-[11px] text-slate-400">1-click test</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {SAMPLE_BILLS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleSelectSample(sample)}
              disabled={isLoading}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-emerald-50/60 hover:border-emerald-300 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-800">
                  {sample.bankName}
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                  {sample.amount}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1 truncate">
                Nhận: <span className="font-medium text-slate-700">{sample.recipient}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
