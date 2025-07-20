"use client";

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task } from '@/lib/auth';
import { getUsers } from '@/lib/tasks';
import { format } from 'date-fns';
import { Calendar, Edit, Trash2, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Task['status']) => void;
}

const statusColors = {
  'Todo': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  'In Progress': 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  'Done': 'bg-green-100 text-green-800 hover:bg-green-200',
};

const statusNextState = {
  'Todo': 'In Progress' as const,
  'In Progress': 'Done' as const,
  'Done': 'Todo' as const,
};

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const users = getUsers();
  const assignee = users.find(user => user.id === task.assigneeId);
  const deadlineDate = new Date(task.deadline);
  const isOverdue = deadlineDate < new Date() && task.status !== 'Done';

  const handleStatusClick = () => {
    onStatusChange(task.id, statusNextState[task.status]);
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-none mb-2">{task.title}</h3>
            <Badge 
              className={cn("cursor-pointer transition-colors", statusColors[task.status])}
              onClick={handleStatusClick}
            >
              {task.status}
            </Badge>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(task)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(task.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
          {task.description}
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className={cn(
              isOverdue && "text-destructive font-medium"
            )}>
              {format(deadlineDate, 'MMM dd, yyyy')}
            </span>
            {isOverdue && (
              <Badge variant="destructive" className="text-xs">
                Overdue
              </Badge>
            )}
          </div>
          
          {assignee && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{assignee.name}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}