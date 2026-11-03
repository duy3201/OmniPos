'use client';

import React from 'react';
import Link from 'next/link';
import { Icon, Button, BentoCard, Badge } from '@/components/ui';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col text-on-surface">
      {/* Top Navbar */}
      <header className="h-16 w-full border-b border-outline-variant/30 bg-surface-container-lowest/80 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl shadow-sm">
            <Icon name="point_of_sale" className="text-[24px]" />
          </div>
          <div>
            <span className="font-headline-md text-headline-sm font-black text-on-surface">
              OmniPOS
            </span>
            <span className="ml-2 px-2 py-0.5 rounded bg-primary-fixed text-primary text-[11px] font-bold">
              Thủy Sản
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/auth/pin-login">
            <Button variant="secondary" icon="dialpad">
              Đăng Nhập PIN Mở Ca
            </Button>
          </Link>
          <Link href="/pos/terminal">
            <Button variant="primary" icon="point_of_sale">
              Vào Quầy Bán Hàng POS [F1-F9]
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-6 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed/40 text-primary text-label-sm font-bold border border-primary/20">
          <Icon name="verified" className="text-[16px]" />
          <span>Giải pháp POS chuyên sâu chuỗi cửa hàng &amp; đại lý vật tư nuôi tôm cá</span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl font-black text-on-surface tracking-tight leading-tight">
          Bán hàng thần tốc tại quầy.{' '}
          <span className="text-primary block sm:inline">Kiểm soát tồn kho tuyệt đối.</span>
        </h1>

        <p className="text-body-lg text-outline max-w-2xl mx-auto">
          Giải quyết triệt để bài toán công nợ vụ nuôi 3-6 tháng, quản lý số Lô &amp; Hạn dùng thuốc theo chuẩn FEFO, đo đạc chỉ số nước ao kê đơn và in hóa đơn nhiệt K80 siêu tốc.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link href="/pos/terminal">
            <Button variant="primary" size="xl" icon="point_of_sale">
              Mở Trạm POS Siêu Tốc Ngay
            </Button>
          </Link>
          <Link href="/admin/inventory">
            <Button variant="secondary" size="xl" icon="dashboard">
              Xem Quản Trị Kho Bất Biến
            </Button>
          </Link>
        </div>
      </section>

      {/* Bento Feature Grid */}
      <section className="py-8 px-6 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BentoCard
            title="Bán hàng siêu tốc, không sợ rớt mạng"
            subtitle="Hoạt động offline-first 100%"
          >
            <div className="p-3 bg-surface-container-low rounded-xl text-body-sm text-outline space-y-2">
              <p>• Phím tắt bàn phím F1-F9 cho thao tác không cần chuột.</p>
              <p>• Quét barcode siêu tốc nhận diện tức thì thuốc, thức ăn.</p>
              <p>• Tự động đồng bộ ngầm khi kết nối Internet trở lại.</p>
            </div>
          </BentoCard>

          <BentoCard
            title="Quản lý Lô &amp; Hạn Dùng (FEFO)"
            subtitle="Chống bán thuốc cận hạn cho ao nuôi"
          >
            <div className="p-3 bg-surface-container-low rounded-xl text-body-sm text-outline space-y-2">
              <p>• Quản lý ngày sản xuất &amp; date của từng lô thuốc vi sinh.</p>
              <p>• Đèn cảnh báo đỏ (&lt;30 ngày), vàng (30-90 ngày), xanh.</p>
              <p>• Tự động ưu tiên xuất bán lô cận date trước.</p>
            </div>
          </BentoCard>

          <BentoCard
            title="Sổ công nợ vụ nuôi (Crop Credit)"
            subtitle="Đặc thù sống còn của đại lý thủy sản"
          >
            <div className="p-3 bg-surface-container-low rounded-xl text-body-sm text-outline space-y-2">
              <p>• Quản lý nợ gối đầu chi tiết theo từng Ao nuôi / Mùa vụ.</p>
              <p>• Kiểm soát hạn mức tín dụng tối đa cho từng chủ đầm.</p>
              <p>• Gạch nợ từng đợt khi nông dân xuất bán tôm cho lái.</p>
            </div>
          </BentoCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-outline-variant/30 py-6 px-6 text-center text-body-sm text-outline bg-surface-container-lowest">
        <p>© 2026 OmniPOS • Giải Pháp Quản Lý Bán Hàng &amp; Kho Cửa Hàng Vật Tư Thủy Sản</p>
      </footer>
    </div>
  );
}
