// dto/create-checkout-cart.dto.ts
import {
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  Min,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

class CartItemDto {
  @IsInt()
  @IsNotEmpty()
  bookId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateCheckoutCartDto {

  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsEmail()
  @IsNotEmpty()
  userEmail: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];
}
