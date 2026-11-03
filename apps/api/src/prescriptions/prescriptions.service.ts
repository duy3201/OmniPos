import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrescriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.client.waterTestPrescription.findMany({
      include: {
        customer: true,
        pond: true,
        technician: true,
        items: {
          include: {
            product: {
              include: {
                unitConversions: true,
                batches: {
                  orderBy: { expiryDate: 'asc' },
                },
              },
            },
          },
        },
      },
      orderBy: { testDate: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.client.waterTestPrescription.findUnique({
      where: { id },
      include: {
        customer: { include: { ponds: true } },
        pond: true,
        technician: true,
        items: {
          include: {
            product: {
              include: {
                unitConversions: true,
                batches: true,
              },
            },
          },
        },
      },
    });
  }
}
