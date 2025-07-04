// src/infra/database/prisma/prisma.service.ts

import { INestApplication, Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public prisma: PrismaClient;
  pedido: any;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async onModuleInit() {
    await this.prisma.$connect();
    console.log('PrismaService conectado ao banco de dados.');
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
    console.log('PrismaService desconectado do banco de dados.');
  }


  async enableShutdownHooks(app: INestApplication) {

  }

}