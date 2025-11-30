// src/traza/traza.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Traza } from './entities/traza.entity';
import { CreateTrazaDto } from './dto/create-traza.dto';

@Injectable()
export class TrazaService {
  constructor(
    @InjectRepository(Traza)
    private readonly trazaRepository: Repository<Traza>,
  ) {}

  async findAllItems() {
    return await this.trazaRepository.find();
  }
}
