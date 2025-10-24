import React, { useMemo, useState, useEffect, useCallback, memo } from "react";

// Extend Window interface for PWA install prompt
declare global {
  interface Window {
    deferredPrompt?: any;
  }
}
import {
  Wallet,
  Users,
  Share2,
  TrendingUp,
  Copy,
  Trophy,
  CreditCard,
  AlertCircle,
  Lock,
  CheckCircle,
  Activity,
  History,
  User,
  X,
  Link,
  Play,
  Camera,
  Globe,
  Smartphone,
  ExternalLink,
} from "lucide-react";
import {
  apiService,
  DOMAIN,
  User as ApiUser,
  Transaction,
} from "../services/api";
import StatsCard from "./StatsCard";
import { Page } from "../App";
import {
  trackAccountView,
  trackShare,
  trackWithdrawalRequest,
  trackUniqueAccountUpdateOpened,
  trackUniqueAccountShare,
  trackUniqueViewedTransactionHistory,
  trackUniqueAccountInviteLinkCopied,
  trackUniqueAccountWithdrawClick,
  trackUniqueAccountDownloadClick,
  trackUniqueAccountCodeEntered,
  trackUniqueAccountCodeVerifyClick,
  trackUniqueAccountCodeVerified,
  trackUniqueAccountWithdrawSuccess,
} from "../utils/analytics";

// External Services Configuration
const EXTERNAL_SERVICES = {
  comet: {
    name: "Comet Browser",
    url: "https://be6.in/comet",
    description: "AI-powered browser with assistant",
    steps: [
      "Install Comet Browser on your device",
      "Sign up for an account",
      "Start at least 2 chats with the AI assistant",
    ],
    whatsappMessage: "Check out Comet Browser: https://be6.in/comet",
  },
  adstera: {
    name: "Signup Link 1",
    url: "https://be6.in/mov44-adstera-oct-24",
    description: "Advertising platform",
    steps: [
      "Visit this website",
      "Sign up for an account",
      "Browse Website for 3 Minutes",
    ],
  },
  monetag: {
    name: "Signup Link 2",
    url: "https://be6.in/mov68_monetag",
    description: "Monetization platform",
    steps: [
      "Visit this website",
      "Sign up for an account",
      "Browse Website for 3 Minutes",
    ],
  },
};

// Optimized reusable components
const WarningMessage = memo(() => (
  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
    <div className="flex items-start gap-2">
      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
      <div className="text-sm text-red-800">
        <p className="font-semibold mb-1">Important Warning:</p>
        <p>
          Wrong or fake screenshots can result in account blocking and loss of
          all earnings. Please ensure your screenshots are genuine and clearly
          show the required action.
        </p>
      </div>
    </div>
  </div>
));

