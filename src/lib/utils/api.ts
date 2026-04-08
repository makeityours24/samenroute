import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/server/services/errors";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function apiErrorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Invalid request data.",
        issues: error.flatten()
      },
      { status: 422 }
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code
      },
      { status: error.statusCode }
    );
  }

  console.error(error);

  return NextResponse.json(
    {
      error: "Something went wrong."
    },
    { status: 500 }
  );
}
