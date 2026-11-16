import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
// Vercel rejects request bodies over ~4.5 MB; the browser resizes photos well under this.
const MAX_SIZE = 4 * 1024 * 1024;

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload. Please try again." }, { status: 400 });
  }
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported photo format. Please use JPG, PNG or WEBP." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "This photo is too large. Please choose a smaller one." }, { status: 400 });
  }

  // Vercel Blob when it is connected to the project (fast CDN delivery).
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const ext = file.type.split("/")[1].replace("jpeg", "jpg");
      const blob = await put(`uploads/${crypto.randomUUID()}.${ext}`, file, {
        access: "public",
        contentType: file.type,
      });
      return NextResponse.json({ url: blob.url });
    } catch (err) {
      console.error("Blob upload failed, falling back to database storage", err);
    }
  }

  // Otherwise keep the photo in MongoDB. The serverless filesystem is
  // read-only, which is why uploads used to fail with "Retry" on Vercel.
  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const upload = await db.upload.create({
      data: { data: bytes, contentType: file.type, size: bytes.length },
      select: { id: true },
    });
    return NextResponse.json({ url: `/api/uploads/${upload.id}` });
  } catch (err) {
    console.error("Database upload failed", err);
    return NextResponse.json({ error: "Upload failed, please try again." }, { status: 500 });
  }
}
