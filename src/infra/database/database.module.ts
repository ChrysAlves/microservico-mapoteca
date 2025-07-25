// src/infra/database/database.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Global() // O @Global() torna os providers exportados disponíveis em toda a aplicação
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // <-- A linha 'exports' é a mais importante
})
export class DatabaseModule {}