import { Controller, Get } from '@nestjs/common';
import { PurchasesService } from './purchases.service';

@Controller('purchases')
export class PurchasesController {
    constructor(private readonly purchasesService: PurchasesService) { }

    @Get('/paid')
    async getPaidPurchases() {
        return await this.purchasesService.getPaidPurchases();
    }
}
