'use client';

import React, { useState, useEffect } from 'react';
import { Icon, Badge, Button, BentoCard, Modal, useToast } from '@/components/ui';

interface CustomerItem {
  id: string;
  name: string;
  phone: string;
  address: string;
  tier: 'Đồng' | 'Bạc' | 'Vàng' | 'Kim Cương';
  points: number;
  totalSpent: number;
  creditLimit: number;
  currentDebt: number;
  ponds: { id?: string; name: string; area?: string; volume?: string; areaM2?: number; waterVolumeM3?: number; crop?: string; targetSpecies?: string; status?: string }[];
}

export default function CustomersPage() {
  const toast = useToast();
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Customer Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCreditLimit, setNewCreditLimit] = useState('100000000');
  const [newPondName, setNewPondName] = useState('Ao Số 1 (Lót bạt oxy đáy)');
  const [newPondArea, setNewPondArea] = useState('2500');

  const formatVND = (val: number) => `${(val || 0).toLocaleString('vi-VN')}₫`;

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/customers');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped: CustomerItem[] = data.map((c: any) => ({
            id: c.id,
            name: c.nickname ? `${c.name} (${c.nickname})` : c.name,
            phone: c.phone,
            address: c.address || c.province || 'Đồng bằng Sông Cửu Long',
            tier: c.tier === 'GOLD' ? 'Vàng' : c.tier === 'SILVER' ? 'Bạc' : c.tier === 'DIAMOND' ? 'Kim Cương' : 'Đồng',
            points: c.rewardPoints || 0,
            totalSpent: Number(c.creditLimit) * 1.5,
            creditLimit: Number(c.creditLimit) || 50000000,
            currentDebt: Number(c.currentDebt) || 0,
            ponds: (c.ponds || []).map((p: any) => ({
              id: p.id,
              name: p.name,
              area: p.areaM2 ? `${Number(p.areaM2).toLocaleString('vi-VN')} m²` : '2.500 m²',
              volume: p.waterVolumeM3 ? `${Number(p.waterVolumeM3).toLocaleString('vi-VN')} m³` : '3.000 m³',
              crop: p.targetSpecies ? `${p.targetSpecies} (${p.status || 'Đang nuôi'})` : 'Tôm thẻ chân trắng 45 ngày',
            })),
          }));
          setCustomers(mapped);
          if (mapped.length > 0) {
            setSelectedCustomer(mapped[0]);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      searchQuery === '' ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      toast.error('Thiếu thông tin', 'Vui lòng nhập tên và số điện thoại chủ đầm.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          phone: newPhone.trim(),
          address: newAddress.trim() || 'Khu vực nuôi tôm công nghệ cao',
          province: 'Bạc Liêu',
          creditLimit: Number(newCreditLimit) || 50000000,
          currentDebt: 0,
          ponds: [
            {
              name: newPondName.trim() || 'Ao Nuôi Chính 01',
              pondType: 'Ao bạt đáy',
              areaM2: Number(newPondArea) || 2500,
              waterVolumeM3: (Number(newPondArea) || 2500) * 1.2,
              targetSpecies: 'Tôm thẻ chân trắng',
              status: 'Đang nuôi',
            },
          ],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Không thể tạo khách hàng');
      }

      toast.success('Thành công!', `Đã thêm khách hàng "${newName}" vào cơ sở dữ liệu PostgreSQL.`);
      setShowAddModal(false);
      setNewName('');
      setNewPhone('');
      setNewAddress('');
      fetchCustomers();
    } catch (err: any) {
      toast.error('Lỗi lưu khách hàng', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-sm text-headline-lg font-bold text-on-surface">
            Quản Lý Khách Hàng CRM &amp; Hồ Sơ Ao Nuôi
          </h1>
          <p className="text-body-sm text-outline">
            Dữ liệu kết nối trực tiếp PostgreSQL Neon Cloud • Hồ sơ chủ đầm &amp; Ao nuôi thủy sản
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" icon="refresh" onClick={fetchCustomers} disabled={isLoading}>
            Làm mới
          </Button>
          <Button variant="primary" icon="person_add" onClick={() => setShowAddModal(true)}>
            + Thêm khách hàng mới
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Customer List (6 Cols) */}
        <div className="lg:col-span-6 bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col">
          <div className="p-3 border-b border-outline-variant/20 bg-surface-container-low/40">
            <div className="relative">
              <Icon name="search" className="absolute left-3 top-2.5 text-outline text-[18px]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên chủ đầm, SĐT, vùng nuôi..."
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-container-lowest text-body-sm border border-outline-variant/30 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="divide-y divide-outline-variant/15 overflow-y-auto max-h-[600px]">
            {isLoading ? (
              <div className="p-8 text-center text-outline">
                <Icon name="sync" className="animate-spin text-[24px] inline-block mb-2" />
                <p>Đang tải danh sách khách hàng từ Database...</p>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-outline">
                <p className="font-semibold text-on-surface">Không tìm thấy khách hàng nào</p>
                <p className="text-body-sm text-outline mt-1">Hãy nhấn "+ Thêm khách hàng mới" để tạo hồ sơ đầu tiên.</p>
              </div>
            ) : (
              filteredCustomers.map((c) => {
                const isSelected = selectedCustomer?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
                    className={`p-3.5 cursor-pointer transition-colors flex items-center justify-between ${
                      isSelected ? 'bg-primary-fixed/30' : 'hover:bg-surface-container-low/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-label-md text-on-surface">
                          {c.name}
                        </h4>
                        <p className="text-[11px] text-outline font-mono">
                          {c.phone} • {c.address}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <Badge variant={c.tier === 'Kim Cương' ? 'primary' : c.tier === 'Vàng' ? 'warning' : 'neutral'}>
                        Thẻ {c.tier}
                      </Badge>
                      <p className="font-tabular-stat text-[11px] font-bold text-primary mt-1">
                        {c.points} điểm
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Customer Details & Ponds (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          {selectedCustomer ? (
            <>
              {/* Profile Card */}
              <BentoCard>
                <div className="flex items-start justify-between pb-3 border-b border-outline-variant/20">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xl shadow-sm">
                      <Icon name="person" className="text-[28px]" />
                    </div>
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface">
                        {selectedCustomer.name}
                      </h3>
                      <p className="text-[12px] text-outline font-mono">
                        {selectedCustomer.phone} • {selectedCustomer.address}
                      </p>
                    </div>
                  </div>

                  <Badge variant="warning" size="md">Thẻ {selectedCustomer.tier}</Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-3 text-center text-body-sm">
                  <div className="p-2 rounded-lg bg-surface-container-low">
                    <span className="text-[10px] text-outline block">Số lượng ao nuôi:</span>
                    <span className="font-tabular-stat font-bold text-on-surface text-[13px]">
                      {selectedCustomer.ponds.length} ao
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-container-low">
                    <span className="text-[10px] text-outline block">Hạn mức nợ vụ:</span>
                    <span className="font-tabular-stat font-bold text-secondary text-[13px]">
                      {formatVND(selectedCustomer.creditLimit)}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-tertiary-fixed/30 border border-tertiary/20">
                    <span className="text-[10px] text-tertiary font-bold block">Đang nợ vụ:</span>
                    <span className="font-tabular-stat font-bold text-error text-[13px]">
                      {formatVND(selectedCustomer.currentDebt)}
                    </span>
                  </div>
                </div>
              </BentoCard>

              {/* Aquaculture Ponds List */}
              <BentoCard
                title="Danh mục ao nuôi thuộc sở hữu"
                subtitle="Được chọn khi bán nợ tại quầy POS và kê đơn thuốc ao"
              >
                <div className="space-y-2.5">
                  {selectedCustomer.ponds.length === 0 ? (
                    <p className="text-body-sm text-outline p-4 text-center">Chủ đầm chưa khai báo ao nuôi riêng.</p>
                  ) : (
                    selectedCustomer.ponds.map((pond, i) => (
                      <div
                        key={pond.id || i}
                        className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
                            <Icon name="water" className="text-[18px]" />
                          </div>
                          <div>
                            <h4 className="font-bold text-label-md text-on-surface">
                              {pond.name}
                            </h4>
                            <p className="text-[11px] text-outline">
                              Diện tích: {pond.area} • Khối nước: <strong className="text-primary">{pond.volume}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <Badge variant="primary" size="sm">
                            {pond.crop}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </BentoCard>
            </>
          ) : (
            <div className="p-12 text-center text-outline bg-surface-container-lowest rounded-xl border border-outline-variant/30">
              <Icon name="person_search" className="text-[48px] text-outline mb-2 inline-block" />
              <p className="font-semibold text-on-surface">Chưa chọn khách hàng nào</p>
              <p className="text-body-sm mt-1">Chọn một chủ đầm bên danh sách để xem hồ sơ và ao nuôi chi tiết.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Thêm Khách Hàng Mới */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Thêm Khách Hàng / Chủ Đầm Mới"
        subtitle="Lưu trực tiếp vào Database PostgreSQL Neon Cloud"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-label-sm font-semibold text-on-surface">
                Họ &amp; Tên chủ đầm <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="VD: Nguyễn Văn Tùng (Chú Sáu)"
                className="w-full h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-body-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-label-sm font-semibold text-on-surface">
                Số điện thoại liên hệ <span className="text-error">*</span>
              </label>
              <input
                type="tel"
                required
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="VD: 0918.455.789"
                className="w-full h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-body-sm font-mono focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-label-sm font-semibold text-on-surface">
                Địa chỉ / Vùng nuôi
              </label>
              <input
                type="text"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="VD: Ấp 4, Xã Vĩnh Hậu, Huyện Hòa Bình, Bạc Liêu"
                className="w-full h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-body-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-label-sm font-semibold text-on-surface">
                Hạn mức nợ vụ tối đa (VNĐ)
              </label>
              <input
                type="number"
                value={newCreditLimit}
                onChange={(e) => setNewCreditLimit(e.target.value)}
                placeholder="100000000"
                className="w-full h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-body-sm font-tabular-stat focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-outline-variant/20">
            <h4 className="font-bold text-label-md text-on-surface mb-2 flex items-center gap-1.5">
              <Icon name="water" className="text-primary text-[18px]" />
              <span>Khai báo ao nuôi khởi tạo đầu tiên</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-label-sm font-medium text-outline">
                  Tên ao nuôi
                </label>
                <input
                  type="text"
                  value={newPondName}
                  onChange={(e) => setNewPondName(e.target.value)}
                  placeholder="VD: Ao Số 1 (Lót bạt đáy oxy đáy)"
                  className="w-full h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-body-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-label-sm font-medium text-outline">
                  Diện tích ao (m²)
                </label>
                <input
                  type="number"
                  value={newPondArea}
                  onChange={(e) => setNewPondArea(e.target.value)}
                  placeholder="2500"
                  className="w-full h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-body-sm font-tabular-stat focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-outline-variant/20">
            <Button variant="outline" disabled={isSubmitting} onClick={() => setShowAddModal(false)}>
              Hủy bỏ
            </Button>
            <Button type="submit" variant="primary" icon="check" disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu vào Database...' : 'Tạo hồ sơ khách hàng'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
