import { status_pegawai, opd } from "@/db/schema";
import { db } from "@/lib/db";
import { and, eq, getTableColumns, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const forDashboard = searchParams.get("for") === "dashboard";
  const idOpd = searchParams.get("id_opd");
  const year = searchParams.get("year");
  const month = searchParams.get("month");

  // Dashboard query - filter by OPD, year, month
  if (forDashboard && idOpd && year && month) {
    const data = await db
      .select({
        ...getTableColumns(status_pegawai),
        nama_opd: opd.nama,
        tahun: sql<number>`extract(year from periode)`,
        bulan: sql<number>`extract(month from periode)`,
      })
      .from(status_pegawai)
      .leftJoin(opd, eq(status_pegawai.id_opd, opd.id))
      .where(
        and(
          eq(status_pegawai.id_opd, parseInt(idOpd)),
          sql`extract(year from periode) = ${parseInt(year)}`,
          sql`extract(month from periode) = ${parseInt(month)}`
        )
      )
      .orderBy(status_pegawai.id);

    return Response.json(data);
  }

  // Default query - filter by id_opd if provided
  if (idOpd) {
    const data = await db
      .select({
        ...getTableColumns(status_pegawai),
        nama_opd: opd.nama,
        tahun: sql<number>`extract(year from periode)`,
        bulan: sql<number>`extract(month from periode)`,
      })
      .from(status_pegawai)
      .leftJoin(opd, eq(status_pegawai.id_opd, opd.id))
      .where(eq(status_pegawai.id_opd, parseInt(idOpd)))
      .orderBy(status_pegawai.id);

    return Response.json(data);
  }

  // No filter - return all
  const data = await db
    .select({
      ...getTableColumns(status_pegawai),
      nama_opd: opd.nama,
      tahun: sql<number>`extract(year from periode)`,
      bulan: sql<number>`extract(month from periode)`,
    })
    .from(status_pegawai)
    .leftJoin(opd, eq(status_pegawai.id_opd, opd.id))
    .orderBy(status_pegawai.id);

  return Response.json(data);
}

export async function POST(req: Request) {
  try {
    const { id, ...body } = await req.json();

    const data = await db.transaction(async (tx) => {
      const [result] = await tx
        .insert(status_pegawai)
        .values({
          ...body,
          periode: new Date(`${body.tahun}-${body.bulan}-01`),
        })
        .returning();
      return result;
    });

    return Response.json(data);
  } catch (error) {
    return Response.json(
      {
        message: "Gagal menyimpan data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
