"use client";

import { useState, useEffect } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { Header } from '@/components/layout/Header';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskForm } from '@/components/tasks/TaskForm';
import { TaskStats } from '@/components/tasks/TaskStats';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { Button } from '@/components/ui/button';
import { Task } from '@/lib/auth';
import { isAuthenticated } from '@/lib/auth';
import { getTasks, createTask, updateTask, deleteTask } from '@/lib/tasks';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [message, setMessage] = useState("Loading...");
  

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/hello")
      .then(response => response.json())
      .then(data => {
        setMessage(data.message);
        console.log(data.message);
      });
  }, []);

  //  useEffect(() => {
  //   fetch("http://127.0.0.1:5000/")
  //     .then((res) => res.json())
  //     .then((data) => setTasks(data));
  // }, []);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
    if (isAuthenticated()) {
      loadTasks();
    }
  }, []);

  const loadTasks = () => {
    setTasks(getTasks());
  };

  const handleLogin = () => {
    setAuthenticated(true);
    setShowSignup(false);
    loadTasks();
  };

  const handleSignup = () => {
    setAuthenticated(true);
    setShowSignup(false);
    loadTasks();
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setTasks([]);
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setIsTaskFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  const handleTaskSubmit = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      createTask(taskData);
    }
    loadTasks();
    setIsTaskFormOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (id: string) => {
    setDeletingTaskId(id);
  };

  const confirmDeleteTask = () => {
    if (deletingTaskId) {
      deleteTask(deletingTaskId);
      loadTasks();
      setDeletingTaskId(null);
    }
  };

  const handleStatusChange = (id: string, status: Task['status']) => {
    updateTask(id, { status });
    loadTasks();
  };

  const handleClearFilters = () => {
    setStatusFilter('all');
    setAssigneeFilter('all');
    setSearchQuery('');
  };

  // Filter tasks based on current filters
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesAssignee = assigneeFilter === 'all' || task.assigneeId === assigneeFilter;
    const matchesSearch = searchQuery === '' || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesAssignee && matchesSearch;
  });

  if (!authenticated) {
    if (showSignup) {
      return (
        <SignupForm 
          onSignup={handleSignup} 
          onSwitchToLogin={() => setShowSignup(false)} 
        />
      );
    }
    return (
      <LoginForm 
        onLogin={handleLogin} 
        onSwitchToSignup={() => setShowSignup(true)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogout={handleLogout} onCreateTask={handleCreateTask} />

      <main className="container mx-auto px-4 py-8">
        <div>{message}</div>
        <br /><br />
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Manage your tasks efficiently</p>
        </div>

        {/* <h1>Tasks</h1>
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>{task.title}</li>
          ))}
        </ul> */}

        <TaskStats tasks={tasks} />

        <TaskFilters
          statusFilter={statusFilter}
          assigneeFilter={assigneeFilter}
          searchQuery={searchQuery}
          onStatusFilterChange={setStatusFilter}
          onAssigneeFilterChange={setAssigneeFilter}
          onSearchQueryChange={setSearchQuery}
          onClearFilters={handleClearFilters}
        />

        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="h-64 w-64 mx-auto mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-gray-400 text-6xl">📋</div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {tasks.length === 0 ? 'No tasks yet' : 'No tasks match your filters'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {tasks.length === 0 
                  ? 'Get started by creating your first task'
                  : 'Try adjusting your filters or search query'
                }
              </p>
              {tasks.length === 0 ? (
                <Button onClick={handleCreateTask}>Create Your First Task</Button>
              ) : (
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </main>

      <TaskForm
        task={editingTask}
        isOpen={isTaskFormOpen}
        onClose={() => {
          setIsTaskFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleTaskSubmit}
      />

      <AlertDialog open={deletingTaskId !== null} onOpenChange={() => setDeletingTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTask}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}