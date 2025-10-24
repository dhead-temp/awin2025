import React, { memo } from "react";
import { Share2, CheckCircle } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  icon: React.ComponentType<{ className?: string }>;
  cooldown?: number;
}

interface TodosSectionProps {
  getPendingTasks: Task[];
  getPendingSharingTasks: Task[];
  isTaskCompleted: (taskId: string) => boolean;
  isTaskOnCooldown: (taskId: string) => boolean;
  getCooldownTimeLeft: (taskId: string) => number;
  openTaskModal: (taskId: string) => void;
}

const TodosSection: React.FC<TodosSectionProps> = ({
  getPendingTasks,
  getPendingSharingTasks,
  isTaskCompleted,
  isTaskOnCooldown,
  getCooldownTimeLeft,
  openTaskModal,
}) => {
  return (
    <>
      {/* Earning Tasks */}
      <div className=" mb-4">
        {/* Task List */}
        <div className="space-y-2">
          {getPendingTasks.map((task) => {
            const isCompleted = isTaskCompleted(task.id);
            const isOnCooldown = isTaskOnCooldown(task.id);
            const cooldownTimeLeft = getCooldownTimeLeft(task.id);
            const IconComponent = task.icon;

            return (
              <div
                key={task.id}
                onClick={() =>
                  !isCompleted && !isOnCooldown && openTaskModal(task.id)
                }
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  isCompleted
                    ? "bg-gray-50 border-gray-200 cursor-default opacity-60"
                    : isOnCooldown
                    ? "bg-yellow-50 border-yellow-200 cursor-default"
                    : task.id === "comet_browser"
                    ? "bg-gradient-to-r from-orange-50 to-red-50 border-orange-300 hover:border-orange-400 hover:shadow-xl cursor-pointer active:scale-98"
                    : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer active:scale-98"
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isCompleted
                      ? "bg-gray-200"
                      : isOnCooldown
                      ? "bg-yellow-100"
                      : task.id === "comet_browser"
                      ? "bg-orange-100"
                      : "bg-blue-100"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className={`w-5 h-5 text-gray-500`} />
                  ) : (
                    <IconComponent
                      className={`w-5 h-5 ${
                        isOnCooldown
                          ? "text-yellow-600"
                          : task.id === "comet_browser"
                          ? "text-orange-600"
                          : "text-blue-600"
                      }`}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-semibold text-sm ${
                          isCompleted ? "text-gray-500" : "text-gray-900"
                        }`}
                      >
                        {task.title}
                      </h3>
                      <p
                        className={`text-xs mt-0.5 ${
                          isCompleted
                            ? "text-gray-400"
                            : isOnCooldown
                            ? "text-yellow-600"
                            : "text-gray-600"
                        }`}
                      >
                        {isCompleted && task.cooldown
                          ? `Unlocks Again After ${getCooldownTimeLeft(
                              task.id
                            ).toFixed(1)} Hours`
                          : isOnCooldown
                          ? `Cooldown: ${cooldownTimeLeft.toFixed(
                              1
                            )}h remaining`
                          : task.description}
                      </p>
                    </div>

                    {/* Reward */}
                    <div className="ml-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isCompleted
                            ? "bg-gray-200 text-gray-500"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
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

      {/* Sharing Tasks Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-4 px-2 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Share2 className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">Sharing Tasks</h2>
        </div>

        {/* Sharing Task List */}
        <div className="space-y-2">
          {getPendingSharingTasks.map((task) => {
            const isCompleted = isTaskCompleted(task.id);
            const isOnCooldown = isTaskOnCooldown(task.id);
            const cooldownTimeLeft = getCooldownTimeLeft(task.id);
            const IconComponent = task.icon;

            return (
              <div
                key={task.id}
                onClick={() =>
                  !isCompleted && !isOnCooldown && openTaskModal(task.id)
                }
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  isCompleted
                    ? "bg-gray-50 border-gray-200 cursor-default opacity-60"
                    : isOnCooldown
                    ? "bg-yellow-50 border-yellow-200 cursor-default"
                    : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer active:scale-98"
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isCompleted
                      ? "bg-gray-200"
                      : isOnCooldown
                      ? "bg-yellow-100"
                      : task.id === "comet_browser"
                      ? "bg-orange-100"
                      : "bg-blue-100"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className={`w-5 h-5 text-gray-500`} />
                  ) : (
                    <IconComponent
                      className={`w-5 h-5 ${
                        isOnCooldown
                          ? "text-yellow-600"
                          : task.id === "comet_browser"
                          ? "text-orange-600"
                          : "text-blue-600"
                      }`}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-semibold text-sm ${
                          isCompleted ? "text-gray-500" : "text-gray-900"
                        }`}
                      >
                        {task.title}
                      </h3>
                      <p
                        className={`text-xs mt-0.5 ${
                          isCompleted
                            ? "text-gray-400"
                            : isOnCooldown
                            ? "text-yellow-600"
                            : "text-gray-600"
                        }`}
                      >
                        {isCompleted && task.cooldown
                          ? `Unlocks Again After ${getCooldownTimeLeft(
                              task.id
                            ).toFixed(1)} Hours`
                          : isOnCooldown
                          ? `Cooldown: ${cooldownTimeLeft.toFixed(
                              1
                            )}h remaining`
                          : task.description}
                      </p>
                    </div>

                    {/* Reward */}
                    <div className="ml-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isCompleted
                            ? "bg-gray-200 text-gray-500"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
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
    </>
  );
};

export default memo(TodosSection);
