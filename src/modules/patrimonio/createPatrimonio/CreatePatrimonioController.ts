import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { AppError } from "../../../errors/AppError";
import { GetPatrimonioByPlacaUseCase } from "../getPatrimonioByPlaca/GetPatrimonioByPlacaUseCase";
import { CreatePatrimonioUseCase } from "./CreatePatrimonioUseCase";
import { GetUsuarioByIdUseCase } from "../../usuario/getUsuarioById/GetUsuarioByIdUseCase";
import { GetLocByIdUseCase } from "../../localizacao/getLocalizacaoById/GetLocByIdUseCase";
import { GetCategoriaByIdUseCase } from "../../categoria/getCategoriaById/GetCategoriaByIdUseCase";

export class CreatePatrimonioController {
    async handle(req: Request, res: Response, next: NextFunction) {
        const patrimonioSchema = z.object({
            placa: z.string(),
            descricao: z.string(),
            estado: z.enum(['EXECELENTE', 'OTIMO', 'REGULAR', 'RUIM', 'PESSIMO']),
            valor: z.number(),
            origem: z.enum(['PREFEITURA', 'NV']),
            // data_entrada: z.date(),
            resp_entrega: z.string(),
            id_localizacao: z.string(),
            id_categoria: z.string(),
            id_usuario: z.string()
        })

        const patrimonioBody = patrimonioSchema.safeParse(req.body)

        if (!patrimonioBody.success) {
            return next(new AppError('Informações inválidas.'))
        }

        const {
            placa,
            descricao,
            estado,
            valor,
            origem,
            // data_entrada,
            resp_entrega,
            id_localizacao,
            id_categoria,
            id_usuario
        } = patrimonioBody.data

        const getPatrimonioByPlaca = new GetPatrimonioByPlacaUseCase
        const ispatrPlacaExists = await getPatrimonioByPlaca.execute(placa)

        if (ispatrPlacaExists) {
            return next(new AppError('Placa já cadastrada.'))
        }

        const getUsuarioById = new GetUsuarioByIdUseCase
        const usuario = await getUsuarioById.execute(id_usuario)

        if (!usuario) {
            return next(new AppError('Erro com o usuário conectado.'))
        }

        if (usuario.status === 0) {
            return next(new AppError('Usuario desativado.'))

        }

        const getlocalizacaoById = new GetLocByIdUseCase
        const localizacao = await getlocalizacaoById.execute(id_localizacao)

        if (!localizacao) {
            return next(new AppError('Localização inválida.'))
        }

        const getCategoriaById = new GetCategoriaByIdUseCase
        const categoria = await getCategoriaById.execute(id_categoria)

        if (!categoria) {
            return next(new AppError('Categoria Inválida.'))
        }

        const data_entrada = new Date()

        const createPatrimonio = new CreatePatrimonioUseCase
        const patrimonio = await createPatrimonio.execute({
            placa,
            descricao,
            estado,
            valor,
            origem,
            data_entrada,
            resp_entrega,
            id_localizacao,
            id_categoria,
            id_usuario
        })

        if (patrimonio) {
            return res.status(201).json({ success: true, data: patrimonio })
        }

        return res.status(400).json({ success: false })
    }
}