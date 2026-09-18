import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import "dotenv/config";
import axios from "axios";
import { parse } from "csv-parse/sync";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import fs from "fs";
import path from "path";

dayjs.extend(utc);
dayjs.extend(timezone);

const BRASIL_BBOX = "-74,-34,-34,6";
const NRT_MAX_DIAS = 5; // limite da API FIRMS
// Componente Web do App Inventor limita a resposta a ~1MB: mantém o total abaixo disso
const BUDGET_CHARS = 800_000;

interface Foco {
  latitude: string;
  longitude: string;
  frp: number;
}

const tamanhoAprox = (foco: Foco) => foco.latitude.length + foco.longitude.length + 46;

export default async function routes(fastify: FastifyInstance) {
  fastify.get(
    "/get-data",
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!process.env.NASA_API_KEY) {
        return reply.status(500).send("API key is not configured");
      }
      try {
        const csvPath = path.join(process.cwd(), "src", "dados.csv");
        const csvData = fs.readFileSync(csvPath, "utf-8");

        const historico: Foco[] = parse(csvData, {
          columns: true,
          skip_empty_lines: true,
        }).map((record: any) => ({
          latitude: record.latitude,
          longitude: record.longitude,
          frp: parseFloat(record.frp) || 0,
        }));

        // Dados recentes (NRT). Endpoint `country` foi descontinuado na FIRMS v4
        // (usar `area` com bbox) e VIIRS_SNPP_NRT encerra em 01/11/2026
        // (usar VIIRS_NOAA20_NRT). `dias` é relativo a ontem e varia de 1 a 5.
        let recentes: Foco[] = [];
        try {
          const dias = Math.min(
            Math.max(parseInt(String((request.query as any).dias)) || 1, 1),
            NRT_MAX_DIAS
          );
          const dataInicio = dayjs()
            .tz("America/Sao_Paulo")
            .subtract(dias - 1, "day")
            .format("YYYY-MM-DD");
          const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${process.env.NASA_API_KEY}/VIIRS_NOAA20_NRT/${BRASIL_BBOX}/${dias}/${dataInicio}`;
          const response = await axios.get(url, { timeout: 20000 });
          recentes = parse(response.data as string, {
            columns: true,
            skip_empty_lines: true,
          }).map((record: any) => ({
            latitude: record.latitude,
            longitude: record.longitude,
            frp: parseFloat(record.frp) || 0,
          }));
        } catch (error) {
          // Se a FIRMS falhar, mantém só o histórico estático
          console.error("Error fetching NRT data:", error);
        }

        // Amostra os recentes por stride pra caber no limite do App Inventor,
        // mantendo o histórico estático sempre completo.
        const usado = historico.reduce((s, f) => s + tamanhoAprox(f), 0);
        const sobrou = BUDGET_CHARS - usado;
        const passo = Math.max(
          1,
          Math.ceil(
            recentes.reduce((s, f) => s + tamanhoAprox(f), 0) /
              Math.max(sobrou, 1)
          )
        );
        recentes = recentes.filter((_, i) => i % passo === 0);

        const sortedRecords = [...historico, ...recentes].sort(
          (a: Foco, b: Foco) => a.frp - b.frp
        );

        return reply.status(200).send(sortedRecords);
      } catch (error) {
        console.error("Error fetching data:", error);
        return reply.status(500).send("Error fetching data, check server logs");
      }
    }
  );
}
