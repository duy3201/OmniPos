import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { PaymentMethod } from '@omnipos/database';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  async create(
    @Body()
    body: {
      customerId?: string;
      pondId?: string;
      staffId: string;
      subtotal: number;
      discountAmount: number;
      vatAmount: number;
      totalAmount: number;
      paymentMethod: PaymentMethod;
      notes?: string;
      items: {
        productId: string;
        batchId?: string;
        unitName: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
      }[];
    },
  ) {
    return this.ordersService.create(body);
  }
}
