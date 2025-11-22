import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import Stripe from 'stripe';
import { CreateCheckoutCartDto } from './dto/create-checkout-session-cart';

@Injectable()
export class StripeService {
    constructor(private prismaService: PrismaService) { }

    instance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2025-11-17.clover',
    })

    async createDynamicProduct(data: {
        title: string,
        description: string,
        price: number,
    }) {
        const product = await this.instance.products.create({
            name: data.title,
            description: data.description,
        });

        const price = await this.instance.prices.create({
            product: product.id,
            unit_amount: Math.round(data.price * 100),
            currency: 'mxn',
        });


        return {
            productId: product.id,
            priceId: price.id,
        }
    }


    async createCartCheckoutSession(data: CreateCheckoutCartDto) {

        // 1. Validar usuario
        const user = await this.prismaService.user.findUnique({
            where: { id: data.userId },
        });

        if (!user) throw new Error('User not found');

        if (!data.items || data.items.length === 0) {
            throw new Error('Cart is empty');
        }

        const bookIdsFromCart = data.items.map(item => item.bookId);

        // 2. Traer TODOS los libros en una sola consulta
        const books = await this.prismaService.book.findMany({
            where: {
                id: { in: bookIdsFromCart },
            },
        });

        if (books.length !== data.items.length) {
            throw new Error('One or more books do not exist');
        }

        // 3. Traer TODOS los libros que ya tiene el usuario
        const userBooks = await this.prismaService.userBook.findMany({
            where: {
                userId: data.userId,
                bookId: { in: bookIdsFromCart },
            },
        });

        const userBookIds = new Set(userBooks.map(b => b.bookId));

        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
        const bookIds: number[] = [];

        // 4. Construir line_items
        for (const item of data.items) {

            const book = books.find(b => b.id === item.bookId);

            if (!book) {
                throw new Error(`Book with id ${item.bookId} not found`);
            }

            if (!book.stripePriceId) {
                throw new Error(`Book ${book.title} does not have a stripePriceId`);
            }

            if (userBookIds.has(item.bookId)) {
                throw new Error(`You already own the book: ${book.title}`);
            }

            // SIEMPRE quantity = 1 para e-books
            lineItems.push({
                price: book.stripePriceId,
                quantity: 1
            });

            bookIds.push(book.id);
        }

        // 5. Crear sesión en Stripe
        const session = await this.instance.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: lineItems,
            customer_email: data.userEmail ?? undefined,

            success_url: `${process.env.FRONTEND_URL}/payment/success`,
            cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,


            metadata: {
                userId: data.userId.toString(),
                books: JSON.stringify(bookIds),
            },
        });

        return { url: session.url };
    }



    async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
        console.log("\n📘 Webhook recibido: checkout.session.completed");
        console.log("➡️ Session ID:", session.id);

        const userId = Number(session.metadata?.userId);
        const booksString = session.metadata?.books;

        if (!userId || !booksString) {
            console.error("❌ Metadata incompleta en la sesión");
            return;
        }

        let bookIds: number[] = [];

        try {
            bookIds = JSON.parse(booksString);
        } catch (error) {
            console.error("❌ Error al parsear books metadata:", error);
            return;
        }

        if (!Array.isArray(bookIds) || bookIds.length === 0) {
            console.error("❌ No hay libros válidos en metadata");
            return;
        }

        console.log("📚 Libros comprados:", bookIds);

        // 1. Obtener los libros desde BD (en una sola consulta)
        const books = await this.prismaService.book.findMany({
            where: {
                id: { in: bookIds }
            }
        });

        if (books.length === 0) {
            console.error("❌ Ningún libro encontrado en BD");
            return;
        }

        // 2. Revisar cuáles ya existen en userBook
        const existingUserBooks = await this.prismaService.userBook.findMany({
            where: {
                userId: userId,
                bookId: { in: bookIds }
            }
        });

        const ownedBookIds = new Set(existingUserBooks.map(b => b.bookId));

        // 3. Crear registros SOLO para los libros nuevos
        for (const bookId of bookIds) {
            const book = await this.prismaService.book.findUnique({
                where: { id: bookId }
            });

            if (!book) {
                console.error(`❌ Libro no encontrado: ${bookId}`);
                continue;
            }

            const existingPurchase = await this.prismaService.purchase.findFirst({
                where: {
                    AND: [
                        { userId: userId },
                        { bookId: bookId }
                    ]
                }
            });

            if (existingPurchase) {
                console.log(`⚠️ El usuario ya compró el libro ${bookId}`);
                continue;
            }

            const newPurchase = await this.prismaService.purchase.create({
                data: {
                    userId,
                    bookId,
                    priceAtPurchase: book.price,
                    stripeSessionId: session.id,
                    stripePaymentIntentId: session.payment_intent?.toString(),
                    status: 'PAID'
                }
            });

            console.log(`✅ Purchase creada (${newPurchase.id}) para libro ${bookId}`);

            await this.prismaService.userBook.upsert({
                where: {
                    userId_bookId: {
                        userId,
                        bookId
                    }
                },
                update: {},
                create: {
                    userId,
                    bookId
                }
            });

            console.log(`📚 Libro ${bookId} asegurado en biblioteca`);
        }


        console.log("🎉 Proceso del carrito finalizado correctamente.\n");
    }





}
