import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { database } from "../lib/firebase/clientApp";
import {
  DataSnapshot,
  equalTo,
  get,
  orderByChild,
  query,
  ref,
} from "firebase/database";

export default async function routes(fastify: FastifyInstance) {
  fastify.get(
    "/get-alertas",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { ownerId } = request.query as { ownerId: string };

      if (!ownerId) {
        return reply.status(400).send({ error: "Owner ID is required" });
      }

      try {
        const alertasRef = ref(database, "EcoRadarFireBase/alertas");
        const alertasQuery = query(
          alertasRef,
          orderByChild("owner_id"),
          equalTo(ownerId),
        );

        const snapshot: DataSnapshot = await get(alertasQuery);

        if (!snapshot.exists()) {
          return reply
            .status(404)
            .send({ error: "Propriedade não encontrada" });
        }

        const data: any[] = [];
        snapshot.forEach((childSnapshot) => {
          data.push({
            id: childSnapshot.key,
            ...childSnapshot.val(),
          });
        });

        return reply.send(data);
      } catch (error) {
        console.error("Erro ao buscar dados no Firebase:", error);
        return reply.status(500).send({ error: "Erro ao buscar dados" });
      }
    }
  );
}
