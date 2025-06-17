export default function getPointDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number | string {
  try {
    const toRadians = (degree: number): number => (degree * Math.PI) / 180;
    const R = 6371;

    const φ1 = toRadians(lat1);
    const φ2 = toRadians(lat2);
    const Δφ = toRadians(lat2 - lat1);
    const Δλ = toRadians(lon2 - lon1);

    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

    const c = 2 * Math.asin(Math.sqrt(a));

    return R * c;
  } catch (error) {
    return "Erro ao calcular a distância entre os pontos";
  }
}
