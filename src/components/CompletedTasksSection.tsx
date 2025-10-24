import React, { memo } from "react";
import { CheckCircle } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  icon: React.ComponentType<{ className?: string }>;
  cooldown?: number;
}

interface CompletedTasksSectionProps {
  getCompletedTasks: Task[];
  getCooldownTimeLeft: (taskId: string) => number;
}

const CompletedTasksSection: React.FC<CompletedTasksSectionProps> = ({
  getCompletedTasks,
  getCooldownTimeLeft,
}) => {
  if (getCompletedTasks.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <h2 className="text-lg font-bold text-gray-900">Completed Tasks</h2>
      </div>

      {/* Completed Task List */}
      <div className="space-y-2">
        {getCompletedTasks.map((task) => {
          return (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50 border-gray-200 cursor-default"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-200">
                <CheckCircle className="w-5 h-5 text-gray-500" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-gray-500">
                      {task.title}
                    </h3>
                    <p className="text-xs mt-0.5 text-gray-400">
                      {task.cooldown
                        ? `Unlocks Again After ${getCooldownTimeLeft(
                            task.id
                          ).toFixed(1)} Hours`
                        : "Task completed"}
                    </p>
                  </div>

                  {/* Reward */}
                  <div className="ml-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-500">
                      ₹{task.reward}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default memo(CompletedTasksSection);
