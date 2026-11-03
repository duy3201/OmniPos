import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PaymentMethod } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        ponds: true,
        cropDebts: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { currentDebt: 'desc' },
    });

    // Format debts for admin/debts view
    const debts = customers.map((c) => {
      const pond = c.ponds[0];
      const crop = c.cropDebts[0];
      const creditLimit = Number(c.creditLimit);
      const currentDebt = Number(c.currentDebt);

      let status = 'NORMAL';
      if (currentDebt > creditLimit && creditLimit > 0) {
        status = 'OVER_LIMIT';
      } else if (pond?.status === 'Chuẩn bị thu hoạch' || pond?.shrimpAgeDays > 75) {
        status = 'HARVEST_PENDING';
      }

      return {
        id: c.id,
        customerId: c.id,
        customerName: c.nickname ? `${c.name} (${c.nickname})` : c.name,
        phone: c.phone,
        pondName: pond ? `${pond.name} (${pond.pondType})` : 'Toàn trang trại',
        cropSeason: crop ? crop.cropSeasonName : 'Vụ 1/2026 - Tôm thương phẩm',
        creditLimit,
        currentDebt,
        lastPaymentDate: new Date(c.updatedAt).toLocaleDateString('vi-VN'),
        status,
      };
    });

    return NextResponse.json(debts);
  } catch (error: any) {
    console.error('Error fetching debts:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, amount, paymentMethod, notes, staffId } = body;

    const payAmount = Number(amount);
    if (!customerId || !payAmount || payAmount <= 0) {
      return NextResponse.json({ error: 'Dữ liệu thu nợ không hợp lệ' }, { status: 400 });
    }

    // Default staff if not supplied
    let activeStaffId = staffId;
    if (!activeStaffId) {
      const firstStaff = await prisma.staff.findFirst();
      activeStaffId = firstStaff?.id;
    }

    const receiptCode = `PT-${Date.now().toString().slice(-6)}`;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch current customer
      const customer = await tx.customer.findUnique({
        where: { id: customerId },
      });
      if (!customer) {
        throw new Error('Không tìm thấy khách hàng');
      }

      const newDebt = Math.max(0, Number(customer.currentDebt) - payAmount);

      // 2. Update customer debt
      const updatedCustomer = await tx.customer.update({
        where: { id: customerId },
        data: {
          currentDebt: newDebt,
        },
      });

      // 3. Create DebtPaymentReceipt
      const receipt = await tx.debtPaymentReceipt.create({
        data: {
          receiptCode,
          customerId,
          amount: payAmount,
          paymentMethod: (paymentMethod as PaymentMethod) || PaymentMethod.CASH,
          staffId: activeStaffId!,
          notes: notes || 'Thu nợ vụ nuôi tôm',
        },
      });

      return {
        receipt,
        newDebt,
        customer: updatedCustomer,
      };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error recording debt payment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
