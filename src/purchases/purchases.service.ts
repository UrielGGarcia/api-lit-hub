import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PurchasesService {
    constructor(private prismaService: PrismaService) { }

    async getPaidPurchases() {
        try {

            const paidPurchases = await this.prismaService.purchase.findMany({
                where: { status: 'PAID' },
            });

            return paidPurchases;

        } catch (error) {
            if (error instanceof Error) {
                throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
}
