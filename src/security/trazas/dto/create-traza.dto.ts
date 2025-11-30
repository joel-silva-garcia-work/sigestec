// src/traza/dto/traza.dto.ts

export class CreateTrazaDto {
    ip: string;
    url: string;
    fecha: Date = new Date();
    user?: string;
    traza: Record<string, any> ; // Puede ajustarse según la estructura necesaria para el campo traza
  }
  