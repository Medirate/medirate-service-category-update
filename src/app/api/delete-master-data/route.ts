import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { table, id, link, url } = body;
    let query = "";
    let value;
    if (table === "master_data_may_30_cleaned" && id) {
      query = "DELETE FROM master_data_may_30_cleaned WHERE id = $1 RETURNING *";
      value = id;
    } else if (table === "provider_alerts" && link) {
      query = "DELETE FROM provider_alerts WHERE link = $1 RETURNING *";
      value = link;
    } else if ((table === "bills_test_by_dev" || table === "bills" || table === "legislative_updates") && url) {
      // Support for possible table names
      query = `DELETE FROM ${table} WHERE url = $1 RETURNING *`;
      value = url;
    } else {
      return NextResponse.json({ error: "Invalid table or key" }, { status: 400 });
    }
    const result = await pool.query(query, [value]);
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, deleted: result.rows[0] });
  } catch (error) {
    console.error("Error deleting entry:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 