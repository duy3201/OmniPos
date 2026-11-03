import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.client.batch.findMany({
      include: {
        product: true,
      },
      orderBy: { expiryDate: 'asc' }, // FEFO
    });
  }

  async getFefoAlerts() {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(now.getDate() + 90);

    const nearExpiry = await this.prisma.client.batch.findMany({
      where: {
        expiryDate: { lte: ninetyDaysFromNow },
        quantity: { gt: 0 },
      },
      include: { product: true },
      orderBy: { expiryDate: 'asc' },
    });

    return {
      nearExpiry,
      count: nearExpiry.length,
    };
  }
}
