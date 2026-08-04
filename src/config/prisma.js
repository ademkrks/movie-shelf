// Prisma Client sınıfını içe aktarır
const { PrismaClient } = require("@prisma/client");

// Veritabanı bağlantısını oluşturur
const prisma = new PrismaClient();

// Diğer dosyalarda kullanılabilmesi için dışa aktarır
module.exports = prisma;