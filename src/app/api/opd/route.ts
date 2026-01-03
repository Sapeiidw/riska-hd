import { opd } from "@/db/schema";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const data = await db.select().from(opd).orderBy(opd.id);
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const data = await db
    .insert(opd)
    .values({
      nama: body.nama,
      singkatan: body.singkatan,
      slug: body.slug,
    })
    .returning();

  return NextResponse.json(data[0]);
}
