import { getTasks } from "@/app/actions/task"
import { NextResponse } from "next/server"

export async function GET() {
  const tasks = await getTasks()
  return NextResponse.json(tasks)
}
