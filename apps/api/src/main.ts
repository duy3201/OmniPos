import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL,
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(new Error('Origin bị chặn bởi chính sách bảo mật CORS OmniPOS'), false);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('OmniPOS Aquaculture API')
    .setDescription('Hệ thống REST API cho phần mềm Quản lý Cửa hàng Vật tư Thủy sản OmniPOS')
    .setVersion('1.0')
    .addTag('products', 'Quản lý sản phẩm, quy đổi đơn vị đo, mã vạch')
    .addTag('customers', 'Quản lý khách hàng, hồ sơ ao nuôi, hạn mức nợ')
    .addTag('orders', 'Quản lý bán hàng POS, bán nợ vụ nuôi, thẻ kho')
    .addTag('prescriptions', 'Phòng xét nghiệm nước & toa thuốc điều trị')
    .addTag('batches', 'Quản lý lô hàng & cảnh báo hạn sử dụng FEFO')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 OmniPOS NestJS API đang chạy tại: http://localhost:${port}/api`);
  console.log(`📚 Tài liệu Swagger API Docs tại: http://localhost:${port}/api/docs`);
}

bootstrap();
