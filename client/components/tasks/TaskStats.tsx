"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task } from '@/lib/auth';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface TaskStatsProps {
  tasks: Task[];
}

export function TaskStats({ tasks }: TaskStatsProps) {
  const todoCount = tasks.filter(task => task.status === 'Todo').length;
  const inProgressCount = tasks.filter(task => task.status === 'In Progress').length;
  const doneCount = tasks.filter(task => task.status === 'Done').length;
  const overdueCount = tasks.filter(task => 
    new Date(task.deadline) < new Date() && task.status !== 'Done'
  ).length;

  const stats = [
    {
      title: 'Todo',
      count: todoCount,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'In Progress',
      count: inProgressCount,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Done',
      count: doneCount,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Overdue',
      count: overdueCount,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.count}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}