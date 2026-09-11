import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  constructor(props: Props) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Lỗi giao diện (ErrorBoundary caught):', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#14231a] text-[#e8f5ee] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#1b3124] border border-[#375e46] rounded-2xl p-6 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#3d2020] border border-[#6b3131] flex items-center justify-center mx-auto text-[#f87171]">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-[#e8f5ee]">
              Đã xảy ra sự cố hiển thị
            </h2>
            <p className="text-sm text-[#a3c9b3] leading-relaxed">
              Trình duyệt gặp gián đoạn tạm thời khi kết xuất giao diện. Bạn hãy nhấn nút tải lại bên dưới để tiếp tục.
            </p>
            {this.state.error && (
              <pre className="text-xs bg-[#111c15] p-3 rounded-lg text-[#f87171] overflow-x-auto text-left max-h-24">
                {this.state.error.message}
              </pre>
            )}
            <button
              type="button"
              onClick={this.handleReload}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-[#316947] hover:bg-[#3b7d55] text-white flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Tải lại trang</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
