import { Controller, Get, UseGuards } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { RolesAllowed } from 'src/auth/decorators/roles.decorator';
import { Roles } from '../common/enums';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Compras')
@Controller('purchases')
export class PurchasesController {
    constructor(private readonly purchasesService: PurchasesService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @RolesAllowed(Roles.ADMIN)
    @ApiBearerAuth()
    @Get('/paid')
    @ApiOperation({ summary: 'Obtener todas las compras pagadas (solo ADMIN)' })
    @ApiResponse({
        status: 200,
        description: 'Lista de compras pagadas retornada correctamente.',
    })
    @ApiResponse({
        status: 403,
        description: 'No autorizado.',
    })
    async getPaidPurchases() {
        return await this.purchasesService.getPaidPurchases();
    }
}
