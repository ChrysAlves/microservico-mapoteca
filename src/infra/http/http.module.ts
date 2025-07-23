// src/infra/http/http.module.ts

import { Module } from '@nestjs/common';
import { HttpModule as AxiosHttpModule } from '@nestjs/axios';
import { StorageClient } from './storage.client';

@Module({
  imports: [
    AxiosHttpModule.register({
      timeout: 10000, // 10 segundos de timeout
    }),
  ],
  providers: [StorageClient],
  exports: [StorageClient], // Exporta o StorageClient para ser usado em outros módulos
})
export class HttpModule {}