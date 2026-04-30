import { NextRequest } from "next/server";

import { createUploadUrl } from "@/lib/storage";
import { toApiError } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.filename) return toApiError("filename is required");
  const upload = await createUploadUrl(body.filename);
  return Response.json(upload);
}
