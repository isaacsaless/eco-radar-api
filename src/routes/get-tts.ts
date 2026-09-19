import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import googleTTS from "google-tts-api";
import { request } from "undici";

interface QueryParams {
  texto: string;
}

export default async function routes(fastify: FastifyInstance) {
  fastify.get(
    "/get-tts",
    async (
      requestFastify: FastifyRequest<{ Querystring: QueryParams }>,
      reply: FastifyReply
    ) => {
      const texto = requestFastify.query.texto?.trim();

      if (!texto) {
        return reply.status(400).send({
          success: false,
          message: "Parâmetro 'texto' é obrigatório",
        });
      }

      try {
        const audioUrls = googleTTS.getAllAudioUrls(texto, {
          lang: "pt-BR",
          slow: false,
          splitPunct: true,
          host: "https://translate.google.com",
        });

        if (audioUrls.length === 0) {
          return reply.status(400).send({
            success: false,
            message: "Não foi possível gerar URLs de áudio",
          });
        }

        const audioBuffers: Buffer[] = [];

        for (const audioUrl of audioUrls) {
          const { body, statusCode } = await request(audioUrl.url, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
          });

          if (statusCode !== 200) {
            throw new Error(`Erro ao buscar o áudio. Código: ${statusCode}`);
          }

          const chunks: Buffer[] = [];
          for await (const chunk of body) {
            chunks.push(chunk);
          }
          audioBuffers.push(Buffer.concat(chunks));
        }

        const mergedAudio = Buffer.concat(audioBuffers);

        reply.header("Content-Type", "audio/mpeg");
        reply.header(
          "Content-Disposition",
          `attachment; filename="tts_${Date.now()}.mp3"`
        );
        reply.header("Content-Length", mergedAudio.length.toString());

        return reply.send(mergedAudio);

      } catch (err) {
        console.error("Erro ao obter áudio:", err);
        const message =
          err instanceof Error ? err.message : "Erro ao obter áudio";
        return reply.status(500).send({
          success: false,
          message,
        });
      }
    }
  );
}