import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import "dotenv/config";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import z from "zod";
import { HttpError } from "../errors/HttpError";
import { GoogleGenAI } from "@google/genai";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface GetDataBody {
  user_message: string;
}

const bodySchema = z.object({
  user_message: z.string().min(1, "A message is required"),
});

export default async function routes(fastify: FastifyInstance) {
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);
  fastify.withTypeProvider<ZodTypeProvider>();

  fastify.post(
    "/ai-chat-bot",
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
      if (!process.env.GEMINI_API_KEY) {
        return reply.status(500).send("API key is not configured");
      }

      try {
        const { user_message } = request.body;
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: `Você é um assistente virtual do EcoRadar que ajuda o usuário a adicionar propriedades no sistema esclarecendo dúvidas sobre nome localização e uso do mapa além disso responde perguntas sobre queimadas como agir em caso de incêndios e orienta em situações de risco de forma simples e direta. Retorne todas as respostas como texto normal e não como markdown \n
          \n Mensagem fornecida pelo usuário: ${user_message}`,
        });

        reply.status(200).send({
          success: true,
          message: "Resposta do assistente gerada com sucesso",
          response: response.text,
        });
      } catch (error) {
        console.error("Erro ao processar a solicitação:", error);
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
