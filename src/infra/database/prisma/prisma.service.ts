// src/infra/database/prisma/prisma.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    // Garante que a conexão com o banco seja estabelecida quando o módulo iniciar
    await this.$connect();
    console.log('PrismaService conectado ao banco de dados.');
  }
}