const SubmitButtons = memo(
  ({
    onCancel,
    onSubmit,
    isUploading,
    hasFile,
  }: {
    onCancel: () => void;
    onSubmit: () => void;
    isUploading: boolean;
    hasFile: boolean;
  }) => (
    <div className="flex gap-3 pt-4">
      <button
        onClick={onCancel}
        className="flex-1 py-3 px-4 rounded-xl font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
      >
        Cancel
      </button>
      <button
        onClick={onSubmit}
        disabled={!hasFile || isUploading}
        className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
          !hasFile || isUploading
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
        }`}
      >
        {isUploading ? "Submitting..." : "Submit Proof"}
      </button>
    </div>
  )
);

interface AccountPageProps {
  userStats: {
    totalEarnings: number;
    referrals: number;
    linkClicks: number;
    shares: number;
  };
  onNavigate: (page: Page) => void;
}

const AccountPage: React.FC<AccountPageProps> = ({ userStats, onNavigate }) => {
  const [hasTerabox, setHasTerabox] = useState(false);
  const [showTeraboxModal, setShowTeraboxModal] = useState(false);
  const [teraboxVerifyStatus, setTeraboxVerifyStatus] = useState<
    "idle" | "success" | "failed"
  >("idle");
  const [showPinInput, setShowPinInput] = useState(false);
  const [pinValue, setPinValue] = useState("");
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showShareBanner, setShowShareBanner] = useState(false);
  const [isClaimingReward, setIsClaimingReward] = useState(false);
  const [unclaimedShares, setUnclaimedShares] = useState(0);
  const [showEmailPhoneModal, setShowEmailPhoneModal] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [upi, setUpi] = useState<string | null>(null);
  const [isUpdatingContact, setIsUpdatingContact] = useState(false);
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);
  const [showWithdrawConfirmation, setShowWithdrawConfirmation] =
    useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Task modal states
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [isModalAnimating, setIsModalAnimating] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [taskAnswers, setTaskAnswers] = useState<{ [key: string]: string }>({});

  // Real user data from API
  const [currentUser, setCurrentUser] = useState<ApiUser | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuizRewardClaimed, setIsQuizRewardClaimed] = useState(false);
  const [isCheckingQuizStatus, setIsCheckingQuizStatus] = useState(true);

  const [txFilter] = useState<
    "all" | "credit" | "debit" | "completed" | "pending" | "failed"
  >("all");

  // Task definitions with earnings from database triggers
  interface Task {
    id: string;
    title: string;
    description: string;
    reward: number;
    icon: any;
    color: string;
    requiresProof: boolean;
    steps: string[];
    cooldown?: number;
    autoDetect?: boolean;
  }

  const taskCategories: { [key: string]: Task[] } = {
    "Daily Doubles": [
      {
        id: "share_to_group",
        title: "Share to WhatsApp Group",
        description: "Share your referral link to a WhatsApp group",
        reward: 100,
        icon: Share2,
        color: "green",
        requiresProof: true,
        cooldown: 8, // 8 hours
        steps: ["Share your referral link to a WhatsApp group"],
      },
      {
        id: "share_to_story",
        title: "Share to WhatsApp Status",
        description: "Share your referral link to your WhatsApp status",
        reward: 100,
        icon: Camera,
        color: "purple",
        requiresProof: true,
        cooldown: 8, // 8 hours
        steps: ["Share your referral link to your WhatsApp status"],
      },
      {
        id: "share_to_ig",
        title: "Share to Instagram Story",
        description: "Share your referral link to your Instagram story",
        reward: 100,
        icon: Camera,
        color: "pink",
        requiresProof: true,
        cooldown: 8, // 8 hours
        steps: ["Share your referral link to your Instagram story"],
      },
      {
        id: "share_to_fb",
        title: "Share to Facebook",
        description: "Share your referral link to Facebook",
        reward: 100,
        icon: Share2,
        color: "blue",
        requiresProof: true,
        cooldown: 8, // 8 hours
        steps: ["Share your referral link to Facebook"],
      },
    ],
    "One Time Tasks": [
      {
        id: "install_pwa",
        title: "Install PWA App",
        description: "Install this app as a Progressive Web App",
        reward: 200,
        icon: Smartphone,
        color: "blue",
        requiresProof: false,
        autoDetect: true,
        steps: [
          "Add this app to your home screen",
          "The app will automatically detect installation",
        ],
      },
      {
        id: "comet_browser",
        title: `Try ${EXTERNAL_SERVICES.comet.name}`,
        description: EXTERNAL_SERVICES.comet.description,
        reward: 600,
        icon: Globe,
        color: "indigo",
        requiresProof: true,
        steps: EXTERNAL_SERVICES.comet.steps,
      },
    ],
    "Signup Tasks": [
      {
        id: "adstera_signup",
        title: "Signup Task 1",
        description: `Sign up on ${EXTERNAL_SERVICES.adstera.name} website`,
        reward: 50,
        icon: ExternalLink,
        color: "orange",
        requiresProof: true,
        cooldown: 8, // 8 hours
        steps: EXTERNAL_SERVICES.adstera.steps,
      },
      {
        id: "monetag_signup",
        title: "Signup Task 2",
        description: `Sign up on ${EXTERNAL_SERVICES.monetag.name} website`,
        reward: 50,
        icon: ExternalLink,
        color: "teal",
        requiresProof: true,
        cooldown: 8, // 8 hours
        steps: EXTERNAL_SERVICES.monetag.steps,
      },
    ],
  };

  // Fetch user data on component mount
  // Note: Global API request cache prevents duplicate calls across components
  useEffect(() => {
    const fetchUserData = async () => {
      console.log("AccountPage: fetchUserData called");

      try {
        // Get current user from localStorage
        const savedUser = localStorage.getItem("currentUser");
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          if (userData.id) {
            const response = await apiService.getUser(parseInt(userData.id));
            if (response.status === "success" && response.data) {
              setCurrentUser(response.data.user);
              setTransactions(response.data.transactions);
              // Check if quiz reward has been claimed from database
              setIsQuizRewardClaimed(
                response.data.user.is_quiz_reward_claimed === "1" ||
                  response.data.user.is_quiz_reward_claimed === "true"
              );
              setIsCheckingQuizStatus(false);
            }
          } else {
            setIsCheckingQuizStatus(false);
          }
        } else {
          setIsCheckingQuizStatus(false);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setIsCheckingQuizStatus(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Track account page view
  useEffect(() => {
    trackAccountView();
  }, []);

  // Check localStorage for Terabox verification status
  useEffect(() => {
    const teraboxVerified = localStorage.getItem("teraboxVerified");
    if (teraboxVerified === "true") {
      setHasTerabox(true);
    }
  }, []);

  // PWA Installation Detection and Event Handling
  useEffect(() => {
    const handlePWAInstall = () => {
      // Check if app is running in standalone mode (PWA)
      if (
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true
      ) {
        console.log("PWA installation detected");
        // Auto-complete PWA installation task if not already done
        if (currentUser && currentUser.installed_pwa !== 1) {
          // This will be handled by the task completion logic
        }
      }
    };

    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      window.deferredPrompt = e;
      console.log("PWA install prompt is available");
    };

    const handleAppInstalled = () => {
      console.log("PWA was installed");
      // Clear the deferredPrompt
      window.deferredPrompt = null;
      // Check if PWA is now installed
      handlePWAInstall();
    };

    // Check on mount
    handlePWAInstall();

    // Listen for PWA installation events
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [currentUser]);

  // User profile data
  const userProfile = {
    name: currentUser?.name || `user${currentUser?.id || "new"}`,
    memberSince: currentUser?.created_on
      ? new Date(currentUser.created_on).toLocaleDateString()
      : "",
    kycVerified: false,
    upiVerified: false,
    avatarBg: "bg-gradient-to-br from-blue-500 to-blue-600",
  };

  const referralLink = currentUser?.id
    ? `${DOMAIN}?by=${currentUser.id}`
    : `${DOMAIN}?by=new`;
  const currentBalance =
    typeof currentUser?.balance === "string"
      ? parseFloat(currentUser.balance)
      : currentUser?.balance || 0;
  const canWithdraw = currentBalance >= 100 && hasTerabox && currentUser?.upi;

  const copyReferralLink = async () => {
    // Track unique invite link copied
    trackUniqueAccountInviteLinkCopied();

    try {
      await navigator.clipboard.writeText(referralLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy: ", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = referralLink;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackErr) {
        console.error("Fallback copy failed: ", fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const generateWhatsAppLink = () => {
    const message = encodeURIComponent(`Ye dekhna ${referralLink}`);
    return `https://wa.me/?text=${message}`;
  };

  const claimShareReward = async () => {
    if (!currentUser?.id || unclaimedShares <= 0) return;

    setIsClaimingReward(true);
    try {
      // Calculate new values - ensure they are numbers
      const currentShares = parseInt(String(currentUser.shares || 0), 10);
      const newShares = currentShares + unclaimedShares;

      // Make API call to update user shares with all unclaimed shares
      // Backend trigger will automatically create transaction:
      // - ₹2 per share (from after_user_shares_update trigger)
      const response = await apiService.updateUser(currentUser.id, {
        shares: newShares,
      });

      if (response.status === "success") {
        // Fetch updated user data to get the new balance calculated by backend
        const updatedUserResponse = await apiService.getUser(currentUser.id);

        if (
          updatedUserResponse.status === "success" &&
          updatedUserResponse.data
        ) {
          // Update local state with fresh data from backend
          setCurrentUser(updatedUserResponse.data.user);
          setTransactions(updatedUserResponse.data.transactions);

          // Hide banner and reset unclaimed shares after claiming
          setShowShareBanner(false);
          setUnclaimedShares(0);
        }
      } else {
        console.error("Failed to claim reward:", response.message);
        // You could show a toast notification here
      }
    } catch (error) {
      console.error("Failed to claim reward:", error);
      // You could show a toast notification here
    } finally {
      setIsClaimingReward(false);
    }
  };

  const handleUpdateContact = async () => {
    if (
      !currentUser?.id ||
      (email === null && phone === null && name === null && upi === null)
    )
      return;

    setIsUpdatingContact(true);
    try {
      const updateData: any = {};
      if (email !== null) updateData.email = email;
      if (phone !== null) updateData.phone = phone;
      if (name !== null) updateData.name = name;
      if (upi !== null) updateData.upi = upi;

      const response = await apiService.updateUser(currentUser.id, updateData);

      if (response.status === "success") {
        // Fetch updated user data
        const updatedUserResponse = await apiService.getUser(currentUser.id);

        if (
          updatedUserResponse.status === "success" &&
          updatedUserResponse.data
        ) {
          setCurrentUser(updatedUserResponse.data.user);
          setShowEmailPhoneModal(false);
          setEmail(null);
          setPhone(null);
          setName(null);
          setUpi(null);
        }
      } else {
        console.error("Failed to update contact:", response.message);
        // You could show a toast notification here
      }
    } catch (error) {
      console.error("Failed to update contact:", error);
      // You could show a toast notification here
    } finally {
      setIsUpdatingContact(false);
    }
  };

  const handleWithdrawal = () => {
    if (!currentUser?.id || !canWithdraw) return;
    // Track unique withdraw click
    trackUniqueAccountWithdrawClick();
    setShowWithdrawConfirmation(true);
  };

  const handleDownloadTerabox = () => {
    // Track unique download click
    trackUniqueAccountDownloadClick();
    setShowPinInput(true);
  };

  const handlePinVerification = async () => {
    // Track unique code entered
    trackUniqueAccountCodeEntered();

    if (pinValue !== "3245") {
      setTeraboxVerifyStatus("failed");
      return;
    }

    // Track unique code verify click
    trackUniqueAccountCodeVerifyClick();

    setIsVerifyingPin(true);
    try {
      // Update is_terabox_done to 1 in database
      const response = await apiService.updateUser(currentUser!.id, {
        is_terabox_done: true,
      });

      if (response.status === "success") {
        // Track unique code verified
        trackUniqueAccountCodeVerified();
        setTeraboxVerifyStatus("success");
        setHasTerabox(true);
        setShowPinInput(false);
        setPinValue("");

        // Save progress in localStorage
        localStorage.setItem("teraboxVerified", "true");

        // Fetch updated user data
        const updatedUserResponse = await apiService.getUser(currentUser!.id);
        if (
          updatedUserResponse.status === "success" &&
          updatedUserResponse.data
        ) {
          setCurrentUser(updatedUserResponse.data.user);
        }
      } else {
        setTeraboxVerifyStatus("failed");
      }
    } catch (error) {
      console.error("Failed to verify Terabox:", error);
      setTeraboxVerifyStatus("failed");
    } finally {
      setIsVerifyingPin(false);
    }
  };

  const confirmWithdrawal = async () => {
    if (!currentUser?.id || !canWithdraw) return;

    setIsProcessingWithdrawal(true);
    setShowWithdrawConfirmation(false);

    try {
      const response = await apiService.createWithdrawalRequest(
        currentUser.id,
        currentBalance
      );

      if (response.status === "success") {
        // Track withdrawal request
        trackWithdrawalRequest(currentBalance);

        // Fetch updated user data to get the new transaction
        const updatedUserResponse = await apiService.getUser(currentUser.id);

        if (
          updatedUserResponse.status === "success" &&
          updatedUserResponse.data
        ) {
          setCurrentUser(updatedUserResponse.data.user);
          setTransactions(updatedUserResponse.data.transactions);
          // Track unique withdrawal success
          trackUniqueAccountWithdrawSuccess();
          setWithdrawalSuccess(true);
          setShowTeraboxModal(false);
        }
      } else {
        console.error("Failed to process withdrawal:", response.message);
        // You could show a toast notification here
      }
    } catch (error) {
      console.error("Failed to process withdrawal:", error);
      // You could show a toast notification here
    } finally {
      setIsProcessingWithdrawal(false);
    }
  };

  const filteredTx = useMemo(() => {
    switch (txFilter) {
      case "credit":
        return transactions.filter((t) => t.type === "credit");
      case "debit":
        return transactions.filter((t) => t.type === "debit");
      default:
        return transactions;
    }
  }, [txFilter, transactions]);

  // Check if email/phone is linked
  const isContactLinked = currentUser?.email || currentUser?.phone;

  // Task management functions
  const openTaskModal = useCallback((taskId: string) => {
    setSelectedTask(taskId);
    setUploadedFile(null);
    setUploadSuccess(false);
    setTaskAnswers({});
    setShowTaskModal(true);
    // Small delay to ensure modal is rendered before animation starts
    setTimeout(() => setIsModalAnimating(true), 10);
  }, []);

  const closeTaskModal = useCallback(() => {
    setIsModalAnimating(false);
    // Wait for animation to complete before hiding modal
    setTimeout(() => {
      setShowTaskModal(false);
      setSelectedTask(null);
      setUploadedFile(null);
      setUploadSuccess(false);
      setTaskAnswers({});
    }, 300);
  }, []);

  // Optimized task lookup using useMemo
  const taskLookupMap = useMemo(() => {
    const map = new Map();
    Object.values(taskCategories).forEach((category) => {
      category.forEach((task) => {
        map.set(task.id, task);
      });
    });
    return map;
  }, []);

  const getCurrentTask = useCallback(() => {
    return selectedTask ? taskLookupMap.get(selectedTask) || null : null;
  }, [selectedTask, taskLookupMap]);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setUploadedFile(file);
      }
    },
    []
  );

  const handleRemoveFile = useCallback(() => {
    console.log("Removing file...");
    setUploadedFile(null);
    // Clear the file input - try to find the visible one first
    const modal = document.querySelector(".fixed.inset-0");
    if (modal) {
      const fileInput = modal.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
        console.log("Cleared file input in modal");
      }
    }
    // Fallback: clear all file inputs
    const fileInputs = document.querySelectorAll(
      'input[type="file"]'
    ) as NodeListOf<HTMLInputElement>;
    fileInputs.forEach((input) => {
      input.value = "";
    });
    console.log("File removed and inputs cleared");
  }, []);

  // Optimized task update mapping
  const taskUpdateMap = useMemo(() => {
    const now = new Date().toISOString();
    return {
      share_to_group: { last_share_to_group: now },
      share_to_story: { last_share_to_story: now },
      share_to_ig: { last_share_to_ig: now },
      share_to_fb: { last_share_to_fb: now },
      install_pwa: { installed_pwa: 1 },
      comet_browser: { is_comet_browser: 1 },
      adstera_signup: { last_adstera_time: now },
      monetag_signup: { last_monetag_time: now },
    } as Record<string, any>;
  }, []);

  const submitTaskProof = useCallback(async () => {
    if (!currentUser?.id || !selectedTask || !uploadedFile) return;

    setIsUploading(true);
    try {
      // Simulate file upload - in real implementation, upload to server
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Optimized task update using mapping
      const updateData = taskUpdateMap[selectedTask] || {};

      const response = await apiService.updateUser(currentUser.id, updateData);

      if (response.status === "success") {
        setUploadSuccess(true);
        // Fetch updated user data
        const updatedUserResponse = await apiService.getUser(currentUser.id);
        if (
          updatedUserResponse.status === "success" &&
          updatedUserResponse.data
        ) {
          setCurrentUser(updatedUserResponse.data.user);
          setTransactions(updatedUserResponse.data.transactions);
        }
      }
    } catch (error) {
      console.error("Failed to submit task proof:", error);
    } finally {
      setIsUploading(false);
    }
  }, [currentUser, selectedTask, uploadedFile, taskUpdateMap]);

  // Optimized task completion mapping
  const taskCompletionMap = useMemo(() => {
    if (!currentUser) return {} as Record<string, boolean>;
    return {
      share_to_group: !!currentUser.last_share_to_group,
      share_to_story: !!currentUser.last_share_to_story,
      share_to_ig: !!currentUser.last_share_to_ig,
      share_to_fb: !!currentUser.last_share_to_fb,
      install_pwa: String(currentUser.installed_pwa) === "1",
      comet_browser: String(currentUser.is_comet_browser) === "1",
      adstera_signup: !!currentUser.last_adstera_time,
      monetag_signup: !!currentUser.last_monetag_time,
    } as Record<string, boolean>;
  }, [currentUser]);

  const isTaskCompleted = useCallback(
    (taskId: string) => {
      return taskCompletionMap[taskId] || false;
    },
    [taskCompletionMap]
  );

  const isTaskOnCooldown = (taskId: string) => {
    if (!currentUser) return false;

    // Get task from all categories
    let task: Task | null = null;
    for (const category of Object.values(taskCategories)) {
      const foundTask = category.find((t) => t.id === taskId);
      if (foundTask) {
        task = foundTask;
        break;
      }
    }

    if (!task?.cooldown) return false;

    // Map task IDs to their corresponding database field names
    const fieldMap: Record<string, string> = {
      share_to_group: "last_share_to_group",
      share_to_story: "last_share_to_story",
      share_to_ig: "last_share_to_ig",
      share_to_fb: "last_share_to_fb",
      adstera_signup: "last_adstera_time",
      monetag_signup: "last_monetag_time",
    };

    const fieldName = fieldMap[taskId];
    if (!fieldName) return false;

    const lastTime = currentUser[
      fieldName as keyof typeof currentUser
    ] as string;
    if (!lastTime) return false;

    const lastTimeDate = new Date(lastTime);
    const now = new Date();
    const hoursDiff =
      (now.getTime() - lastTimeDate.getTime()) / (1000 * 60 * 60);

    return hoursDiff < task.cooldown;
  };

  const getCooldownTimeLeft = (taskId: string) => {
    if (!currentUser) return 0;

    // Get task from all categories
    let task: Task | null = null;
    for (const category of Object.values(taskCategories)) {
      const foundTask = category.find((t) => t.id === taskId);
      if (foundTask) {
        task = foundTask;
        break;
      }
    }

    if (!task?.cooldown) return 0;

    // Map task IDs to their corresponding database field names
    const fieldMap: Record<string, string> = {
      share_to_group: "last_share_to_group",
      share_to_story: "last_share_to_story",
      share_to_ig: "last_share_to_ig",
      share_to_fb: "last_share_to_fb",
      adstera_signup: "last_adstera_time",
      monetag_signup: "last_monetag_time",
    };

    const fieldName = fieldMap[taskId];
    if (!fieldName) return 0;

    const lastTime = currentUser[
      fieldName as keyof typeof currentUser
    ] as string;
    if (!lastTime) return 0;

    const lastTimeDate = new Date(lastTime);
    const now = new Date();
    const hoursDiff =
      (now.getTime() - lastTimeDate.getTime()) / (1000 * 60 * 60);

    return Math.max(0, task.cooldown - hoursDiff);
  };

  // Get all tasks from all categories (excluding sharing tasks)
  const getAllTasks = useMemo(() => {
    const allTasks: Task[] = [];
    Object.values(taskCategories).forEach((category) => {
      allTasks.push(...category);
    });
    // Exclude sharing tasks from main tasks list
    return allTasks.filter(
      (task) =>
        ![
          "share_to_group",
          "share_to_story",
          "share_to_ig",
          "share_to_fb",
        ].includes(task.id)
    );
  }, []);

  // Get main tasks (show completed signup tasks in faded style, hide completed Comet Browser and PWA tasks)
  const getPendingTasks = useMemo(() => {
    return getAllTasks
      .filter((task) => {
        // Hide completed Comet Browser and PWA tasks completely
        if (
          isTaskCompleted(task.id) &&
          ["comet_browser", "install_pwa"].includes(task.id)
        ) {
          return false;
        }
        // Show all other tasks (pending and completed signup tasks)
        return true;
      })
      .sort((a, b) => {
        // Sort by completion status first (pending first), then by reward
        const aCompleted = isTaskCompleted(a.id);
        const bCompleted = isTaskCompleted(b.id);
        if (aCompleted !== bCompleted) {
          return aCompleted ? 1 : -1;
        }
        return b.reward - a.reward;
      });
  }, [getAllTasks, isTaskCompleted]);

  // Get all tasks (including sharing tasks) for sharing section
  const getAllTasksIncludingSharing = useMemo(() => {
    const allTasks: Task[] = [];
    Object.values(taskCategories).forEach((category) => {
      allTasks.push(...category);
    });
    return allTasks;
  }, []);

  // Get sharing tasks (both pending and completed, but completed ones will be faded)
  const getPendingSharingTasks = useMemo(() => {
    return getAllTasksIncludingSharing
      .filter((task) =>
        [
          "share_to_group",
          "share_to_story",
          "share_to_ig",
          "share_to_fb",
        ].includes(task.id)
      )
      .sort((a, b) => {
        // Sort by completion status first (pending first), then by reward
        const aCompleted = isTaskCompleted(a.id);
        const bCompleted = isTaskCompleted(b.id);
        if (aCompleted !== bCompleted) {
          return aCompleted ? 1 : -1;
        }
        return b.reward - a.reward;
      });
  }, [getAllTasksIncludingSharing, isTaskCompleted]);

  // Get completed tasks (excluding sharing tasks and PWA tasks that should be hidden when completed)
  const getCompletedTasks = useMemo(() => {
    return getAllTasks
      .filter((task) => {
        // Only show completed tasks that are not sharing tasks and not PWA tasks that should be hidden
        return (
          isTaskCompleted(task.id) &&
          !["install_pwa"].includes(task.id)
        );
      })
      .sort((a, b) => b.reward - a.reward);
  }, [getAllTasks, isTaskCompleted]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 pb-0">
      {/* Loading State - Show while checking quiz status */}
      {isCheckingQuizStatus ? (
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-4 sm:mb-6 border border-gray-100">
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading...</span>
            </div>
          </div>
        </div>
      ) : !isQuizRewardClaimed ? (
        /* Locked State - Show if user hasn't claimed quiz reward */
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-4 sm:mb-6 border border-gray-100 relative overflow-hidden">
            {/* Blurred background content */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100 opacity-90 blur-sm">
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                        My Account
                      </h2>
                      <p className="text-gray-600 text-sm">
                        Track your earnings and referrals
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl p-3 sm:p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div className="text-lg sm:text-xl font-bold">
                      ₹{userStats.totalEarnings}
                    </div>
                    <div className="text-xs sm:text-sm opacity-90">
                      Total Earnings
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-400 to-green-500 rounded-xl p-3 sm:p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="text-lg sm:text-xl font-bold">
                      {userStats.referrals}
                    </div>
                    <div className="text-xs sm:text-sm opacity-90">
                      Referrals
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl p-3 sm:p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div className="text-lg sm:text-xl font-bold">
                      {userStats.linkClicks}
                    </div>
                    <div className="text-xs sm:text-sm opacity-90">Clicks</div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-400 to-purple-500 rounded-xl p-3 sm:p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <Share2 className="h-5 w-5" />
                    </div>
                    <div className="text-lg sm:text-xl font-bold">
                      {userStats.shares}
                    </div>
                    <div className="text-xs sm:text-sm opacity-90">Shares</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lock overlay */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center py-8 sm:py-12">
              <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <Lock className="h-10 w-10 text-white" />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                Account Locked
              </h3>

              <p className="text-gray-600 text-sm sm:text-base mb-6 max-w-md leading-relaxed">
                Complete the quiz first to unlock your account and start earning
                money!
              </p>

              <button
                onClick={() => onNavigate("quiz")}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Play className="h-5 w-5" />
                <span>Play Quiz Now</span>
              </button>

              <p className="text-gray-500 text-xs mt-4">
                Win ₹453 instantly after completing the quiz!
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
          {/* Header - Profile */}
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 mb-4 sm:mb-6 border border-gray-100">
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              {/* User Info */}
              <div className="flex items-center gap-3 sm:gap-4">
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${userProfile.avatarBg} flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-md`}
                >
                  {userProfile.name ? (
                    userProfile.name
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")
                  ) : (
                    <User className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate">
                    {userProfile.name || "Your Account"}
                  </h1>
                  <div className="flex items-center gap-2 mt-1"></div>
                </div>
              </div>

              {/* Link Email/Phone Link */}
              <button
                onClick={() => {
                  trackUniqueAccountUpdateOpened();
                  setShowEmailPhoneModal(true);
                }}
                className={`inline-flex items-center gap-1 sm:gap-2 font-medium text-xs sm:text-sm transition-colors px-2 py-1.5 rounded-lg ${
                  isContactLinked
                    ? "text-gray-500 hover:text-gray-600 hover:bg-gray-50"
                    : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                }`}
              >
                {isContactLinked ? (
                  <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : (
                  <Link className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
                <span className="hidden sm:inline">
                  {isContactLinked ? "Update Account Info" : "Link Email/Phone"}
                </span>
                <span className="sm:hidden">
                  {isContactLinked ? "Update" : "Link"}
                </span>
              </button>
            </div>
          </div>

          {/* Balance Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-2xl p-4 sm:p-6 mb-4 sm:mb-6 text-white">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
                <h2 className="text-base sm:text-lg font-semibold">
                  Total Balance
                </h2>
              </div>
              <button
                onClick={() => {
                  trackUniqueViewedTransactionHistory();
                  setShowHistoryModal(true);
                }}
                className="text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm inline-flex items-center gap-1 sm:gap-2 transition-all"
              >
                <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">History</span>
              </button>
            </div>

            <div className="mb-4 sm:mb-6">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2">
                ₹
                {typeof currentUser?.balance === "string"
                  ? parseFloat(currentUser.balance).toFixed(2)
                  : (currentUser?.balance || 0).toFixed(2)}
              </div>
              <div className="text-white/80 text-xs sm:text-sm">
                Available to withdraw
              </div>
            </div>

            <button
              onClick={() => setShowTeraboxModal(true)}
              className="w-full bg-white text-blue-600 hover:bg-gray-50 py-3 sm:py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base transition-all flex items-center justify-center shadow-lg hover:shadow-xl min-h-[48px]"
            >
              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Withdraw Now
            </button>
            <div className="text-center text-white/70 text-xs mt-2 sm:mt-3">
              Withdraw to Bank Account Using UPI ID
            </div>
          </div>

          {/* Share Reward Banner */}
          {showShareBanner && (
            <div className="bg-white border-2 border-dashed border-orange-300 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Share Rewards
                    </h3>
                    <p className="text-sm text-gray-600">
                      {unclaimedShares} shares • ₹{unclaimedShares * 2}
                    </p>
                  </div>
                </div>
                <button
                  onClick={claimShareReward}
                  disabled={isClaimingReward}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isClaimingReward
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-orange-500 hover:bg-orange-600 text-white"
                  }`}
                >
                  {isClaimingReward ? "Claiming..." : "Claim"}
                </button>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <StatsCard
              title="Shares"
              value={currentUser?.shares || 0}
              subtitle="Earn ₹2 on Every Share"
              subtitleValue={`Earned ₹${(currentUser?.shares || 0) * 2}`}
              actionButton={
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      window.open(generateWhatsAppLink(), "_blank");
                      trackShare("whatsapp");
                      trackUniqueAccountShare();
                      setShowShareBanner(true);
                      setUnclaimedShares((prev) => prev + 1);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Share2 className="h-3 w-3" />
                    Share Now
                  </button>
                  <button
                    onClick={copyReferralLink}
                    className={`py-2 px-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
                      copySuccess
                        ? "bg-green-100 text-green-600 scale-110"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-700 hover:scale-105"
                    }`}
                    title={copySuccess ? "Copied!" : "Copy referral link"}
                  >
                    {copySuccess ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
              }
              icon={Share2}
              color="blue"
            />
            <StatsCard
              title="Clicks"
              value={currentUser?.clicks || 0}
              subtitle="Earn ₹10 per click"
              subtitleValue={`Earned ₹${(currentUser?.clicks || 0) * 10}`}
              description="Every time someone clicks your link, you earn ₹10."
              icon={Activity}
              color="green"
            />
            <StatsCard
              title="Referrals"
              value={currentUser?.invited_to || 0}
              subtitle="Earn ₹300 per referral"
              subtitleValue={`Earned ₹${(currentUser?.invited_to || 0) * 300}`}
              description="Everytime someone you refer completes the quiz, you earn ₹300."
              icon={Users}
              color="purple"
            />
          </div>

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

          {/* Transaction History */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                <h2 className="text-sm sm:text-base font-bold text-gray-900">
                  Recent Transactions
                </h2>
              </div>
              <button
                onClick={() => {
                  trackUniqueViewedTransactionHistory();
                  setShowHistoryModal(true);
                }}
                className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium px-2 py-1 rounded-lg hover:bg-blue-50 transition-all"
              >
                View All
              </button>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {isLoading ? (
                <div className="text-center text-xs sm:text-sm text-gray-500 py-6 sm:py-8">
                  Loading transactions...
                </div>
              ) : filteredTx.length === 0 ? (
                <div className="text-center text-xs sm:text-sm text-gray-500 py-6 sm:py-8">
                  No transactions yet
                </div>
              ) : (
                filteredTx.slice(0, 5).map((tx) => {
                  const isCredit = tx.type === "credit";
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${
                          isCredit ? "bg-emerald-100" : "bg-red-100"
                        }`}
                      >
                        {isCredit ? (
                          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                        ) : (
                          <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                            {tx.note || "Transaction"}
                          </div>
                          <div
                            className={`text-xs sm:text-sm font-bold whitespace-nowrap ${
                              isCredit ? "text-emerald-700" : "text-red-700"
                            }`}
                          >
                            {isCredit ? "+" : "-"}₹
                            {typeof tx.amount === "string"
                              ? parseFloat(tx.amount).toFixed(2)
                              : tx.amount}
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <div className="text-xs text-gray-500">
                            {new Date(tx.created_on).toLocaleDateString()}
                          </div>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              tx.note === "Withdrawal Request"
                                ? "bg-yellow-50 text-yellow-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {tx.note === "Withdrawal Request"
                              ? "In Process"
                              : "Completed"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Withdraw Modal */}
          {showTeraboxModal && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-3 sm:p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      Withdraw Earnings
                    </h3>
                    <button
                      onClick={() => {
                        setShowTeraboxModal(false);
                        setTeraboxVerifyStatus("idle");
                        setShowPinInput(false);
                        setPinValue("");
                      }}
                      className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                    >
                      <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white">
                    ₹
                    {typeof currentUser?.balance === "string"
                      ? parseFloat(currentUser.balance).toFixed(2)
                      : (currentUser?.balance || 0).toFixed(2)}
                  </div>
                </div>

                <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                  {!hasTerabox && (
                    <>
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5" />
                          <div className="text-xs sm:text-sm text-blue-800">
                            To withdraw, download the verification file and
                            verify using 4 digit code found in the file. This
                            helps us confirm you are a real user.
                          </div>
                        </div>
                      </div>

                      {!showPinInput ? (
                        <div className="space-y-2 sm:space-y-3">
                          <a
                            href="https://be6.in/tera-dwnld-awin"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={handleDownloadTerabox}
                            className="w-full block text-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-semibold shadow-md transition-all min-h-[48px] flex items-center justify-center"
                          >
                            Download Verification File
                          </a>
                        </div>
                      ) : (
                        <div className="space-y-3 sm:space-y-4">
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4">
                            <div className="flex items-start gap-2 sm:gap-3">
                              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5" />
                              <div className="text-xs sm:text-sm text-amber-800">
                                Please enter the 4-digit verification code found
                                in the file downloaded using Terabox App.
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 sm:space-y-3">
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                Verification Code
                              </label>
                              <input
                                type="text"
                                value={pinValue}
                                onChange={(e) => {
                                  const value = e.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, 4);
                                  setPinValue(value);
                                }}
                                placeholder="Enter 4-digit code"
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base text-center text-lg font-mono tracking-widest"
                                maxLength={4}
                              />
                            </div>

                            <div className="flex gap-2 sm:gap-3">
                              <button
                                onClick={() => {
                                  setShowPinInput(false);
                                  setPinValue("");
                                  setTeraboxVerifyStatus("idle");
                                }}
                                className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all text-sm sm:text-base min-h-[44px]"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handlePinVerification}
                                disabled={
                                  isVerifyingPin || pinValue.length !== 4
                                }
                                className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-semibold transition-all text-sm sm:text-base min-h-[44px] ${
                                  isVerifyingPin || pinValue.length !== 4
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg"
                                }`}
                              >
                                {isVerifyingPin ? "Verifying..." : "Verify"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {teraboxVerifyStatus === "success" && (
                        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                          <span className="text-xs sm:text-sm font-medium">
                            Terabox verified successfully!
                          </span>
                        </div>
                      )}
                      {teraboxVerifyStatus === "failed" && (
                        <div className="bg-red-50 border border-red-300 text-red-800 rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                          <span className="text-xs sm:text-sm font-medium">
                            Verification failed. Please check the code in
                            verification file and try again.
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {hasTerabox && !currentUser?.upi && (
                    <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 sm:p-4">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5" />
                        <div>
                          <div className="text-amber-900 font-semibold mb-1 text-xs sm:text-sm">
                            UPI ID Required
                          </div>
                          <div className="text-xs sm:text-sm text-amber-800">
                            Please add your UPI ID in account settings to enable
                            withdrawals.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {hasTerabox && currentUser?.upi && !canWithdraw && (
                    <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 sm:p-4">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5" />
                        <div>
                          <div className="text-amber-900 font-semibold mb-1 text-xs sm:text-sm">
                            Insufficient Balance
                          </div>
                          <div className="text-xs sm:text-sm text-amber-800">
                            Minimum ₹100 required. You need ₹
                            {(
                              100 -
                              (typeof currentUser?.balance === "string"
                                ? parseFloat(currentUser.balance)
                                : currentUser?.balance || 0)
                            ).toFixed(2)}{" "}
                            more.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {hasTerabox && canWithdraw && (
                    <div className="space-y-3 sm:space-y-4">
                      <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 sm:p-4">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 mt-0.5" />
                          <div className="text-xs sm:text-sm text-emerald-800">
                            You are eligible to withdraw your earnings. Payouts
                            are processed within 24 hours.
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleWithdrawal}
                        disabled={isProcessingWithdrawal}
                        className={`w-full py-3 sm:py-3.5 px-4 rounded-xl font-bold shadow-md transition-all min-h-[48px] ${
                          isProcessingWithdrawal
                            ? "bg-gray-400 text-white cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:shadow-lg"
                        }`}
                      >
                        {isProcessingWithdrawal
                          ? "Processing..."
                          : "Confirm Withdrawal"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Withdraw Confirmation Modal */}
          {showWithdrawConfirmation && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-3 sm:p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      Confirm Withdrawal
                    </h3>
                    <button
                      onClick={() => setShowWithdrawConfirmation(false)}
                      className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                    >
                      <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white">
                    ₹
                    {typeof currentUser?.balance === "string"
                      ? parseFloat(currentUser.balance).toFixed(2)
                      : (currentUser?.balance || 0).toFixed(2)}
                  </div>
                </div>

                <div className="p-4 sm:p-5 space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5" />
                      <div className="text-xs sm:text-sm text-blue-800">
                        <div className="font-semibold mb-1">
                          Please confirm your withdrawal details:
                        </div>
                        <ul className="space-y-1 text-xs">
                          <li>
                            • Amount: ₹
                            {typeof currentUser?.balance === "string"
                              ? parseFloat(currentUser.balance).toFixed(2)
                              : (currentUser?.balance || 0).toFixed(2)}
                          </li>
                          <li>
                            • UPI ID: {currentUser?.upi || "Not provided"}
                          </li>
                          <li>• Processing time: Within 24 hours</li>
                          <li>• Payment date: 5th day of upcoming month</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 sm:p-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5" />
                      <div className="text-xs sm:text-sm text-amber-800">
                        <div className="font-semibold mb-1">Important:</div>
                        <p>
                          Once confirmed, this withdrawal cannot be cancelled.
                          Please ensure all details are correct.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 sm:gap-3 pt-2">
                    <button
                      onClick={() => setShowWithdrawConfirmation(false)}
                      className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all text-sm sm:text-base min-h-[44px]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmWithdrawal}
                      className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all text-sm sm:text-base min-h-[44px]"
                    >
                      Confirm Withdrawal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Withdrawal Success Message */}
          {withdrawalSuccess && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 sm:p-5 mb-4 sm:mb-6 shadow-sm">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">
                    ✅ Withdrawal Request Submitted Successfully!
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-700 mb-2">
                    Your withdrawal request has been processed and is now under
                    review.
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    💰{" "}
                    <span className="text-green-600">
                      ₹
                      {typeof currentUser?.balance === "string"
                        ? parseFloat(currentUser.balance).toFixed(2)
                        : (currentUser?.balance || 0).toFixed(2)}
                    </span>{" "}
                    will be credited to your account by the{" "}
                    <span className="font-semibold text-blue-600">
                      5th day of the upcoming month
                    </span>
                    .
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    You'll receive a confirmation notification once the payment
                    is processed.
                  </p>
                </div>
                <button
                  onClick={() => setWithdrawalSuccess(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Completed Tasks Section - Only show if there are completed tasks */}
          {getCompletedTasks.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-bold text-gray-900">
                  Completed Tasks
                </h2>
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
          )}

          {/* Transaction History Modal */}
          {showHistoryModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-3 sm:p-4">
              <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-3 sm:p-4 border-b">
                  <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">
                    All Transactions
                  </h3>
                  <button
                    onClick={() => setShowHistoryModal(false)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
                <div className="p-3 sm:p-4 flex-1 overflow-y-auto">
                  <div className="divide-y divide-gray-100">
                    {isLoading ? (
                      <div className="text-center text-xs sm:text-sm text-gray-500 py-6 sm:py-8">
                        Loading transactions...
                      </div>
                    ) : transactions.length === 0 ? (
                      <div className="text-center text-xs sm:text-sm text-gray-500 py-6 sm:py-8">
                        No transactions yet
                      </div>
                    ) : (
                      transactions.map((tx) => {
                        const isCredit = tx.type === "credit";
                        return (
                          <div
                            key={tx.id}
                            className="py-2 sm:py-3 flex items-center"
                          >
                            <div
                              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mr-2 sm:mr-3 ${
                                isCredit ? "bg-emerald-50" : "bg-red-50"
                              }`}
                            >
                              {isCredit ? (
                                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                              ) : (
                                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                                  {tx.note || "Transaction"}
                                </div>
                                <div
                                  className={`text-xs sm:text-sm font-bold ${
                                    isCredit
                                      ? "text-emerald-700"
                                      : "text-red-700"
                                  }`}
                                >
                                  {isCredit ? "+" : "-"}₹
                                  {typeof tx.amount === "string"
                                    ? parseFloat(tx.amount).toFixed(2)
                                    : tx.amount}
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <div className="text-[10px] sm:text-[11px] text-gray-500">
                                  {new Date(tx.created_on).toLocaleString()} •
                                  TXN-{String(tx.id)}
                                </div>
                                <span
                                  className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full border font-medium ${
                                    tx.note === "Withdrawal Request"
                                      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  }`}
                                >
                                  {tx.note === "Withdrawal Request"
                                    ? "In Process"
                                    : "Completed"}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Email/Phone Update Modal */}
          {showEmailPhoneModal && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-3 sm:p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      Update Account Info
                    </h3>
                    <button
                      onClick={() => {
                        setShowEmailPhoneModal(false);
                        setEmail("");
                        setPhone("");
                        setName("");
                        setUpi("");
                      }}
                      className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                    >
                      <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>
                  <p className="text-white/90 text-xs sm:text-sm">
                    Update your name, email, phone and UPI ID
                  </p>
                </div>

                <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={name !== null ? name : currentUser?.name || ""}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={
                          email !== null ? email : currentUser?.email || ""
                        }
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={
                          phone !== null ? phone : currentUser?.phone || ""
                        }
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your phone number"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        UPI ID
                      </label>
                      <input
                        type="text"
                        value={upi !== null ? upi : currentUser?.upi || ""}
                        onChange={(e) => setUpi(e.target.value)}
                        placeholder="Enter your UPI ID (e.g., user@paytm)"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 sm:gap-3 pt-2">
                    <button
                      onClick={() => {
                        setShowEmailPhoneModal(false);
                        setEmail(null);
                        setPhone(null);
                        setName(null);
                        setUpi(null);
                      }}
                      className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all text-sm sm:text-base min-h-[44px]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateContact}
                      disabled={
                        isUpdatingContact ||
                        (email === null &&
                          phone === null &&
                          name === null &&
                          upi === null)
                      }
                      className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-semibold transition-all text-sm sm:text-base min-h-[44px] ${
                        isUpdatingContact ||
                        (email === null &&
                          phone === null &&
                          name === null &&
                          upi === null)
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg"
                      }`}
                    >
                      {isUpdatingContact ? "Updating..." : "Update Contact"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && selectedTask && (
        <div
          className={`fixed inset-0 bg-black/60 flex items-end justify-center z-[70] p-0 backdrop-blur-sm transition-all duration-300 ${
            isModalAnimating ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className={`bg-white rounded-t-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl transition-all duration-300 ease-out ${
              isModalAnimating
                ? "translate-y-0 opacity-100"
                : "translate-y-full opacity-0"
            }`}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {getCurrentTask() && (
                    <>
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        {React.createElement(getCurrentTask()!.icon, {
                          className: "w-5 h-5 text-white",
                        })}
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-white">
                          {getCurrentTask()!.title}
                        </h3>
                        <p className="text-white/90 text-sm">
                          Earn ₹{getCurrentTask()!.reward}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={closeTaskModal}
                  className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-5 pb-8 sm:pb-10 max-h-[70vh] overflow-y-auto">
              {uploadSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Reward Added!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    ₹{getCurrentTask()?.reward} credited to your account. Your
                    proof will be reviewed on withdrawal.
                  </p>
                  <button
                    onClick={closeTaskModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Task Steps - Only show for tasks that don't have specific implementations */}
                  {![
                    "share_to_group",
                    "share_to_story",
                    "share_to_ig",
                    "share_to_fb",
                    "install_pwa",
                    "comet_browser",
                    "adstera_signup",
                    "monetag_signup",
                  ].includes(selectedTask) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <h4 className="font-semibold text-blue-900 mb-3">
                        Task Steps:
                      </h4>
                      <ol className="space-y-2">
                        {getCurrentTask()?.steps.map(
                          (step: string, index: number) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-sm text-blue-800"
                            >
                              <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold text-blue-700 flex-shrink-0 mt-0.5">
                                {index + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          )
                        )}
                      </ol>
                    </div>
                  )}

                  {/* Special handling for different task types */}
                  {selectedTask === "install_pwa" && (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Smartphone className="w-5 h-5 text-green-600" />
                          <h4 className="font-semibold text-green-900">
                            PWA Installation
                          </h4>
                        </div>
                        <p className="text-sm text-green-800 mb-3">
                          Install AWIN as a PWA (Progressive Web App) on your
                          device to earn ₹{getCurrentTask()?.reward}.
                        </p>

                        {/* Install Button - Show First */}
                        <div>
                          <button
                            onClick={async () => {
                              try {
                                // Check if PWA is already installed
                                if (
                                  window.matchMedia(
                                    "(display-mode: standalone)"
                                  ).matches ||
                                  (window.navigator as any).standalone === true
                                ) {
                                  alert("AWIN is already installed as a PWA!");
                                  return;
                                }

                                // Check if beforeinstallprompt event is available
                                if (window.deferredPrompt) {
                                  // Show the install prompt
                                  window.deferredPrompt.prompt();

                                  // Wait for the user to respond to the prompt
                                  const { outcome } = await window
                                    .deferredPrompt.userChoice;

                                  if (outcome === "accepted") {
                                    console.log(
                                      "User accepted the install prompt"
                                    );
                                    // Clear the deferredPrompt so it can only be used once
                                    window.deferredPrompt = null;
                                  } else {
                                    console.log(
                                      "User dismissed the install prompt"
                                    );
                                  }
                                } else {
                                  // Fallback for browsers that don't support beforeinstallprompt
                                  alert(
                                    "To install this PWA:\n\nOn Mobile: Tap the share button and select 'Add to Home Screen'\nOn Desktop: Look for the install icon in your browser address bar"
                                  );
                                }
                              } catch (error) {
                                console.error(
                                  "Error during PWA installation:",
                                  error
                                );
                                alert(
                                  "Installation failed. Please try using your browser's menu to install this app."
                                );
                              }
                            }}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            <Smartphone className="w-4 h-4" />
                            Install AWIN App
                          </button>
                        </div>
                      </div>
                      {/* Question - Show After Install Button */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Have you installed AWIN as a PWA?
                          </label>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                setTaskAnswers({
                                  ...taskAnswers,
                                  installed: "yes",
                                })
                              }
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                taskAnswers.installed === "yes"
                                  ? "bg-green-600 text-white"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                            >
                              Yes, I Have Done the Steps
                            </button>
                            <button
                              onClick={() =>
                                setTaskAnswers({
                                  ...taskAnswers,
                                  installed: "no",
                                })
                              }
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
                            <h5 className="font-semibold text-blue-900 mb-2">
                              How to Install AWIN PWA:
                            </h5>
                            <div className="space-y-2 text-sm text-blue-800">
                              <p>
                                <strong>On Mobile:</strong>
                              </p>
                              <ol className="list-decimal list-inside space-y-1 ml-2">
                                <li>Tap the share button in your browser</li>
                                <li>Select "Add to Home Screen"</li>
                                <li>Tap "Add" to confirm</li>
                              </ol>
                              <p className="mt-2">
                                <strong>On Desktop:</strong>
                              </p>
                              <ol className="list-decimal list-inside space-y-1 ml-2">
                                <li>
                                  Look for the install icon in your browser
                                  address bar
                                </li>
                                <li>Click "Install" when prompted</li>
                                <li>Follow the installation prompts</li>
                              </ol>
                            </div>
                          </div>
                        )}

                        {taskAnswers.installed === "yes" && (
                          <div>
                            <button
                              onClick={async () => {
                                // Auto-detect PWA installation
                                if (
                                  window.matchMedia(
                                    "(display-mode: standalone)"
                                  ).matches ||
                                  (window.navigator as any).standalone === true
                                ) {
                                  // PWA is installed, auto-complete task
                                  if (currentUser?.id) {
                                    try {
                                      const response =
                                        await apiService.updateUser(
                                          currentUser.id,
                                          {
                                            installed_pwa: 1,
                                          }
                                        );

                                      if (response.status === "success") {
                                        setUploadSuccess(true);
                                        // Fetch updated user data
                                        const updatedUserResponse =
                                          await apiService.getUser(
                                            currentUser.id
                                          );
                                        if (
                                          updatedUserResponse.status ===
                                            "success" &&
                                          updatedUserResponse.data
                                        ) {
                                          setCurrentUser(
                                            updatedUserResponse.data.user
                                          );
                                          setTransactions(
                                            updatedUserResponse.data
                                              .transactions
                                          );
                                        }
                                      }
                                    } catch (error) {
                                      console.error(
                                        "Failed to update PWA status:",
                                        error
                                      );
                                    }
                                  }
                                } else {
                                  alert(
                                    "Please add this app to your home screen first. Look for the 'Add to Home Screen' option in your browser menu."
                                  );
                                }
                              }}
                              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Check Installation
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedTask === "comet_browser" && (
                    <div className="space-y-4">
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <h4 className="font-semibold text-amber-900 mb-2">
                          Comet Browser Setup
                        </h4>
                        <div className="space-y-2 text-sm text-amber-800">
                          {EXTERNAL_SERVICES.comet.steps.map((step, index) => (
                            <p key={index}>
                              {index + 1}. {step}
                            </p>
                          ))}
                        </div>

                        {/* Comet Browser Links */}
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() =>
                              window.open(EXTERNAL_SERVICES.comet.url, "_blank")
                            }
                            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Open Download Link
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                EXTERNAL_SERVICES.comet.url
                              );
                              alert(
                                `${EXTERNAL_SERVICES.comet.name} link copied to clipboard!`
                              );
                            }}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Have you installed Comet Browser?
                          </label>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                setTaskAnswers({
                                  ...taskAnswers,
                                  installed: "yes",
                                })
                              }
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                taskAnswers.installed === "yes"
                                  ? "bg-green-600 text-white"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                            >
                              Yes, I Have Done All The Steps
                            </button>
                            <button
                              onClick={() =>
                                setTaskAnswers({
                                  ...taskAnswers,
                                  installed: "no",
                                })
                              }
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
                            <p className="text-sm text-blue-800 mb-2">
                              Don't have a PC? Try on a friend's PC and copy the
                              link to send via WhatsApp.
                            </p>
                            <button
                              onClick={() => {
                                const message = encodeURIComponent(
                                  EXTERNAL_SERVICES.comet.whatsappMessage
                                );
                                window.open(
                                  `https://wa.me/?text=${message}`,
                                  "_blank"
                                );
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              Send to WhatsApp
                            </button>
                          </div>
                        )}

                        {taskAnswers.installed === "yes" && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Have you signed up for an account?
                              </label>
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    setTaskAnswers({
                                      ...taskAnswers,
                                      signedUp: "yes",
                                    })
                                  }
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    taskAnswers.signedUp === "yes"
                                      ? "bg-green-600 text-white"
                                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                  }`}
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() =>
                                    setTaskAnswers({
                                      ...taskAnswers,
                                      signedUp: "no",
                                    })
                                  }
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    taskAnswers.signedUp === "no"
                                      ? "bg-red-600 text-white"
                                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                  }`}
                                >
                                  Not Yet
                                </button>
                              </div>
                            </div>

                            {taskAnswers.signedUp === "no" && (
                              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                <p className="text-sm text-amber-800">
                                  Please sign up for an account in Comet Browser
                                  first.
                                </p>
                              </div>
                            )}

                            {taskAnswers.signedUp === "yes" && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Have you started at least 2 chats with the AI
                                  assistant?
                                </label>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() =>
                                      setTaskAnswers({
                                        ...taskAnswers,
                                        chats: "yes",
                                      })
                                    }
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                      taskAnswers.chats === "yes"
                                        ? "bg-green-600 text-white"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                                  >
                                    Yes
                                  </button>
                                  <button
                                    onClick={() =>
                                      setTaskAnswers({
                                        ...taskAnswers,
                                        chats: "no",
                                      })
                                    }
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                      taskAnswers.chats === "no"
                                        ? "bg-red-600 text-white"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                                  >
                                    Not Yet
                                  </button>
                                </div>
                              </div>
                            )}

                            {taskAnswers.chats === "no" && (
                              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                <p className="text-sm text-amber-800">
                                  Please start at least 2 chats with the AI
                                  assistant first.
                                </p>
                              </div>
                            )}

                            {taskAnswers.chats === "yes" && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                  Upload Screenshot of Your Chats
                                </label>
                                {!uploadedFile && (
                                  <div className="relative">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={handleFileUpload}
                                      className="hidden"
                                      id="comet-chats-screenshot"
                                    />
                                    <label
                                      htmlFor="comet-chats-screenshot"
                                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-indigo-300 rounded-lg cursor-pointer bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-400 transition-colors"
                                    >
                                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Camera className="w-8 h-8 mb-2 text-indigo-400" />
                                        <p className="mb-2 text-sm text-indigo-600">
                                          <span className="font-semibold">
                                            Click to upload
                                          </span>{" "}
                                          your chat screenshots
                                        </p>
                                        <p className="text-xs text-indigo-500">
                                          PNG, JPG, GIF up to 10MB
                                        </p>
                                      </div>
                                    </label>
                                  </div>
                                )}
                                {uploadedFile && (
                                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <div>
                                          <p className="text-sm font-medium text-green-800">
                                            ✓ File selected: {uploadedFile.name}
                                          </p>
                                          <p className="text-xs text-green-600">
                                            Size:{" "}
                                            {(
                                              uploadedFile.size /
                                              1024 /
                                              1024
                                            ).toFixed(2)}{" "}
                                            MB
                                          </p>
                                        </div>
                                      </div>
                                      <button
                                        onClick={handleRemoveFile}
                                        className="p-1 hover:bg-red-100 rounded-full transition-colors"
                                        title="Remove file"
                                      >
                                        <X className="w-4 h-4 text-red-600" />
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* Warning message */}
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
                                  <div className="flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-red-800">
                                      <p className="font-semibold mb-1">
                                        Important Warning:
                                      </p>
                                      <p>
                                        Wrong or fake screenshots can result in
                                        account blocking and loss of all
                                        earnings. Please ensure your screenshots
                                        are genuine and clearly show the
                                        required action.
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Submit buttons */}
                                <div className="flex gap-3 pt-4">
                                  <button
                                    onClick={closeTaskModal}
                                    className="flex-1 py-3 px-4 rounded-xl font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={submitTaskProof}
                                    disabled={!uploadedFile || isUploading}
                                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                                      !uploadedFile || isUploading
                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                                    }`}
                                  >
                                    {isUploading
                                      ? "Submitting..."
                                      : "Submit Proof"}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Adstera and Monetag special handling */}
                  {(selectedTask === "adstera_signup" ||
                    selectedTask === "monetag_signup") &&
                    (() => {
                      const service =
                        selectedTask === "adstera_signup"
                          ? EXTERNAL_SERVICES.adstera
                          : EXTERNAL_SERVICES.monetag;
                      return (
                        <div className="space-y-4">
                          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                            <h4 className="font-semibold text-orange-900 mb-2">
                              {service.name}
                            </h4>
                            <p className="text-sm text-orange-800 mb-3">
                              {service.description}. Visit the Sponsor Website
                              and Spent Some Time There.
                            </p>

                            {/* Steps */}
                            <div className="mb-4">
                              <h5 className="font-semibold text-orange-900 mb-2">
                                Steps:
                              </h5>
                              <ol className="list-decimal list-inside space-y-1 text-sm text-orange-800">
                                {service.steps.map((step, index) => (
                                  <li key={index}>{step}</li>
                                ))}
                              </ol>
                            </div>

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
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Have you signed up on the website?
                            </label>
                            <div className="flex gap-2 mb-3">
                              <button
                                onClick={() =>
                                  setTaskAnswers({
                                    ...taskAnswers,
                                    signedUp: "yes",
                                  })
                                }
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  taskAnswers.signedUp === "yes"
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                              >
                                Yes, I Have Done the Steps
                              </button>
                              <button
                                onClick={() =>
                                  setTaskAnswers({
                                    ...taskAnswers,
                                    signedUp: "no",
                                  })
                                }
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  taskAnswers.signedUp === "no"
                                    ? "bg-red-600 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                              >
                                No
                              </button>
                            </div>

                            {taskAnswers.signedUp === "yes" && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                  Upload Screenshot of Your Account
                                </label>
                                {!uploadedFile && (
                                  <div className="relative">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={handleFileUpload}
                                      className="hidden"
                                      id="account-screenshot"
                                    />
                                    <label
                                      htmlFor="account-screenshot"
                                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-orange-300 rounded-lg cursor-pointer bg-orange-50 hover:bg-orange-100 hover:border-orange-400 transition-colors"
                                    >
                                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Camera className="w-8 h-8 mb-2 text-orange-400" />
                                        <p className="mb-2 text-sm text-orange-600">
                                          <span className="font-semibold">
                                            Click to upload
                                          </span>{" "}
                                          your account screenshot
                                        </p>
                                        <p className="text-xs text-orange-500">
                                          PNG, JPG, GIF up to 10MB
                                        </p>
                                      </div>
                                    </label>
                                  </div>
                                )}
                                {uploadedFile && (
                                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <div>
                                          <p className="text-sm font-medium text-green-800">
                                            ✓ File selected: {uploadedFile.name}
                                          </p>
                                          <p className="text-xs text-green-600">
                                            Size:{" "}
                                            {(
                                              uploadedFile.size /
                                              1024 /
                                              1024
                                            ).toFixed(2)}{" "}
                                            MB
                                          </p>
                                        </div>
                                      </div>
                                      <button
                                        onClick={handleRemoveFile}
                                        className="p-1 hover:bg-red-100 rounded-full transition-colors"
                                        title="Remove file"
                                      >
                                        <X className="w-4 h-4 text-red-600" />
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* Warning message */}
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
                                  <div className="flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-red-800">
                                      <p className="font-semibold mb-1">
                                        Important Warning:
                                      </p>
                                      <p>
                                        Wrong or fake screenshots can result in
                                        account blocking and loss of all
                                        earnings. Please ensure your screenshots
                                        are genuine and clearly show the
                                        required action.
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Submit buttons */}
                                <div className="flex gap-3 pt-4">
                                  <button
                                    onClick={closeTaskModal}
                                    className="flex-1 py-3 px-4 rounded-xl font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={submitTaskProof}
                                    disabled={!uploadedFile || isUploading}
                                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                                      !uploadedFile || isUploading
                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                                    }`}
                                  >
                                    {isUploading
                                      ? "Submitting..."
                                      : "Submit Proof"}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                  {/* Share to Group Task */}
                  {selectedTask === "share_to_group" && (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <h4 className="font-semibold text-green-900 mb-2">
                          Share to WhatsApp Group
                        </h4>
                        <p className="text-sm text-green-800 mb-3">
                          Share your referral link to a WhatsApp group.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const message = encodeURIComponent(
                                `Check this out! ${referralLink}`
                              );
                              window.open(
                                `https://wa.me/?text=${message}`,
                                "_blank"
                              );
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
                          >
                            <Share2 className="w-4 h-4" />
                            Share to WhatsApp Group
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(referralLink);
                              alert("Link copied to clipboard!");
                            }}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Have you shared the link to a WhatsApp group?
                          </label>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                setTaskAnswers({
                                  ...taskAnswers,
                                  shared: "yes",
                                })
                              }
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                taskAnswers.shared === "yes"
                                  ? "bg-green-600 text-white"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                            >
                              Yes, I Have Done the Steps
                            </button>
                            <button
                              onClick={() =>
                                setTaskAnswers({ ...taskAnswers, shared: "no" })
                              }
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                taskAnswers.shared === "no"
                                  ? "bg-red-600 text-white"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                            >
                              Not Yet
                            </button>
                          </div>
                        </div>

                        {taskAnswers.shared === "no" && (
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <p className="text-sm text-amber-800">
                              Please share your referral link to a WhatsApp
                              group first, then come back to upload the
                              screenshot.
                            </p>
                          </div>
                        )}

                        {taskAnswers.shared === "yes" && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              Upload Screenshot of Group Message
                            </label>
                            {!uploadedFile && (
                              <div className="relative">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileUpload}
                                  className="hidden"
                                  id="group-screenshot"
                                />
                                <label
                                  htmlFor="group-screenshot"
                                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-colors"
                                >
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Camera className="w-8 h-8 mb-2 text-gray-400" />
                                    <p className="mb-2 text-sm text-gray-500">
                                      <span className="font-semibold">
                                        Click to upload
                                      </span>{" "}
                                      or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      PNG, JPG, GIF up to 10MB
                                    </p>
                                  </div>
                                </label>
                              </div>
                            )}
                            {uploadedFile && (
                              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <div>
                                      <p className="text-sm font-medium text-green-800">
                                        ✓ File selected: {uploadedFile.name}
                                      </p>
                                      <p className="text-xs text-green-600">
                                        Size:{" "}
                                        {(
                                          uploadedFile.size /
                                          1024 /
                                          1024
                                        ).toFixed(2)}{" "}
                                        MB
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={handleRemoveFile}
                                    className="p-1 hover:bg-red-100 rounded-full transition-colors"
                                    title="Remove file"
                                  >
                                    <X className="w-4 h-4 text-red-600" />
                                  </button>
                                </div>
                              </div>
                            )}

                            <WarningMessage />
                            <SubmitButtons
                              onCancel={closeTaskModal}
                              onSubmit={submitTaskProof}
                              isUploading={isUploading}
                              hasFile={!!uploadedFile}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Share to WhatsApp Status Task */}
                  {selectedTask === "share_to_story" && (
                    <div className="space-y-4">
                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                        <h4 className="font-semibold text-purple-900 mb-2">
                          Share to WhatsApp Status
                        </h4>
                        <p className="text-sm text-purple-800 mb-3">
                          Share your referral link to your WhatsApp status.
                        </p>
                        <div className="space-y-2">
                          <p className="text-sm text-purple-700">
                            <strong>Steps:</strong>
                          </p>
                          <ol className="text-sm text-purple-700 space-y-1 ml-4">
                            <li>1. Open WhatsApp app</li>
                            <li>2. Go to Status tab</li>
                            <li>3. Create a new status</li>
                            <li>
                              4. Add text: "Check this out! {referralLink}"
                            </li>
                            <li>5. Post the status</li>
                          </ol>
                        </div>
                        <div className="mt-3">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(referralLink);
                              alert("Link copied to clipboard!");
                            }}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
                          >
                            {" "}
                            Copy Link to Share
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Have you shared the link to your WhatsApp status?
                          </label>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                setTaskAnswers({
                                  ...taskAnswers,
                                  shared: "yes",
                                })
                              }
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                taskAnswers.shared === "yes"
                                  ? "bg-green-600 text-white"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                            >
                              Yes, I Have Done the Steps
                            </button>
                            <button
                              onClick={() =>
                                setTaskAnswers({ ...taskAnswers, shared: "no" })
                              }
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                taskAnswers.shared === "no"
                                  ? "bg-red-600 text-white"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                            >
                              Not Yet
                            </button>
                          </div>
                        </div>

                        {taskAnswers.shared === "no" && (
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <p className="text-sm text-amber-800">
                              Please share your referral link to your WhatsApp
                              status first, then come back to upload the
                              screenshot.
                            </p>
                          </div>
                        )}

                        {taskAnswers.shared === "yes" && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              Upload Screenshot of Your WhatsApp Status
                            </label>
                            {!uploadedFile && (
                              <div className="relative">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileUpload}
                                  className="hidden"
                                  id="story-screenshot"
                                />
                                <label
                                  htmlFor="story-screenshot"
                                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer bg-purple-50 hover:bg-purple-100 hover:border-purple-400 transition-colors"
                                >
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Camera className="w-8 h-8 mb-2 text-purple-400" />
                                    <p className="mb-2 text-sm text-purple-600">
                                      <span className="font-semibold">
                                        Click to upload
                                      </span>{" "}
                                      your story screenshot
                                    </p>
                                    <p className="text-xs text-purple-500">
                                      PNG, JPG, GIF up to 10MB
                                    </p>
                                  </div>
                                </label>
                              </div>
                            )}
                            {uploadedFile && (
                              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <div>
                                      <p className="text-sm font-medium text-green-800">
                                        ✓ File selected: {uploadedFile.name}
                                      </p>
                                      <p className="text-xs text-green-600">
                                        Size:{" "}
                                        {(
                                          uploadedFile.size /
                                          1024 /
                                          1024
                                        ).toFixed(2)}{" "}
                                        MB
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={handleRemoveFile}
                                    className="p-1 hover:bg-red-100 rounded-full transition-colors"
                                    title="Remove file"
                                  >
                                    <X className="w-4 h-4 text-red-600" />
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Warning message */}
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-red-800">
                                  <p className="font-semibold mb-1">
                                    Important Warning:
                                  </p>
                                  <p>
                                    Wrong or fake screenshots can result in
                                    account blocking and loss of all earnings.
                                    Please ensure your screenshots are genuine
                                    and clearly show the required action.
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Submit buttons */}
                            <div className="flex gap-3 pt-4">
                              <button
                                onClick={closeTaskModal}
                                className="flex-1 py-3 px-4 rounded-xl font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={submitTaskProof}
                                disabled={!uploadedFile || isUploading}
                                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                                  !uploadedFile || isUploading
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                                }`}
                              >
                                {isUploading ? "Submitting..." : "Submit Proof"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Share to Instagram Story Task */}
                  {selectedTask === "share_to_ig" && (
                    <div className="space-y-4">
                      <div className="bg-pink-50 border border-pink-200 rounded-xl p-4">
                        <h4 className="font-semibold text-pink-900 mb-2">
                          Share to Instagram Story
                        </h4>
                        <p className="text-sm text-pink-800 mb-3">
                          Share your referral link to your Instagram story.
                        </p>
                        <div className="space-y-2">
                          <p className="text-sm text-pink-700">
                            <strong>Steps:</strong>
                          </p>
                          <ol className="text-sm text-pink-700 space-y-1 ml-4">
                            <li>1. Open Instagram app</li>
                            <li>2. Create a new story</li>
                            <li>
                              3. Add text: "Check this out! {referralLink}"
                            </li>
                            <li>4. Post the story</li>
                          </ol>
                        </div>
                        <div className="mt-3">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(referralLink);
                              alert("Link copied to clipboard!");
                            }}
                            className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Have you shared the link to your Instagram story?
                          </label>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                setTaskAnswers({
                                  ...taskAnswers,
                                  shared: "yes",
                                })
                              }
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                taskAnswers.shared === "yes"
                                  ? "bg-green-600 text-white"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                            >
                              Yes, I Have Done the Steps
                            </button>
                            <button
                              onClick={() =>
                                setTaskAnswers({ ...taskAnswers, shared: "no" })
                              }
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                taskAnswers.shared === "no"
                                  ? "bg-red-600 text-white"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                            >
                              Not Yet
                            </button>
                          </div>
                        </div>

                        {taskAnswers.shared === "no" && (
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <p className="text-sm text-amber-800">
                              Please share your referral link to your Instagram
                              story first, then come back to upload the
                              screenshot.
                            </p>
                          </div>
                        )}

                        {taskAnswers.shared === "yes" && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              Upload Screenshot of Your Instagram Story
                            </label>
                            {!uploadedFile && (
                              <div className="relative">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileUpload}
                                  className="hidden"
                                  id="ig-post-screenshot"
                                />
                                <label
                                  htmlFor="ig-post-screenshot"
                                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-pink-300 rounded-lg cursor-pointer bg-pink-50 hover:bg-pink-100 hover:border-pink-400 transition-colors"
                                >
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Camera className="w-8 h-8 mb-2 text-pink-400" />
                                    <p className="mb-2 text-sm text-pink-600">
                                      <span className="font-semibold">
                                        Click to upload
                                      </span>{" "}
                                      your post screenshot
                                    </p>
                                    <p className="text-xs text-pink-500">
                                      PNG, JPG, GIF up to 10MB
                                    </p>
                                  </div>
                                </label>
                              </div>
                            )}
                            {uploadedFile && (
                              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <div>
                                      <p className="text-sm font-medium text-green-800">
                                        ✓ File selected: {uploadedFile.name}
                                      </p>
                                      <p className="text-xs text-green-600">
                                        Size:{" "}
                                        {(
                                          uploadedFile.size /
                                          1024 /
                                          1024
                                        ).toFixed(2)}{" "}
                                        MB
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={handleRemoveFile}
                                    className="p-1 hover:bg-red-100 rounded-full transition-colors"
                                    title="Remove file"
                                  >
                                    <X className="w-4 h-4 text-red-600" />
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Warning message */}
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-red-800">
                                  <p className="font-semibold mb-1">
                                    Important Warning:
                                  </p>
                                  <p>
                                    Wrong or fake screenshots can result in
                                    account blocking and loss of all earnings.
                                    Please ensure your screenshots are genuine
                                    and clearly show the required action.
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Submit buttons */}
                            <div className="flex gap-3 pt-4">
                              <button
                                onClick={closeTaskModal}
                                className="flex-1 py-3 px-4 rounded-xl font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={submitTaskProof}
                                disabled={!uploadedFile || isUploading}
                                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                                  !uploadedFile || isUploading
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                                }`}
                              >
                                {isUploading ? "Submitting..." : "Submit Proof"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Share to Facebook Task */}
                  {selectedTask === "share_to_fb" && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">
                          Share to Facebook
                        </h4>
                        <p className="text-sm text-blue-800 mb-3">
                          Share your referral link to Facebook.
                        </p>
                        <div className="space-y-2">
                          <p className="text-sm text-blue-700">
                            <strong>Steps:</strong>
                          </p>
                          <ol className="text-sm text-blue-700 space-y-1 ml-4">
                            <li>1. Open Facebook app or website</li>
                            <li>2. Create a new post</li>
                            <li>
                              3. Add text: "Check this out! {referralLink}"
                            </li>
                            <li>4. Post the content</li>
                          </ol>
                        </div>
                        <div className="mt-3">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(referralLink);
                              alert("Link copied to clipboard!");
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Have you shared the link to Facebook?
                          </label>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                setTaskAnswers({
                                  ...taskAnswers,
                                  shared: "yes",
                                })
                              }
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                taskAnswers.shared === "yes"
                                  ? "bg-green-600 text-white"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                            >
                              Yes, I Have Done the Steps
                            </button>
                            <button
                              onClick={() =>
                                setTaskAnswers({ ...taskAnswers, shared: "no" })
                              }
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                taskAnswers.shared === "no"
                                  ? "bg-red-600 text-white"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                            >
                              Not Yet
                            </button>
                          </div>
                        </div>

                        {taskAnswers.shared === "no" && (
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <p className="text-sm text-amber-800">
                              Please share your referral link to Facebook first,
                              then come back to upload the screenshot.
                            </p>
                          </div>
                        )}

                        {taskAnswers.shared === "yes" && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              Upload Screenshot of Your Facebook Post
                            </label>
                            {!uploadedFile && (
                              <div className="relative">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileUpload}
                                  className="hidden"
                                  id="fb-post-screenshot"
                                />
                                <label
                                  htmlFor="fb-post-screenshot"
                                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-colors"
                                >
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Camera className="w-8 h-8 mb-2 text-blue-400" />
                                    <p className="mb-2 text-sm text-blue-600">
                                      <span className="font-semibold">
                                        Click to upload
                                      </span>{" "}
                                      your Facebook post screenshot
                                    </p>
                                    <p className="text-xs text-blue-500">
                                      PNG, JPG, GIF up to 10MB
                                    </p>
                                  </div>
                                </label>
                              </div>
                            )}
                            {uploadedFile && (
                              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <div>
                                      <p className="text-sm font-medium text-green-800">
                                        ✓ File selected: {uploadedFile.name}
                                      </p>
                                      <p className="text-xs text-green-600">
                                        Size:{" "}
                                        {(
                                          uploadedFile.size /
                                          1024 /
                                          1024
                                        ).toFixed(2)}{" "}
                                        MB
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={handleRemoveFile}
                                    className="p-1 hover:bg-red-100 rounded-full transition-colors"
                                    title="Remove file"
                                  >
                                    <X className="w-4 h-4 text-red-600" />
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Warning message */}
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-red-800">
                                  <p className="font-semibold mb-1">
                                    Important Warning:
                                  </p>
                                  <p>
                                    Wrong or fake screenshots can result in
                                    account blocking and loss of all earnings.
                                    Please ensure your screenshots are genuine
                                    and clearly show the required action.
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Submit buttons */}
                            <div className="flex gap-3 pt-4">
                              <button
                                onClick={closeTaskModal}
                                className="flex-1 py-3 px-4 rounded-xl font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={submitTaskProof}
                                disabled={!uploadedFile || isUploading}
                                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                                  !uploadedFile || isUploading
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                                }`}
                              >
                                {isUploading ? "Submitting..." : "Submit Proof"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Want More Money Section */}
      <div className="bg-blue-100 rounded-xl p-5 mb-6 shadow-lg border border-blue-200">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-500 rounded-full mb-3">
            <Trophy className="h-5 w-5 text-white" />
          </div>

          <h3 className="text-blue-800 font-bold text-lg mb-2">
            💰 Want More Money?
          </h3>
          <p className="text-blue-700 text-sm mb-3">
            Refer friends and earn ₹300 each
          </p>

          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-blue-800 text-xs">
              🎯 Unlimited referrals • 💸 Instant payouts • 🏆 No limits
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          Frequently Asked Questions
        </h3>

        <div className="space-y-3">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 text-sm mb-2">
              How it Works?
            </h4>
            <p className="text-gray-600 text-xs leading-relaxed">
              Complete quizzes, invite friends, and earn money. It's simple -
              play, share, and withdraw your winnings directly to your bank
              account via UPI.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 text-sm mb-2">
              How can we give out Money?
            </h4>
            <p className="text-gray-600 text-xs leading-relaxed">
              We partner with advertisers and sponsors who pay us for user
              engagement. This allows us to reward our users with real money for
              their participation.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 text-sm mb-2">
              How much you can earn?
            </h4>
            <p className="text-gray-600 text-xs leading-relaxed">
              Earn ₹453 from quiz completion + ₹300 for each friend you refer.
              No limits on referrals - invite as many friends as you want and
              keep earning!
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 text-sm mb-2">
              Will I really get money?
            </h4>
            <p className="text-gray-600 text-xs leading-relaxed">
              Yes! We guarantee real money transfers. Complete the requirements,
              and your earnings will be transferred directly to your bank
              account via UPI within 24 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
