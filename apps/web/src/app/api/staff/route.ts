import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { StaffRole } from '@prisma/client';

export const dynamic = 'force-dynamic';

const ROLE_NAME_MAP: Record<StaffRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  STORE_MANAGER: 'Quản Lý Cửa Hàng',
  AQUA_TECHNICIAN: 'Kỹ Sư Thủy Sản',
  CASHIER: 'Thu Ngân Quầy',
  WAREHOUSE_KEEPER: 'Thủ Kho',
};

const DEFAULT_DISCOUNT_LIMITS: Record<StaffRole, number> = {
  SUPER_ADMIN: 100,
  STORE_MANAGER: 20,
  AQUA_TECHNICIAN: 10,
  CASHIER: 5,
  WAREHOUSE_KEEPER: 0,
};

export async function GET(request: NextRequest) {
  try {
    const staffList = await prisma.staff.findMany({
      orderBy: { createdAt: 'asc' },
    });

    const formatted = staffList.map((s) => ({
      id: s.id,
      staffCode: s.staffCode,
      name: s.name,
      phone: s.phone,
      email: s.email,
      role: s.role,
      roleName: ROLE_NAME_MAP[s.role] || s.role,
      pinCode: s.pinCode,
      avatar: s.name
        .split(' ')
        .map((w) => w[0])
        .slice(-2)
        .join('')
        .toUpperCase(),
      active: s.active,
      discountLimitPercent: Number(s.discountLimitPercent),
      canVoidOrder: s.canVoidOrder,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error('Error fetching staff list:', error);
    return NextResponse.json({ error: error.message || 'Lỗi khi tải danh sách nhân sự' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, role, pinCode, discountLimitPercent, canVoidOrder } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Họ tên nhân viên không được để trống' }, { status: 400 });
    }

    if (!phone?.trim()) {
      return NextResponse.json({ error: 'Số điện thoại không được để trống' }, { status: 400 });
    }

    if (!pinCode || pinCode.length < 4) {
      return NextResponse.json({ error: 'Mã PIN bảo mật phải từ 4 đến 6 chữ số' }, { status: 400 });
    }

    // Check duplicate phone
    const existingPhone = await prisma.staff.findFirst({
      where: { phone: phone.trim() },
    });
    if (existingPhone) {
      return NextResponse.json({ error: 'Số điện thoại này đã được đăng ký cho nhân viên khác' }, { status: 400 });
    }

    // Generate unique staffCode
    const staffCount = await prisma.staff.count();
    const staffCode = `NV-${String(staffCount + 1).padStart(3, '0')}`;

    const staffRole = (role as StaffRole) || StaffRole.CASHIER;
    const discount = discountLimitPercent !== undefined
      ? Number(discountLimitPercent)
      : (DEFAULT_DISCOUNT_LIMITS[staffRole] ?? 5);

    const newStaff = await prisma.staff.create({
      data: {
        staffCode,
        name: name.trim(),
        phone: phone.trim(),
        email: email?.trim() || null,
        role: staffRole,
        pinCode: String(pinCode).trim(),
        active: true,
        discountLimitPercent: discount,
        canVoidOrder: Boolean(canVoidOrder || staffRole === StaffRole.SUPER_ADMIN || staffRole === StaffRole.STORE_MANAGER),
      },
    });

    const formatted = {
      id: newStaff.id,
      staffCode: newStaff.staffCode,
      name: newStaff.name,
      phone: newStaff.phone,
      email: newStaff.email,
      role: newStaff.role,
      roleName: ROLE_NAME_MAP[newStaff.role] || newStaff.role,
      pinCode: newStaff.pinCode,
      avatar: newStaff.name
        .split(' ')
        .map((w) => w[0])
        .slice(-2)
        .join('')
        .toUpperCase(),
      active: newStaff.active,
      discountLimitPercent: Number(newStaff.discountLimitPercent),
      canVoidOrder: newStaff.canVoidOrder,
      createdAt: newStaff.createdAt,
      updatedAt: newStaff.updatedAt,
    };

    return NextResponse.json(formatted, { status: 201 });
  } catch (error: any) {
    console.error('Error creating staff member:', error);
    return NextResponse.json({ error: error.message || 'Lỗi khi tạo nhân sự mới' }, { status: 500 });
  }
}
