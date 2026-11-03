import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query?: string) {
    const where: any = {};
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { nickname: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query } },
        { customerCode: { contains: query, mode: 'insensitive' } },
      ];
    }

    return this.prisma.client.customer.findMany({
      where,
      include: {
        ponds: true,
        cropDebts: {
          where: { status: 'ACTIVE' },
        },
      },
      orderBy: { currentDebt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.client.customer.findUnique({
      where: { id },
      include: {
        ponds: true,
        cropDebts: {
          include: {
            debtReceipts: true,
            pond: true,
          },
        },
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { items: { include: { product: true } } },
        },
        prescriptions: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { items: { include: { product: true } } },
        },
      },
    });
  }
}
