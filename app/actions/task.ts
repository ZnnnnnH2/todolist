"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getTasks() {
  return await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
  })
}

export async function createTask(title: string, parentId?: string | null, priority: string = "Medium") {
  if (!title) return

  await prisma.task.create({
    data: {
      title,
      parentId: parentId || null,
      priority,
    },
  })

  revalidatePath("/")
}

export async function updateTaskStatus(id: string, isCompleted: boolean) {
  await prisma.task.update({
    where: { id },
    data: { isCompleted },
  })
  revalidatePath("/")
}

export async function updateTaskDetails(id: string, title: string, priority: string) {
  await prisma.task.update({
    where: { id },
    data: { title, priority },
  })
  revalidatePath("/")
}

export async function deleteTask(id: string) {
  await prisma.task.delete({
    where: { id },
  })
  revalidatePath("/")
}
