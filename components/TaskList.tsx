"use client"

import { useQuery } from "@tanstack/react-query"
import { TaskItem } from "./TaskItem"
import { buildTaskTree } from "@/lib/utils"
import { Task } from "@prisma/client"
import { Loader2, Filter } from "lucide-react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { AnimatePresence, motion } from "framer-motion"

export function TaskList() {
  const [hideCompleted, setHideCompleted] = useState(false)
  const { data: tasks, isLoading, error } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await fetch("/api/tasks")
      if (!res.ok) throw new Error("Failed to fetch tasks")
      return res.json()
    },
  })

  const tree = useMemo(() => {
    if (!tasks) return []
    // Filter first if needed, but for tree structure we usually need all to build hierarchy
    // However, if we want to hide completed parents, we can filter the roots or recursively filter
    // For this requirement, let's build the tree first, then filter the display
    return buildTaskTree(tasks)
  }, [tasks])

  const filteredTree = useMemo(() => {
    if (!hideCompleted) return tree
    
    // Recursive filter function
    const filterNodes = (nodes: any[]): any[] => {
      return nodes
        .filter(node => !node.isCompleted)
        .map(node => ({
          ...node,
          children: filterNodes(node.children)
        }))
    }
    
    return filterNodes(tree)
  }, [tree, hideCompleted])

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  if (error) {
    return <div className="text-destructive text-center p-4">Failed to load tasks</div>
  }

  if (!tasks || tasks.length === 0) {
    return <div className="text-center text-muted-foreground p-8">No tasks yet. Add one above!</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          variant={hideCompleted ? "secondary" : "ghost"} 
          size="sm" 
          onClick={() => setHideCompleted(!hideCompleted)}
          className="gap-2 text-xs"
        >
          <Filter className="h-3.5 w-3.5" />
          {hideCompleted ? "Show Completed" : "Hide Completed"}
        </Button>
      </div>

      <div className="space-y-1">
        <AnimatePresence mode="popLayout">
          {filteredTree.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <TaskItem task={task} />
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredTree.length === 0 && hideCompleted && (
          <div className="text-center text-muted-foreground py-8 text-sm">
            All active tasks completed! 🎉
          </div>
        )}
      </div>
    </div>
  )
}
