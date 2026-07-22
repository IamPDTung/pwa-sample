import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

void fs.promises.mkdir(UPLOAD_DIR, { recursive: true });

export async function POST(request: NextRequest) {
  const contentLength = request.headers.get("content-length");
  const contentType = request.headers.get("content-type") ?? "";
  const fileName = request.headers.get("x-file-name") ?? `upload-${Date.now()}`;

  const safeName = path.basename(fileName);
  const destPath = path.join(UPLOAD_DIR, safeName);

  if (!request.body) {
    return NextResponse.json({ error: "No body" }, { status: 400 });
  }

  const fileSize = contentLength ? parseInt(contentLength, 10) : null;

  const writeStream = fs.createWriteStream(destPath);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeStream = Readable.fromWeb(request.body as any);

  try {
    await pipeline(nodeStream, writeStream);
    return NextResponse.json({
      success: true,
      path: destPath,
      size: fileSize,
      contentType,
    });
  } catch {
    void fs.promises.unlink(destPath).catch(() => {});
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
