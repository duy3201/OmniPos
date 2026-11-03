'use client';

import React, { useState, useEffect } from 'react';
import { Icon, Button, Badge, useToast } from '@/components/ui';
import { API_BASE_URL } from '@/lib/api';
import { CustomerSummary } from '@/stores/cartStore';

interface CustomerSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: CustomerSummary | null) => void;
}

export const CustomerSelectModal: React.FC<CustomerSelectModalProps> = ({
  isOpen,
  onClose,
  onSelectCustomer,
}) => {
  const toast = useToast();
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // New customer form states
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCreditLimit, setNewCreditLimit] = useState('50000000');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatVND = (val: number) => `${(val || 0).toLocaleString('vi-VN')}₫`;

  useEffect(() => {
    if (isOpen) {
      loadCustomers();
    }
  }, [isOpen]);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/customers`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped: CustomerSummary[] = data.map((c: any) => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            tier: c.totalSpend > 100000000 ? 'Kim Cương' : c.totalSpend > 50000000 ? 'Vàng' : 'Bạc',
            points: Math.round((c.totalSpend || 0) / 100000),
            creditLimit: Number(c.creditLimit || 50000000),
            currentDebt: Number(c.currentDebt || 0),
            ponds: (c.ponds || []).map((p: any) => ({
              id: p.id,
              name: p.name,
              crop: p.cropType || 'Vụ chính 2026',
            })),
          }));
          setCustomers(mapped);
        }
      }
    } catch (err) {
      console.error('Failed to load customers from real DB:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      toast.error('Thiếu thông tin', 'Vui lòng nhập tên và số điện thoại chủ đầm.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          phone: newPhone.trim(),
          address: newAddress.trim(),
          creditLimit: Number(newCreditLimit) || 50000000,
          currentDebt: 0,
        }),
      });

      if (!res.ok) throw new Error('Không thể tạo khách hàng.');
      const created = await res.json();

      const newSummary: CustomerSummary = {
        id: created.id,
        name: created.name,
        phone: created.phone,
        tier: 'Bạc',
        points: 0,
        creditLimit: Number(created.creditLimit || 50000000),
        currentDebt: 0,
        ponds: [],
      };

      toast.success('Đã thêm khách hàng!', `Chủ đầm ${newName} đã được lưu vào database.`);
      setCustomers([newSummary, ...customers]);
      onSelectCustomer(newSummary);
      setShowAddForm(false);
      onClose();
    } catch (err: any) {
      toast.error('Lỗi', err.message || 'Không thể tạo khách hàng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant/30 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Icon name="groups" className="text-[24px]" />
            </div>
            <div>
              <h3 className="font-bold text-headline-sm text-on-surface">
                Chọn Chủ Đầm / Hộ Nuôi Tôm
              </h3>
              <p className="text-body-sm text-outline">
                Kết nối dữ liệu thực tế từ Database PostgreSQL ({customers.length} chủ ao)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-outline transition-colors"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        {/* Search & Actions */}
        <div className="p-4 border-b border-outline-variant/20 bg-surface-container-low/50 flex items-center gap-2">
          <div className="relative flex-1">
            <Icon name="search" className="absolute left-3 top-2.5 text-outline text-[18px]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên chủ ao, SĐT..."
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-surface-container-lowest text-body-sm text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary"
            />
          </div>

          <Button
            variant="secondary"
            icon={showAddForm ? 'close' : 'person_add'}
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Đóng form' : '+ Thêm mới'}
          </Button>
        </div>

        {/* Add Form (Collapsible) */}
        {showAddForm && (
          <form onSubmit={handleCreateCustomer} className="p-4 bg-primary-fixed/20 border-b border-primary/20 space-y-3">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wide">
              Khai Báo Chủ Đầm Mới Vào Database
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Họ và tên chủ đầm *"
                className="h-9 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-xs font-semibold text-on-surface"
                required
              />
              <input
                type="text"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="Số điện thoại *"
                className="h-9 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-xs font-mono text-on-surface"
                required
              />
              <input
                type="text"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="Địa chỉ ao đầm (Ấp, Xã, Huyện...)"
                className="h-9 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-xs text-on-surface sm:col-span-2"
              />
              <div className="sm:col-span-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xs text-outline shrink-0">Hạn mức nợ (₫):</span>
                  <input
                    type="number"
                    value={newCreditLimit}
                    onChange={(e) => setNewCreditLimit(e.target.value)}
                    className="h-9 px-3 w-full rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-xs font-bold text-primary"
                  />
                </div>
                <Button type="submit" variant="primary" size="sm" loading={isSubmitting} icon="save">
                  Lưu vào DB
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Customer List Body */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {/* Quick Option: Khách lẻ vãng lai */}
          <div
            onClick={() => {
              onSelectCustomer(null);
              onClose();
            }}
            className="p-3 rounded-xl border border-dashed border-outline-variant/40 hover:bg-surface-container-low transition-colors cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-surface-container text-outline flex items-center justify-center font-bold">
                <Icon name="person_outline" className="text-[18px]" />
              </div>
              <div>
                <p className="font-bold text-label-md text-on-surface">
                  Khách lẻ mua nhanh (Vãng lai)
                </p>
                <p className="text-[11px] text-outline">
                  Thanh toán ngay bằng Tiền mặt / VietQR (Không nợ vụ)
                </p>
              </div>
            </div>
            <Icon name="chevron_right" className="text-outline text-[18px]" />
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-outline space-y-2">
              <Icon name="refresh" className="text-[28px] animate-spin mx-auto text-primary" />
              <p className="text-xs">Đang tải khách hàng từ PostgreSQL...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-outline">
              <p className="font-semibold text-on-surface">Không tìm thấy chủ đầm phù hợp</p>
              <p className="text-xs mt-1">Bấm nút "+ Thêm mới" để tạo khách hàng mới</p>
            </div>
          ) : (
            filtered.map((cust) => (
              <div
                key={cust.id}
                onClick={() => {
                  onSelectCustomer(cust);
                  onClose();
                }}
                className="p-3 rounded-xl border border-outline-variant/30 bg-surface-container-lowest hover:bg-surface-container-low/70 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                    {cust.name.slice(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-label-md text-on-surface truncate">
                        {cust.name}
                      </p>
                      <Badge variant="primary" size="sm">
                        {cust.tier}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-outline font-mono mt-0.5">
                      SĐT: {cust.phone} • {cust.ponds.length} ao nuôi
                    </p>
                    {cust.ponds.length > 0 && (
                      <p className="text-[10px] text-tertiary truncate mt-0.5">
                        Ao: {cust.ponds.map((p) => p.name).join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-outline block">
                    Dư nợ: <strong className="text-error">{formatVND(cust.currentDebt)}</strong>
                  </span>
                  <span className="text-[10px] text-secondary font-mono font-bold block">
                    Hạn mức: {formatVND(cust.creditLimit)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-outline-variant/20 bg-surface-container-low flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};
