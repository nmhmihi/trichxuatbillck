import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Copy,
  Check,
  RefreshCw,
  X,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { ExtractedBillData } from './types';

export default function App() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resultText, setResultText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Global paste handler (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (isLoading) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            handleFile(file);
          }
          break;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isLoading]);

  // Tối ưu hóa kích thước ảnh phía client để tải lên siêu nhanh và OCR tức thì
  const optimizeImageForOCR = (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1280;
        let { width, height } = img;
        if (width <= maxDim && height <= maxDim) {
          resolve(dataUrl);
          return;
        }
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.88));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Vui lòng chọn tệp hình ảnh (PNG, JPG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const rawUrl = e.target?.result as string;
      const optimizedUrl = await optimizeImageForOCR(rawUrl);
      setImagePreview(optimizedUrl);
      setFileName(file.name);
      setResultText('');
      setErrorMessage(null);
      setIsCopied(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isLoading) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    setImagePreview(null);
    setFileName(null);
    setResultText('');
    setErrorMessage(null);
    setIsCopied(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExtract = async () => {
    if (!imagePreview) {
      setErrorMessage('Vui lòng chọn ảnh bill chuyển khoản trước.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setIsCopied(false);

    try {
      let mimeType = 'image/jpeg';
      if (imagePreview.startsWith('data:image/png')) mimeType = 'image/png';
      else if (imagePreview.startsWith('data:image/webp')) mimeType = 'image/webp';
      else if (imagePreview.startsWith('data:image/svg+xml')) mimeType = 'image/svg+xml';

      const res = await window.fetch('/api/extract-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePreview,
          mimeType,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        let msg = json.error || 'Có lỗi xảy ra khi xử lý ảnh.';
        if (typeof msg === 'object') {
          msg = msg.message || JSON.stringify(msg);
        }
        throw new Error(msg);
      }

      const data: ExtractedBillData = json.data;

      // 3 thông tin chính:
      // Dòng 1: Tên người nhận
      // Dòng 2: Số tài khoản nhận
      // Dòng 3: Ngân hàng nhận
      const lines = [
        data.recipientName?.trim() || '',
        data.recipientAccountNumber?.trim() || '',
        data.recipientBank?.trim() || '',
      ].filter(Boolean);

      const formatted = lines.join('\n');
      setResultText(formatted);
    } catch (err: any) {
      let msg = err?.message || 'Không thể trích xuất ảnh. Vui lòng thử lại.';
      if (msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE')) {
        msg = 'Hệ thống AI đang tạm thời có lượng yêu cầu cao (503). Vui lòng nhấn Thử lại ngay.';
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!resultText) return;
    navigator.clipboard.writeText(resultText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#14231a] text-[#e8f5ee] flex flex-col items-center justify-start p-4 sm:p-8 font-sans antialiased selection:bg-[#3d7754] selection:text-white">
      <div className="w-full max-w-lg my-auto space-y-5 py-4">
        {/* Header - Tiêu đề đơn giản không dòng phụ */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#e8f5ee]">
            Trích Xuất Bill Ngân Hàng
          </h1>
        </div>

        {/* Khung tải ảnh màu xanh đậm matcha */}
        <div className="bg-[#1b3124] rounded-2xl border border-[#2c4e3a] shadow-lg p-5 space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
            }}
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
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-[#5fa379] bg-[#223d2e]'
                  : 'border-[#375e46] hover:border-[#528a67] bg-[#16291e]/60 hover:bg-[#192e22]'
              }`}
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-[#244231] border border-[#375e46] flex items-center justify-center text-[#86bf9a] mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-[#d4ebe0]">
                Bấm để chọn ảnh bill hoặc kéo thả vào đây
              </p>
              <p className="text-xs text-[#7ea88f] mt-1">
                Hỗ trợ JPG, PNG, WEBP hoặc dán ảnh trực tiếp (Ctrl + V)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl border border-[#2f533e] bg-[#16291e]">
                <div className="flex items-center gap-3 overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-14 h-14 object-contain rounded-lg bg-black/20 border border-[#355d46] shrink-0 p-0.5"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#e3f2ea] truncate" title={fileName || ''}>
                      {fileName || 'Ảnh biên lai'}
                    </p>
                    <p className="text-xs text-[#6ec28d] font-medium">Đã sẵn sàng trích xuất</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-[#386249] bg-[#223b2c] text-[#d4ebe0] hover:bg-[#2a4837] transition-colors cursor-pointer"
                  >
                    Đổi ảnh
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1.5 rounded-lg text-[#84a893] hover:text-[#f87171] hover:bg-[#342020] transition-colors cursor-pointer"
                    title="Xóa"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Nút Trích Xuất */}
              <button
                type="button"
                onClick={handleExtract}
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                  isLoading
                    ? 'bg-[#294c37] cursor-not-allowed text-[#8cb59a]'
                    : 'bg-[#2f6343] hover:bg-[#397852] active:scale-[0.99]'
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Đang trích xuất...
                  </>
                ) : (
                  <>
                    <span>Trích Xuất Thông Tin</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Thông báo lỗi */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-[#321d1d] border border-[#5a2e2e] text-[#fca5a5] text-xs flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 min-w-0">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="break-words">{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={handleExtract}
                disabled={isLoading || !imagePreview}
                className="shrink-0 px-2.5 py-1 text-xs font-semibold bg-[#492727] hover:bg-[#5b3232] text-[#fecaca] rounded-md transition-colors cursor-pointer"
              >
                Thử lại
              </button>
            </div>
          )}
        </div>

        {/* 1 Ô DUY NHẤT CHỨA 3 DÒNG THÔNG TIN + NÚT SAO CHÉP DƯỚI CÙNG */}
        {resultText && (
          <div className="bg-[#1b3124] rounded-2xl border border-[#2c4e3a] shadow-lg p-5 space-y-4 animate-fade-in">
            {/* Ô duy nhất hiển thị 3 dòng */}
            <div className="relative">
              <textarea
                value={resultText}
                onChange={(e) => setResultText(e.target.value)}
                rows={3}
                className="w-full p-4 rounded-xl border border-[#335942] bg-[#132219] text-[#e8f5ee] text-base font-medium leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[#5fa379] transition-all font-mono"
                placeholder={`LE THI NGOC TRAM\n0326537738\nNHTMCP Quân Đội (MB)`}
              />
            </div>

            {/* Nút Sao chép ở dưới cùng */}
            <button
              type="button"
              onClick={handleCopy}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                isCopied
                  ? 'bg-[#235839] text-[#b8f0d0] border border-[#3e855b]'
                  : 'bg-[#316947] hover:bg-[#3b7d55] text-white active:scale-[0.99]'
              }`}
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Đã sao chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Sao chép</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
