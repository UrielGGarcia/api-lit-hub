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

  // Opción 1: createMany (más rápido si no te importa el orden)
  const result = await prisma.genre.createMany({
    data: genres.map((name) => ({ name })),
    skipDuplicates: true, // importante por la constraint @unique en name
  });

  console.log(`✅ Se crearon/ignoraron ${result.count} géneros.`);

  // Opción 2 (alternativa más segura con upsert, recomendado si quieres control total)
  // for (const name of genres) {
  //   await prisma.genre.upsert({
  //     where: { name },
  //     update: {},
  //     create: { name },
  //   });
  // }
  // console.log('✅ Todos los géneros están asegurados en la BD');
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