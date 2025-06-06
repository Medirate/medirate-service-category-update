import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { link, ...fields } = body;
    if (!link || Object.keys(fields).length === 0) {
      return NextResponse.json({ error: "Missing link or fields to update" }, { status: 400 });
    }
    const setClause = Object.keys(fields).map((key, idx) => `${key} = $${idx + 1}`).join(", ");
    const values = Object.values(fields);
    const query = `UPDATE provider_alerts SET ${setClause} WHERE link = $${values.length + 1}`;
    await pool.query(query, [...values, link]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 