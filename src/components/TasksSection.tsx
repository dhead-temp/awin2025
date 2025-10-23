import React from "react";
import { Trophy, CheckCircle, Clock } from "lucide-react";
import { User as ApiUser } from "../services/api";

interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  steps: string[];
  icon: React.ComponentType<{ className?: string }>;
  cooldown?: number;
}

interface TasksSectionProps {
  currentUser: ApiUser | null;
  taskCategories: Record<string, Task[]>;
  isTaskCompleted: (taskId: string) => boolean;
  isTaskOnCooldown: (taskId: string) => boolean;
  getCooldownTimeLeft: (taskId: string) => number;
  onOpenTaskModal: (taskId: string) => void;
}

const TasksSection: React.FC<TasksSectionProps> = ({
  currentUser,
  taskCategories,
  isTaskCompleted,
  isTaskOnCooldown,
  getCooldownTimeLeft,
  onOpenTaskModal,
}) => {
  return (
    <>
      {/* Task Categories */}
      {Object.entries(taskCategories).map(([categoryName, tasks]) => {
        const completedCount = tasks.filter(task => isTaskCompleted(task.id)).length;
        
        return (
          <div key={categoryName} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-4">
            {/* Category Header */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900">
                {categoryName}
              </h2>
              <div className="text-xs text-gray-500">
                {completedCount}/{tasks.length}
              </div>
            </div>
            
            {/* Task Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {tasks.map((task) => {
                const isCompleted = isTaskCompleted(task.id);
                const isOnCooldown = isTaskOnCooldown(task.id);
                const cooldownTimeLeft = getCooldownTimeLeft(task.id);
                const IconComponent = task.icon;
                
                return (
                  <div
                    key={task.id}
                    className={`relative p-3 rounded-lg border transition-all ${
                      isCompleted
                        ? "bg-gray-100 border-gray-300"
                        : isOnCooldown
                        ? "bg-yellow-50 border-yellow-200"
                        : "bg-gray-50 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {/* Row 1: Icon, Title, Description */}
                    <div className="flex items-center gap-3 mb-3">
                      {/* Icon */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isCompleted ? "bg-gray-200" : isOnCooldown ? "bg-yellow-100" : "bg-gray-100"
                      }`}>
                        <IconComponent className={`w-4 h-4 ${
                          isCompleted ? "text-gray-500" : isOnCooldown ? "text-yellow-600" : "text-gray-600"
                        }`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-sm mb-1 ${
                          isCompleted ? "text-gray-500" : "text-gray-900"
                        }`}>
                          {task.title}
                        </h3>
                        <p className={`text-xs line-clamp-2 ${
                          isCompleted ? "text-gray-400" : "text-gray-600"
                        }`}>
                          {task.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Row 2: Earn Amount - Full Width */}
                    <div className="w-full">
                      {isCompleted ? (
                        <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 text-gray-500">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Done</span>
                          </div>
                          {task.cooldown && (
                            <div className="text-xs text-white bg-blue-600 px-3 py-1.5 rounded-full font-medium shadow-sm">
                              Unlock Again after {task.cooldown}h
                            </div>
                          )}
                        </div>
                      ) : isOnCooldown ? (
                        <div className="flex items-center justify-center gap-2 py-2 px-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <Clock className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-semibold text-yellow-700">Cooldown: {cooldownTimeLeft.toFixed(1)}h</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => onOpenTaskModal(task.id)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Trophy className="w-4 h-4" />
                          <span>Earn ₹{task.reward}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default TasksSection;
