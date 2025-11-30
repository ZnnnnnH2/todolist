import { getTasks } from "@/app/actions/task"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const tasks = await getTasks()
  return NextResponse.json(tasks)
}
