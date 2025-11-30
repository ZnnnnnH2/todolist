"use client"

import { useState } from "react"
import { TaskWithChildren } from "@/lib/types"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronRight, ChevronDown, Plus, Trash2, Calendar } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { updateTaskStatus, deleteTask, createTask } from "@/app/actions/task"
import { useQueryClient } from "@tanstack/react-query"

interface TaskItemProps {
  task: TaskWithChildren
  level?: number
}

export function TaskItem({ task, level = 0 }: TaskItemProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [isAddingSubtask, setIsAddingSubtask] = useState(false)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
  const queryClient = useQueryClient()

  const handleToggle = async (checked: boolean) => {
    await updateTaskStatus(task.id, checked)
    queryClient.invalidateQueries({ queryKey: ["tasks"] })
  }

  const handleDelete = async () => {
    await deleteTask(task.id)
    queryClient.invalidateQueries({ queryKey: ["tasks"] })
  }

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubtaskTitle.trim()) return
    await createTask(newSubtaskTitle, task.id)
    setNewSubtaskTitle("")
    setIsAddingSubtask(false)
    setIsOpen(true)
    queryClient.invalidateQueries({ queryKey: ["tasks"] })
  }

  const getBadgeStyle = (p: string) => {
    switch (p) {
      case "High": return "bg-red-500 hover:bg-red-600 text-white border-transparent"
      case "Medium": return "bg-yellow-500 hover:bg-yellow-600 text-white border-transparent"
      case "Low": return "bg-gray-500 hover:bg-gray-600 text-white border-transparent"
      default: return ""
    }
  }

  return (
    <div className="w-full">
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          "group flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors border border-transparent hover:border-border",
          task.isCompleted && "opacity-60"
        )}
        style={{ marginLeft: `${level * 1.5}rem` }}
      >
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-6 w-6 shrink-0", task.children.length === 0 && "invisible")}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>

        <Checkbox
          checked={task.isCompleted}
          onCheckedChange={handleToggle}
          className="rounded-full"
        />

        <div className="flex-1 flex flex-col">
          <span className={cn("font-medium transition-all", task.isCompleted && "line-through text-muted-foreground")}>
            {task.title}
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
             <Badge variant="outline" className={cn("font-normal px-1.5 py-0", getBadgeStyle(task.priority))}>
                {task.priority}
             </Badge>
             <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }).format(new Date(task.createdAt))}
             </span>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsAddingSubtask(!isAddingSubtask)}>
                <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
      </motion.div>

      <AnimatePresence>
        {isAddingSubtask && (
            <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddSubtask}
                className="pl-12 pr-4 py-2"
                style={{ marginLeft: `${level * 1.5}rem` }}
            >
                <div className="flex gap-2">
                    <Input
                        autoFocus
                        placeholder="Subtask title..."
                        value={newSubtaskTitle}
                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                        className="h-8"
                    />
                    <Button type="submit" size="sm" variant="secondary">Add</Button>
                </div>
            </motion.form>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && task.children.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {task.children.map((child) => (
              <TaskItem key={child.id} task={child} level={level + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
