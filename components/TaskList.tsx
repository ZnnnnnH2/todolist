"use client"

import { useQuery } from "@tanstack/react-query"
import { TaskItem } from "./TaskItem"
import { buildTaskTree } from "@/lib/utils"
import { Task } from "@prisma/client"
import { Loader2 } from "lucide-react"

export function TaskList() {
  const { data: tasks, isLoading, error } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await fetch("/api/tasks")
      if (!res.ok) throw new Error("Failed to fetch tasks")
      return res.json()
    },
  })

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  if (error) {
    return <div className="text-destructive text-center p-4">Failed to load tasks</div>
  }

  if (!tasks || tasks.length === 0) {
    return <div className="text-center text-muted-foreground p-8">No tasks yet. Add one above!</div>
  }

  const tree = buildTaskTree(tasks)

  return (
    <div className="space-y-1">
      {tree.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  )
}
