import { Patrimonio } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import { PatrimonioNamesProps } from "../../../types/patrimonio-names";

export class SearchPatrimonioUseCase {
    async execute(search: any): Promise<PatrimonioNamesProps[] | null> {
        try {
            const patrimonios = await prisma.patrimonio.findMany({
                where: search,
                select: {
                    id: true,
                    placa: true,
                    descricao: true,
                    estado: true,
                    valor: true,
                    origem: true,
                    status: true,
                    data_entrada: true,
                    data_saida: true,
                    resp_entrega: true,
                    resp_retirada: true,
                    categoria: {
                        select: {
                            id: true,
                            descricao: true
                        }
                    },
                    localizacao: {
                        select: {
                            id: true,
                            descricao: true
                        }
                    },
                    id_usuario: true
                }
            })

            return patrimonios
        } catch {
            return null
        }
    }
}