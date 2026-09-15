import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "AI Resume Builder is disabled. Use the on-page Resume Builder to create and download PDF or Word.",
    },
    { status: 400 }
  );
}

export async function GET() {
  return NextResponse.json(
    {
      message:
        "AI Resume Builder is disabled. Use the Resume Builder page UI only.",
    },
    { status: 200 }
  );
}