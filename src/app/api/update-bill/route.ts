import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { url, ...fields } = body;
    if (!url || Object.keys(fields).length === 0) {
      return NextResponse.json({ error: "Missing url or fields to update" }, { status: 400 });
    }
    const setClause = Object.keys(fields).map((key, idx) => `${key} = $${idx + 1}`).join(", ");
    const values = Object.values(fields);
    const query = `UPDATE bills_test_by_dev SET ${setClause} WHERE url = $${values.length + 1}`;
    await pool.query(query, [...values, url]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 