import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import "dotenv/config";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import z from "zod";
import { ref, remove, get } from "firebase/database";
import { database } from "../lib/firebase/clientApp";
import { HttpError } from "../errors/HttpError";

interface DeleteDataBody {
  propriedade_id: string;
}

const bodySchema = z.object({
  propriedade_id: z.string().min(1, "Property ID is required"),
});

export default async function routes(fastify: FastifyInstance) {
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);
  fastify.withTypeProvider<ZodTypeProvider>();

  fastify.post(
    "/delete-propriedade",
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
      request: FastifyRequest<{ Body: DeleteDataBody }>,
      reply: FastifyReply
    ) => {
      try {
        const { propriedade_id } = request.body;

        try {
          const propriedadeRef = ref(
            database,
            `EcoRadarFireBase/propriedades/${propriedade_id}`
          );

          const snapshot = await get(propriedadeRef);
          if (!snapshot.exists()) {
            throw new HttpError("Propriedade não encontrada", 404);
          }

          await remove(propriedadeRef);
        } catch (error) {
          if (error instanceof HttpError) {
            throw error;
          }
          console.error("Erro ao processar a solicitação:", error);
          return reply.status(500).send({
            success: false,
            message: "Erro interno do servidor",
          });
        }

        reply.status(200).send({
          success: true,
          message: "Propriedade removida com sucesso",
          data: { propriedade_id },
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