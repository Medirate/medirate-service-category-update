import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const setClause = Object.keys(updateData)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ");

    const query = `
      UPDATE master_data_may_30_cleaned 
      SET ${setClause}
      WHERE id = $1
      RETURNING *
    `;

    const values = [id, ...Object.values(updateData)];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating master data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 