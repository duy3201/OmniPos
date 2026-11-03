import { Controller, Get } from '@nestjs/common';
import { BatchesService } from './batches.service';

@Controller('batches')
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  @Get()
  async findAll() {
    return this.batchesService.findAll();
  }

  @Get('fefo-alerts')
  async getFefoAlerts() {
    return this.batchesService.getFefoAlerts();
  }
}
