import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 text-center shadow-2xl backdrop-blur-md">
        <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 text-primary-fixed flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-[36px]">travel_explore</span>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">404 - Không Tìm Thấy Trang</h1>
        <p className="text-sm text-white/70 mb-6 leading-relaxed">
          Đường dẫn bạn yêu cầu không tồn tại hoặc đã được chuyển dời.
        </p>

        <div className="flex justify-center gap-3">
          <Link
            href="/pos/terminal"
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md transition-all inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">point_of_sale</span>
            Về quầy POS
          </Link>
          <Link
            href="/admin/inventory"
            className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all inline-flex items-center gap-2 border border-white/10"
          >
            <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            Trang Quản Trị
          </Link>
        </div>
      </div>
    </div>
  );
}
