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

export default async function routes(fastify: FastifyInstance) {
  fastify.get(
    "/get-data",
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!process.env.NASA_API_KEY) {
        return reply.status(500).send("API key is not configured");
      }
      try {
        // const dataAtual = dayjs().tz("America/Sao_Paulo").format("YYYY-MM-DD");
        // const response = await axios.get(
        //   `https://firms.modaps.eosdis.nasa.gov/api/country/csv/${process.env.NASA_API_KEY}/VIIRS_SNPP_NRT/BRA/1/${dataAtual}`
        // );

        // if (response.status !== 200) {
        //   return reply
        //     .status(response.status)
        //     .send("Failed to fetch data from NASA FIRMS");
        // }

        // const responseData = await response.data;

        const csvPath = path.join(process.cwd(), "src", "dados.csv");
        const csvData = fs.readFileSync(csvPath, "utf-8");

        const records = parse(csvData , {
          columns: [
            "latitude",
            "longitude",
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            "frp",
            null,
          ],
          skip_empty_lines: true,
          from_line: 2,
        });

        const recordsWithNumericFrp = records.map((record: any) => ({
          ...record,
          frp: parseFloat(record.frp) || 0,
        }));

        recordsWithNumericFrp.sort((a: any, b: any) => a.frp - b.frp);

        const sortedRecords = recordsWithNumericFrp;

        return reply.status(200).send(sortedRecords);
      } catch (error) {
        console.error("Error fetching data:", error);
        return reply.status(500).send("Error fetching data, check server logs");
      }
    }
  );
}
