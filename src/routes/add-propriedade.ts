import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import "dotenv/config";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import z from "zod";
import { push, ref, set } from "firebase/database";
import { database } from "../lib/firebase/clientApp";
import { HttpError } from "../errors/HttpError";

interface GetDataBody {
  owner_id: string;
  nome: string;
  latitude: string;
  longitude: string;
  raio: string;
}

const bodySchema = z.object({
  owner_id: z.string().min(1, "Owner ID is required"),
  nome: z.string().min(1, "Name is required"),
  latitude: z.string().min(1, "Latitude is required"),
  longitude: z.string().min(1, "Longitude is required"),
  raio: z.string().min(1, "Radius is required"),
});

function isValidDecimalNumber(str: string): boolean {
  const regex = /^[+-]?(\d+(\.\d*)?|\.\d+)$/;
  return regex.test(str);
}

export default async function routes(fastify: FastifyInstance) {
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);
  fastify.withTypeProvider<ZodTypeProvider>();

  fastify.post(
    "/add-propriedade",
    {
      schema: {
        body: bodySchema,
      },
      preValidation: async (request, reply) => {
        try {
          bodySchema.parse(request.body);
        } catch (error) {
          if (error instanceof z.ZodError) {
            return reply.status(400).send({
              success: false,
              message: "Dados inválidos",
              errors: error.errors.map((err) => ({
                field: err.path.join("."),
                message: err.message,
              })),
            });
          }
          throw error;
        }
      },
    },
    async (
      request: FastifyRequest<{ Body: GetDataBody }>,
      reply: FastifyReply
    ) => {
      try {
        const { owner_id, nome, latitude, longitude, raio } = request.body;

        function validarNumeroDecimalOuErro(valor: string, nomeCampo: string) {
          if (!isValidDecimalNumber(valor)) {
            throw new HttpError(
              `${nomeCampo} deve ser um número válido`,
              400
            );
          }
          const num = parseFloat(valor);
          return num;
        }

        const lat = validarNumeroDecimalOuErro(latitude, "Latitude");
        const long = validarNumeroDecimalOuErro(longitude, "Longitude");
        const r = validarNumeroDecimalOuErro(raio, "Raio");

        if (lat < -90 || lat > 90)
          throw new HttpError(
            "Latitude inválida. Deve estar entre -90 e 90",
            400
          );
        if (long < -180 || long > 180)
          throw new HttpError(
            "Longitude inválida. Deve estar entre -180 e 180",
            400
          );
        if (r <= 0)
          throw new HttpError(
            "Raio inválido. Deve ser um número positivo",
            400
          );

        try {
          const propriedadeRef = ref(database, "EcoRadarFireBase/propriedades");
          const novaPropriedadeRef = push(propriedadeRef);

          await set(novaPropriedadeRef, {
            owner_id: owner_id,
            nome: nome,
            latitude: latitude,
            longitude: longitude,
            raio: raio,
          });
        } catch (error) {
          console.error("Erro ao processar a solicitação:", error);
          return reply.status(500).send({
            success: false,
            message: "Erro interno do servidor",
          });
        }

        reply.status(200).send({
          success: true,
          message: "Propriedade adicionada com sucesso",
          data: { owner_id, nome, latitude, longitude, raio },
        });
      } catch (error) {
        if (error instanceof HttpError) {
          return reply.status(error.statusCode).send({
            success: false,
            message: error.message,
          });
        }
        return reply.status(500).send({
          success: false,
          message: "Erro interno do servidor",
        });
      }
    }
  );
}