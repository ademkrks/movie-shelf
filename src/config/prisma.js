// Prisma Client sınıfını içe aktarır
const { PrismaClient } = require("@prisma/client");

// Prisma Client instance'ı oluşturur
const prisma = new PrismaClient();

// Diğer dosyalarda kullanılabilmesi için dışa aktarır
module.exports = prisma;