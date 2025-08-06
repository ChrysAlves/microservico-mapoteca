// src/domain/pasta/dto/listar-conteudo-pasta.dto.ts

class AipInFolderDto {
    cod_id: string;
    nom_titulo: string;
    dhs_creation: Date;
}

class SubPastaDto {
  cod_id: string;
  nom_pasta: string;
  cod_pai: string | null;
}

export class ListarConteudoPastaDto {
    cod_id: string;
    nom_pasta: string;
    aips: AipInFolderDto[];
    filhas: SubPastaDto[]; 
}