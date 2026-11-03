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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, phone, email, role, pinCode, discountLimitPercent, canVoidOrder, active } = body;

    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name.trim();
    if (phone !== undefined) dataToUpdate.phone = phone.trim();
    if (email !== undefined) dataToUpdate.email = email?.trim() || null;
    if (role !== undefined) dataToUpdate.role = role as StaffRole;
    if (pinCode !== undefined && pinCode.length >= 4) dataToUpdate.pinCode = String(pinCode).trim();
    if (discountLimitPercent !== undefined) dataToUpdate.discountLimitPercent = Number(discountLimitPercent);
    if (canVoidOrder !== undefined) dataToUpdate.canVoidOrder = Boolean(canVoidOrder);
    if (active !== undefined) dataToUpdate.active = Boolean(active);

    const updated = await prisma.staff.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({
      id: updated.id,
      staffCode: updated.staffCode,
      name: updated.name,
      phone: updated.phone,
      email: updated.email,
      role: updated.role,
      roleName: ROLE_NAME_MAP[updated.role] || updated.role,
      pinCode: updated.pinCode,
      avatar: updated.name
        .split(' ')
        .map((w) => w[0])
        .slice(-2)
        .join('')
        .toUpperCase(),
      active: updated.active,
      discountLimitPercent: Number(updated.discountLimitPercent),
      canVoidOrder: updated.canVoidOrder,
      updatedAt: updated.updatedAt,
    });
  } catch (error: any) {
    console.error('Error updating staff:', error);
    return NextResponse.json({ error: error.message || 'Lỗi khi cập nhật nhân viên' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if staff has existing orders or debt receipts
    const staff = await prisma.staff.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true, shiftSessions: true },
        },
      },
    });

    if (!staff) {
      return NextResponse.json({ error: 'Không tìm thấy nhân viên' }, { status: 404 });
    }

    if (staff.role === StaffRole.SUPER_ADMIN) {
      return NextResponse.json({ error: 'Không thể xóa tài khoản Super Admin tối cao' }, { status: 400 });
    }

    // If staff has orders, deactivate instead of hard delete to preserve foreign keys
    if (staff._count.orders > 0 || staff._count.shiftSessions > 0) {
      await prisma.staff.update({
        where: { id },
        data: { active: false },
      });
      return NextResponse.json({ message: 'Nhân sự đã có dữ liệu giao dịch nên đã được chuyển sang trạng thái ngưng hoạt động.' });
    }

    await prisma.staff.delete({ where: { id } });
    return NextResponse.json({ message: 'Đã xóa nhân sự thành công' });
  } catch (error: any) {
    console.error('Error deleting staff:', error);
    return NextResponse.json({ error: error.message || 'Lỗi khi xóa nhân sự' }, { status: 500 });
  }
}
