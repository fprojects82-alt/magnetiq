import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!/^[a-f0-9]{24}$/i.test(params.id)) {
    return new NextResponse("Not found", { status: 404 });
  }
  const upload = await db.upload.findUnique({ where: { id: params.id } });
  if (!upload) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(Buffer.from(upload.data), {
    headers: {
      "Content-Type": upload.contentType,
      "Content-Length": String(upload.size),
      // Uploads never change, so browsers and Vercel's CDN can cache them forever.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
