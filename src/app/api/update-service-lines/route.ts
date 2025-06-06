import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { table, link, url, service_lines_impacted, service_lines_impacted_1, service_lines_impacted_2, service_lines_impacted_3 } = body;
    console.log('Request body:', body);
    if (!table || (table === "provider_alerts" && !link) || (table === "bills_test_by_dev" && !url)) {
      console.error('Missing unique identifier or table', { table, link, url });
      return NextResponse.json({ error: "Missing unique identifier or table" }, { status: 400 });
    }
    let query, params;
    if (table === "provider_alerts") {
      query = `UPDATE provider_alerts SET service_lines_impacted = $1, service_lines_impacted_1 = $2, service_lines_impacted_2 = $3, service_lines_impacted_3 = $4 WHERE link = $5`;
      params = [service_lines_impacted, service_lines_impacted_1, service_lines_impacted_2, service_lines_impacted_3, link];
    } else if (table === "bills_test_by_dev") {
      query = `UPDATE bills_test_by_dev SET service_lines_impacted = $1, service_lines_impacted_1 = $2, service_lines_impacted_2 = $3, service_lines_impacted_3 = $4 WHERE url = $5`;
      params = [service_lines_impacted, service_lines_impacted_1, service_lines_impacted_2, service_lines_impacted_3, url];
    } else {
      console.error('Invalid table name', { table });
      return NextResponse.json({ error: "Invalid table name" }, { status: 400 });
    }
    console.log('Running query:', query);
    console.log('With params:', params);
    await pool.query(query, params);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error updating service lines:", error.message, error.stack);
    } else {
      console.error("Unknown error occurred:", error);
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 