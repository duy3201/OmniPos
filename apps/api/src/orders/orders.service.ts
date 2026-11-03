import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentMethod, StockTransactionType } from '@omnipos/database';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.client.order.findMany({
      include: {
        customer: true,
        pond: true,
        staff: true,
        items: {
          include: {
            product: true,
            batch: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async findOne(id: string) {
    return this.prisma.client.order.findUnique({
      where: { id },
      include: {
        customer: { include: { ponds: true } },
        pond: true,
        staff: true,
        items: {
          include: {
            product: true,
            batch: true,
          },
        },
      },
    });
  }

  async create(data: {
    customerId?: string;
    pondId?: string;
    staffId: string;
    subtotal: number;
    discountAmount: number;
    vatAmount: number;
    totalAmount: number;
    paymentMethod: PaymentMethod;
    notes?: string;
    managerApprovedDebt?: boolean;
    items: {
      productId: string;
      batchId?: string;
      unitName: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }[];
  }) {
    // 1. Strict Input Validation (Step 10 & 13)
    if (!data.items || data.items.length === 0) {
      throw new BadRequestException('Hóa đơn bán hàng phải có ít nhất 1 mặt hàng vật tư/thuốc!');
    }

    if (data.subtotal < 0 || data.totalAmount < 0 || data.discountAmount < 0) {
      throw new BadRequestException('Giá trị thanh toán hoặc chiết khấu không hợp lệ (không được âm)!');
    }

    for (const item of data.items) {
      if (!item.productId) {
        throw new BadRequestException('Mã sản phẩm không được để trống!');
      }
      if (item.quantity <= 0) {
        throw new BadRequestException(`Số lượng mặt hàng phải lớn hơn 0 (Nhận: ${item.quantity})!`);
      }
      if (item.unitPrice < 0) {
        throw new BadRequestException('Đơn giá sản phẩm không được âm!');
      }
    }

    const safeTotalAmount = Math.round(data.totalAmount);
    const safeSubtotal = Math.round(data.subtotal);
    const safeDiscount = Math.round(data.discountAmount);

    const orderCount = await this.prisma.client.order.count();
    const orderCode = `POS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(orderCount + 1).padStart(4, '0')}`;

    return this.prisma.client.$transaction(async (tx) => {
      // 1. Tạo đơn hàng
      const order = await tx.order.create({
        data: {
          orderCode,
          customerId: data.customerId,
          pondId: data.pondId,
          staffId: data.staffId,
          subtotal: safeSubtotal,
          discountAmount: safeDiscount,
          vatAmount: Math.round(data.vatAmount || 0),
          totalAmount: safeTotalAmount,
          paymentMethod: data.paymentMethod,
          notes: data.notes,
          items: {
            create: data.items.map((i) => ({
              productId: i.productId,
              batchId: i.batchId,
              unitName: i.unitName,
              quantity: i.quantity,
              unitPrice: Math.round(i.unitPrice),
              totalPrice: Math.round(i.totalPrice),
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // 2. Nếu thanh toán Bán nợ vụ nuôi (CROP_DEBT), kiểm tra hạn mức & cộng nợ
      if (data.paymentMethod === PaymentMethod.CROP_DEBT && data.customerId) {
        const customer = await tx.customer.findUnique({ where: { id: data.customerId } });
        if (customer) {
          const projectedDebt = Number(customer.currentDebt) + safeTotalAmount;
          if (projectedDebt > Number(customer.creditLimit) && !data.managerApprovedDebt) {
            throw new BadRequestException(
              `Khách hàng "${customer.name}" vượt hạn mức tín dụng cho phép (${Number(customer.creditLimit).toLocaleString('vi-VN')}₫). Cần có Quản lý phê duyệt!`,
            );
          }
        }

        await tx.customer.update({
          where: { id: data.customerId },
          data: {
            currentDebt: { increment: safeTotalAmount },
          },
        });

        // Tìm sổ nợ vụ nuôi active của ao hoặc khách
        const activeDebtLedger = await tx.cropDebtLedger.findFirst({
          where: { customerId: data.customerId, status: 'ACTIVE' },
        });

        if (activeDebtLedger) {
          await tx.cropDebtLedger.update({
            where: { id: activeDebtLedger.id },
            data: {
              totalDebt: { increment: data.totalAmount },
            },
          });
        }
      }

      // 3. Trừ tồn kho và ghi Thẻ kho (StockCard)
      for (const item of data.items) {
        if (item.batchId) {
          const batch = await tx.batch.findUnique({ where: { id: item.batchId } });
          const newQty = batch ? Number(batch.quantity) - item.quantity : 0;

          await tx.batch.update({
            where: { id: item.batchId },
            data: { quantity: newQty },
          });

          await tx.stockCard.create({
            data: {
              productId: item.productId,
              batchId: item.batchId,
              transactionType: StockTransactionType.POS_SALE,
              documentNo: orderCode,
              staffId: data.staffId,
              changeQuantity: -item.quantity,
              balanceAfter: newQty,
              unitPrice: item.unitPrice,
              reasonNote: `Bán lẻ POS cho đơn ${orderCode}`,
            },
          });
        }
      }

      return order;
    });
  }
}
