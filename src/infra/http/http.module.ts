// Em src/infra/http/http.module.ts

import { Module } from '@nestjs/common';
import { HttpModule as AxiosHttpModule } from '@nestjs/axios';
import { StorageClient } from './storage.client';
import { GestaoDadosClient } from './gestao-dados.client';

@Module({
  imports: [
    AxiosHttpModule.register({
      timeout: 10000, // 10 segundos de timeout
    }),
  ],
  providers: [
    StorageClient,
    GestaoDadosClient,
  ],
  exports: [
    AxiosHttpModule, 
    StorageClient,
    GestaoDadosClient,
  ], 
})
export class HttpModule {}