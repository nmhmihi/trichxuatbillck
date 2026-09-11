import React from 'react';
import { ReceiptText, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
            <ReceiptText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Trích Xuất Bill Ngân Hàng
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Sparkles className="w-3 h-3" />
                AI Gemini
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden md:block">
              Tự động nhận diện Người nhận • Số tài khoản • Ngân hàng từ ảnh bill chuyển khoản
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">Hỗ trợ ngân hàng</span>
            <span className="text-xs font-semibold text-slate-700">VCB, TCB, MB, ACB, BIDV, VPB...</span>
          </div>
        </div>
      </div>
    </header>
  );
};
