import React, { useState, useCallback } from "react";
import { X, CheckCircle, Smartphone, Camera, ExternalLink } from "lucide-react";
import { apiService, User as ApiUser, Transaction } from "../services/api";
import { EXTERNAL_SERVICES } from "./constants";
import WarningMessage from "./ui/WarningMessage";
import SubmitButtons from "./ui/SubmitButtons";

interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  steps: string[];
  icon: React.ComponentType<{ className?: string }>;
}

interface TaskModalProps {
  isOpen: boolean;
  isAnimating: boolean;
  selectedTask: string | null;
  currentUser: ApiUser | null;
  tasks: Task[];
  onClose: () => void;
  onTaskComplete: (user: ApiUser, transactions: Transaction[]) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  isAnimating,
  selectedTask,
  currentUser,
  tasks,
  onClose,
  onTaskComplete,
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [taskAnswers, setTaskAnswers] = useState<{[key: string]: string}>({});

  const getCurrentTask = useCallback(() => {
    return tasks.find(task => task.id === selectedTask);
  }, [tasks, selectedTask]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  }, []);

  const submitTaskProof = useCallback(async () => {
    if (!currentUser?.id || !selectedTask || !uploadedFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('task_id', selectedTask);
      formData.append('user_id', currentUser.id.toString());

      const response = await apiService.submitTaskProof(formData);
      
      if (response.status === "success") {
        setUploadSuccess(true);
        // Fetch updated user data
        const updatedUserResponse = await apiService.getUser(currentUser.id);
        if (updatedUserResponse.status === "success" && updatedUserResponse.data) {
          onTaskComplete(updatedUserResponse.data.user, updatedUserResponse.data.transactions);
        }
      }
    } catch (error) {
      console.error("Failed to submit task proof:", error);
      alert("Failed to submit proof. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }, [currentUser, selectedTask, uploadedFile, onTaskComplete]);

  const handlePWAInstall = useCallback(async () => {
    try {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as any).standalone === true) {
        alert("AWIN is already installed as a PWA!");
        return;
      }

      if (window.deferredPrompt) {
        window.deferredPrompt.prompt();
        const { outcome } = await window.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
          window.deferredPrompt = null;
        } else {
          console.log('User dismissed the install prompt');
        }
      } else {
        alert("To install this PWA:\n\nOn Mobile: Tap the share button and select 'Add to Home Screen'\nOn Desktop: Look for the install icon in your browser address bar");
      }
    } catch (error) {
      console.error('Error during PWA installation:', error);
      alert("Installation failed. Please try using your browser's menu to install this app.");
    }
  }, []);

  const handlePWAComplete = useCallback(async () => {
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      if (currentUser?.id) {
        try {
          const response = await apiService.updateUser(currentUser.id, {
            installed_pwa: 1,
          });
          
          if (response.status === "success") {
            setUploadSuccess(true);
            const updatedUserResponse = await apiService.getUser(currentUser.id);
            if (updatedUserResponse.status === "success" && updatedUserResponse.data) {
              onTaskComplete(updatedUserResponse.data.user, updatedUserResponse.data.transactions);
            }
          }
        } catch (error) {
          console.error("Failed to update PWA status:", error);
        }
      }
    } else {
      alert("Please add this app to your home screen first. Look for the 'Add to Home Screen' option in your browser menu.");
    }
  }, [currentUser, onTaskComplete]);

  if (!isOpen || !selectedTask) return null;

  const currentTask = getCurrentTask();
  if (!currentTask) return null;

  return (
    <div className={`fixed inset-0 bg-black/60 flex items-end justify-center z-[70] p-0 backdrop-blur-sm transition-all duration-300 ${
      isAnimating ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className={`bg-white rounded-t-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl transition-all duration-300 ease-out ${
        isAnimating 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-full opacity-0'
      }`}>
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                {React.createElement(currentTask.icon, { className: "w-5 h-5 text-white" })}
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {currentTask.title}
                </h3>
                <p className="text-white/90 text-sm">
                  Earn ₹{currentTask.reward}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-5 max-h-[70vh] overflow-y-auto">
          {uploadSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Reward Added!
              </h3>
              <p className="text-gray-600 mb-4">
                ₹{currentTask.reward} credited to your account. Your proof will be reviewed on withdrawal.
              </p>
              <button
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Task Steps - Only show for tasks that don't have specific implementations */}
              {!["share_to_group", "share_to_story", "share_to_ig", "share_to_fb", "install_pwa", "comet_browser", "adstera_signup", "monetag_signup"].includes(selectedTask) && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-900 mb-3">Task Steps:</h4>
                  <ol className="space-y-2">
                    {currentTask.steps.map((step: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                        <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold text-blue-700 flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* PWA Installation Task */}
              {selectedTask === "install_pwa" && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Smartphone className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-green-900">PWA Installation</h4>
                    </div>
                    <p className="text-sm text-green-800 mb-3">
                      Install AWIN as a PWA (Progressive Web App) on your device to earn ₹{currentTask.reward}.
                    </p>
                    
                    <button
                      onClick={handlePWAInstall}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Smartphone className="w-4 h-4" />
                      Install AWIN App
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Have you installed AWIN as a PWA?
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setTaskAnswers({...taskAnswers, installed: "yes"})}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            taskAnswers.installed === "yes" 
                              ? "bg-green-600 text-white" 
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          Yes, I Have Done the Steps
                        </button>
                        <button
                          onClick={() => setTaskAnswers({...taskAnswers, installed: "no"})}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            taskAnswers.installed === "no" 
                              ? "bg-red-600 text-white" 
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          Not Yet
                        </button>
                      </div>
                    </div>

                    {taskAnswers.installed === "no" && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <h5 className="font-semibold text-blue-900 mb-2">How to Install AWIN PWA:</h5>
                        <div className="space-y-2 text-sm text-blue-800">
                          <p><strong>On Mobile:</strong></p>
                          <ol className="list-decimal list-inside space-y-1 ml-2">
                            <li>Tap the share button in your browser</li>
                            <li>Select "Add to Home Screen"</li>
                            <li>Tap "Add" to confirm</li>
                          </ol>
                          <p className="mt-2"><strong>On Desktop:</strong></p>
                          <ol className="list-decimal list-inside space-y-1 ml-2">
                            <li>Look for the install icon in your browser address bar</li>
                            <li>Click "Install" when prompted</li>
                            <li>Follow the installation prompts</li>
                          </ol>
                        </div>
                      </div>
                    )}

                    {taskAnswers.installed === "yes" && (
                      <button
                        onClick={handlePWAComplete}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        Complete PWA Installation Task
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* External Service Tasks */}
              {["comet_browser", "adstera_signup", "monetag_signup"].includes(selectedTask) && (
                <div className="space-y-4">
                  {(() => {
                    const serviceKey = selectedTask.replace('_signup', '').replace('_browser', '');
                    const service = EXTERNAL_SERVICES[serviceKey as keyof typeof EXTERNAL_SERVICES];
                    
                    return (
                      <div className="space-y-4">
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                          <h4 className="font-semibold text-orange-900 mb-2">
                            {service.name} Signup
                          </h4>
                          <p className="text-sm text-orange-800 mb-3">
                            {service.description}. Visit the website and sign up for an account.
                          </p>
                          <a
                            href={service.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Visit {service.name}
                          </a>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Upload Screenshot of Your {service.name} Account
                          </label>
                          {!uploadedFile && (
                            <div className="relative">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="service-screenshot"
                              />
                              <label
                                htmlFor="service-screenshot"
                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-colors"
                              >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <Camera className="w-8 h-8 mb-2 text-blue-400" />
                                  <p className="mb-2 text-sm text-gray-500">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                  </p>
                                  <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 10MB)</p>
                                </div>
                              </label>
                            </div>
                          )}

                          {uploadedFile && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="text-sm font-medium text-green-800">
                                  File selected: {uploadedFile.name}
                                </span>
                              </div>
                              <button
                                onClick={() => setUploadedFile(null)}
                                className="text-sm text-green-600 hover:text-green-700 underline"
                              >
                                Remove file
                              </button>
                            </div>
                          )}
                        </div>

                        <WarningMessage />
                        <SubmitButtons 
                          onCancel={onClose}
                          onSubmit={submitTaskProof}
                          isUploading={isUploading}
                          hasFile={!!uploadedFile}
                        />
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Social Media Share Tasks */}
              {["share_to_group", "share_to_story", "share_to_ig", "share_to_fb"].includes(selectedTask) && (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <h4 className="font-semibold text-amber-900 mb-2">
                      Share Your Referral Link
                    </h4>
                    <p className="text-sm text-amber-800 mb-3">
                      Share your referral link on {selectedTask.replace('share_to_', '').toUpperCase()} and upload a screenshot as proof.
                    </p>
                    <div className="bg-white border border-amber-300 rounded-lg p-3 mb-3">
                      <p className="text-sm font-mono text-gray-800 break-all">
                        {currentUser?.id ? `${window.location.origin}?by=${currentUser.id}` : `${window.location.origin}?by=new`}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Upload Screenshot of Your {selectedTask.replace('share_to_', '').toUpperCase()} Post
                    </label>
                    {!uploadedFile && (
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="social-screenshot"
                        />
                        <label
                          htmlFor="social-screenshot"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-colors"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Camera className="w-8 h-8 mb-2 text-blue-400" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 10MB)</p>
                          </div>
                        </label>
                      </div>
                    )}

                    {uploadedFile && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium text-green-800">
                            File selected: {uploadedFile.name}
                          </span>
                        </div>
                        <button
                          onClick={() => setUploadedFile(null)}
                          className="text-sm text-green-600 hover:text-green-700 underline"
                        >
                          Remove file
                        </button>
                      </div>
                    )}
                  </div>

                  <WarningMessage />
                  <SubmitButtons 
                    onCancel={onClose}
                    onSubmit={submitTaskProof}
                    isUploading={isUploading}
                    hasFile={!!uploadedFile}
                  />
                </div>
              )}

              {/* Default file upload for other tasks */}
              {!["install_pwa", "comet_browser", "adstera_signup", "monetag_signup", "share_to_group", "share_to_story", "share_to_ig", "share_to_fb"].includes(selectedTask) && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Upload Screenshot as Proof
                    </label>
                    {!uploadedFile && (
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="task-screenshot"
                        />
                        <label
                          htmlFor="task-screenshot"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-colors"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Camera className="w-8 h-8 mb-2 text-blue-400" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 10MB)</p>
                          </div>
                        </label>
                      </div>
                    )}

                    {uploadedFile && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium text-green-800">
                            File selected: {uploadedFile.name}
                          </span>
                        </div>
                        <button
                          onClick={() => setUploadedFile(null)}
                          className="text-sm text-green-600 hover:text-green-700 underline"
                        >
                          Remove file
                        </button>
                      </div>
                    )}
                  </div>

                  <WarningMessage />
                  <SubmitButtons 
                    onCancel={onClose}
                    onSubmit={submitTaskProof}
                    isUploading={isUploading}
                    hasFile={!!uploadedFile}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
