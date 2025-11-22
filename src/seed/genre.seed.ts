import { PrismaClient } from '../../generated/prisma';
const prisma = new PrismaClient();

const genres = [
  'Fantasía',
  'Ciencia Ficción',
  'Romance',
  'Terror',
  'Misterio',
  'Thriller',
  'Histórica',
  'Juvenil',
  'No Ficción',
  'Autoayuda',
  'Poesía',
  'Erótica',
  'Aventura',
  'Distopía',
  'Policiaca',
  'Humor',
  'Infantil',
  'Cómic / Novela Gráfica',
];

async function main() {
  console.log('🌱 Iniciando seed de géneros...');

  const result = await prisma.genre.createMany({
    data: genres.map((name) => ({ name })),
    skipDuplicates: true, 
  });

  console.log(`✅ Se crearon/ignoraron ${result.count} géneros.`);

}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error en el seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });