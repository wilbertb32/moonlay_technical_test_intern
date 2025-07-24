import { Task } from './auth';
import { getAllUsers } from './auth';

// Backend API URL
const API_URL = "http://localhost:5000";

export const getTasks = (): Task[] => {
  if (typeof window === 'undefined') return [];
  const tasks = localStorage.getItem('tasks');
  return tasks ? JSON.parse(tasks) : [];
};

export const saveTasks = (tasks: Task[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('tasks', JSON.stringify(tasks));
};

export const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & { user_id: string }) => {
  const response = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });
  if (!response.ok) throw new Error("Failed to create task");
  return await response.json();
};

export const updateTask = async (id: string, updates: Partial<Task>) => {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error("Failed to update task");
  return await response.json();
};

export const deleteTask = async (id: string) => {
  try {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete task");
    }
    return await response.json();
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

export const getTaskById = (id: string): Task | null => {
  const tasks = getTasks();
  return tasks.find(task => task.id === id) || null;
};

export const getUsers = () => {
  return getAllUsers();
};