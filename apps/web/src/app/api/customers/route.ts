import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    const where: any = {};
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        ponds: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(customers);
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const customerCode = body.customerCode?.trim() || `KH-${Date.now().toString().slice(-6)}`;
    const province = body.province?.trim() || 'Bạc Liêu';
    const address = body.address?.trim() || 'Đồng bằng Sông Cửu Long';

    const pondsData = body.ponds && Array.isArray(body.ponds) && body.ponds.length > 0
      ? body.ponds.map((p: any) => ({
          name: p.name || 'Ao Số 1',
          pondType: p.pondType || 'Ao bạt đáy',
          areaM2: Number(p.areaM2) || 2500,
          waterVolumeM3: Number(p.waterVolumeM3) || 3000,
          targetSpecies: p.targetSpecies || 'Tôm thẻ chân trắng',
          status: 'Đang nuôi',
        }))
      : [
          {
            name: body.pondName?.trim() || 'Ao Nuôi Chính 01',
            pondType: 'Ao bạt đáy',
            areaM2: 2500,
            waterVolumeM3: 3000,
            targetSpecies: 'Tôm thẻ chân trắng',
            status: 'Đang nuôi',
          },
        ];

    const customer = await prisma.customer.create({
      data: {
        customerCode,
        name: body.name.trim(),
        phone: body.phone.trim(),
        address,
        province,
        creditLimit: Number(body.creditLimit) || 50000000,
        currentDebt: Number(body.currentDebt) || 0,
        ponds: {
          create: pondsData,
        },
      },
      include: {
        ponds: true,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error: any) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
