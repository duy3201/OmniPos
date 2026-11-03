import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { StaffRole } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const configs = await prisma.rolePermissionConfig.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(configs);
  } catch (error: any) {
    console.error('Error fetching role permission configs:', error);
    return NextResponse.json({ error: error.message || 'Lỗi khi tải cấu hình phân quyền' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { role, allowedRoutes, allowedActions, forbiddenActions, maxDiscountPercent, notes } = body;

    if (!role || !Object.values(StaffRole).includes(role as StaffRole)) {
      return NextResponse.json({ error: 'Chức vụ không hợp lệ' }, { status: 400 });
    }

    const updated = await prisma.rolePermissionConfig.upsert({
      where: { role: role as StaffRole },
      update: {
        allowedRoutes: allowedRoutes ?? [],
        allowedActions: allowedActions ?? [],
        forbiddenActions: forbiddenActions ?? [],
        maxDiscountPercent: maxDiscountPercent !== undefined ? Number(maxDiscountPercent) : 5.0,
        notes: notes ?? null,
      },
      create: {
        role: role as StaffRole,
        allowedRoutes: allowedRoutes ?? [],
        allowedActions: allowedActions ?? [],
        forbiddenActions: forbiddenActions ?? [],
        maxDiscountPercent: maxDiscountPercent !== undefined ? Number(maxDiscountPercent) : 5.0,
        notes: notes ?? null,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error saving role permission config:', error);
    return NextResponse.json({ error: error.message || 'Lỗi khi lưu cấu hình phân quyền' }, { status: 500 });
  }
}
