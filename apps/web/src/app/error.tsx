'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error securely in client without dumping sensitive stack traces to UI
    console.error('OmniPOS Application Error:', error?.message);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white/5 border border-white/10 rounded-2xl p-8 text-center shadow-2xl backdrop-blur-md">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-[36px]">error</span>
        </div>

        <h1 className="text-xl font-bold text-white mb-2">Đã xảy ra sự cố kỹ thuật</h1>
        <p className="text-sm text-white/70 mb-6 leading-relaxed">
          Hệ thống gặp lỗi trong quá trình xử lý yêu cầu. Để bảo vệ dữ liệu công nợ và thẻ kho, phiên thao tác đã được tạm dừng an toàn.
        </p>

        {error.digest && (
          <div className="mb-6 p-2.5 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-white/50">
            Mã tham chiếu lỗi (Digest ID): {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Thử lại tác vụ
          </button>
          <Link
            href="/pos/terminal"
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 border border-white/10"
          >
            <span className="material-symbols-outlined text-[18px]">point_of_sale</span>
            Về quầy POS
          </Link>
        </div>
      </div>
    </div>
  );
}
