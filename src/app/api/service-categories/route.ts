import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const { rows } = await pool.query("SELECT categories FROM service_category_list");
    return NextResponse.json(rows);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching service categories:", error.message, error.stack);
    } else {
      console.error("Unknown error occurred:", error);
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { category } = await req.json();
    if (!category) return NextResponse.json({ error: 'Missing category' }, { status: 400 });
    await pool.query("INSERT INTO service_category_list (categories) VALUES ($1)", [category]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { oldCategory, newCategory } = await req.json();
    if (!oldCategory || !newCategory) return NextResponse.json({ error: 'Missing category' }, { status: 400 });
    await pool.query("UPDATE service_category_list SET categories = $1 WHERE categories = $2", [newCategory, oldCategory]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { category } = await req.json();
    if (!category) return NextResponse.json({ error: 'Missing category' }, { status: 400 });
    await pool.query("DELETE FROM service_category_list WHERE categories = $1", [category]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 