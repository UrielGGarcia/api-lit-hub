import { Body, Controller, Get, Post } from '@nestjs/common';
import { get } from 'http';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {


    constructor(private usersService: UsersService) { }

    @Get()
    async getUsers() {
        return await this.usersService.getUsers();
    }

    @Post()
    async createUser(@Body() data: CreateUserDto) {
        return await this.usersService.createUser(data);
    }

}
