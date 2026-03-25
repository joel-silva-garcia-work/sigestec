// src/traza/traza.controller.ts

import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { TrazaService } from './trazas.service';
import { JwtGuard } from '../auth/guard';
import { GetUserAdmin } from '../auth/decorator';
import { User } from '../user/entities/user.entity';

@Controller('trazas')
export class TrazaController {
  constructor(private readonly trazaService: TrazaService) {}

  @UseGuards(JwtGuard)
  @Get('ver')
  async findItems(@GetUserAdmin() user: User) {
    return await this.trazaService.findAllItems();
  }
}
