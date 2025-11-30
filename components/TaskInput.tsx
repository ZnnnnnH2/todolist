"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createTask } from "@/app/actions/task"
import { useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"

export function TaskInput() {
  const [title, setTitle] = useState("")
  const [priority, setPriority] = useState("Medium")
  const queryClient = useQueryClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    await createTask(title, null, priority)
    setTitle("")
    setPriority("Medium")
    queryClient.invalidateQueries({ queryKey: ["tasks"] })
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <Input
        placeholder="Add a new task..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="flex-1"
      />
      <Select value={priority} onValueChange={setPriority}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Low">Low</SelectItem>
          <SelectItem value="Medium">Medium</SelectItem>
          <SelectItem value="High">High</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit">
        <Plus className="h-4 w-4 mr-2" />
        Add
      </Button>
    </form>
  )
}
