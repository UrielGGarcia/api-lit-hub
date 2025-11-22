import { Body, Controller, HttpStatus, Post, Req, Res, Headers } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { CreateCheckoutDto } from './dto/create-checkout-session.dto';
import { RawBodyRequest } from '@nestjs/common';
import { Request, Response } from 'express';
import { CreateCheckoutCartDto } from './dto/create-checkout-session-cart';

@Controller('stripe')
export class StripeController {
    constructor(private readonly stripeService: StripeService) { }

    @Post("/create-product")
    async createDynamicProduct(@Body() body: any) {
        return await this.stripeService.createDynamicProduct(body);
    }

    // stripe.controller.ts
    @Post('/checkout-session/cart')
    async createCartCheckout(
        @Body() data: CreateCheckoutCartDto
    ) {
        return await this.stripeService.createCartCheckoutSession(data);
    }


    @Post('webhook')
    async handleWebhook(
        @Req() req: RawBodyRequest<Request>,
        @Res() res: Response,
        @Headers('stripe-signature') sig: string
    ) {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
        if (!sig || !webhookSecret) {
            return res
                .status(HttpStatus.BAD_REQUEST)
                .send('Missing signature or webhook secret');
        }

        let event;

        try {
            event = this.stripeService.instance.webhooks.constructEvent(
                req.body, // ✔️ Aquí llega como RAW Buffer
                sig,
                webhookSecret,
            );
        } catch (err: any) {
            console.error('❌ Error verificando firma:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Manejar eventos
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                await this.stripeService.handleCheckoutSessionCompleted(session);
                break;
            }
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return res.json({ received: true });
    }
}
