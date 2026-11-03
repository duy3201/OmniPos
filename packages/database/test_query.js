const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:123456@localhost:5432/omnipos?schema=public',
    },
  },
});

async function main() {
  const count = await prisma.product.count();
  console.log('Product count in DB:', count);
  const products = await prisma.product.findMany({
    take: 5,
    select: { id: true, name: true, sku: true, retailPrice: true },
  });
  console.log('Sample products:', products);
  const orders = await prisma.order.count();
  console.log('Orders count in DB:', orders);
  const customers = await prisma.customer.count();
  console.log('Customers count in DB:', customers);
}

main()
  .catch((e) => {
    console.error('Error:', e);
  })
  .finally(() => prisma.$disconnect());
