"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Task } from '@/lib/auth';
import { getUsers, createTask } from '@/lib/tasks';
import { DatePicker } from '@/components/ui/date-picker';

interface TaskFormProps {
  task?: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & { user_id: string }) => void;
}

export function TaskForm({ task, isOpen, onClose, onSubmit }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Task['status']>('Todo');
  const [deadline, setDeadline] = useState<Date>();
  const [assigneeId, setAssigneeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const users = getUsers();

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setDeadline(new Date(task.deadline));
      setAssigneeId(task.assigneeId);
    } else {
      setTitle('');
      setDescription('');
      setStatus('Todo');
      setDeadline(undefined);
      setAssigneeId('');
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!deadline) return;

    // Replace with actual user_id (e.g., from context or props)
    const user_id = "1";
    try {
      // Send deadline as local date string (YYYY-MM-DD) to avoid timezone issues
      const localDateString = deadline.toISOString().slice(0, 10);
      if (task && task.id) {
        // Edit mode: update existing task
        const { updateTask } = await import('@/lib/tasks');
        await updateTask(task.id, {
          title,
          description,
          status,
          deadline: localDateString,
          assigneeId,
        });
      } else {
        // Create mode: create new task
        await createTask({
          title,
          description,
          status,
          deadline: localDateString,
          assigneeId,
          user_id,
        });
      }
      onClose();
    } catch (error) {
      setError('Failed to save task');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !task.id) return;
    setLoading(true);
    setError(null);
    try {
      const { deleteTask } = await import('@/lib/tasks');
      await deleteTask(task.id);
      onClose();
    } catch (error) {
      setError('Failed to delete task');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(value: Task['status']) => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todo">Todo</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Assignee *</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Deadline *</Label>
            <DatePicker
              date={deadline}
              onDateSelect={setDeadline}
              placeholder="Select deadline"
            />
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={!deadline || !assigneeId || loading}>
              {loading ? (task ? 'Updating...' : 'Creating...') : (task ? 'Update' : 'Create')} Task
            </Button>
            {task && task.id && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="flex-1"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}