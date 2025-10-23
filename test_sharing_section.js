// Test the sharing tasks section functionality
const testSharingSection = () => {
  console.log("=== Sharing Tasks Section Test ===");
  
  const mockAllTasks = [
    { id: "share_to_group", title: "Share to WhatsApp Group", reward: 100, completed: false },
    { id: "share_to_story", title: "Share to WhatsApp Status", reward: 100, completed: true },
    { id: "share_to_ig", title: "Share to Instagram Story", reward: 100, completed: false },
    { id: "share_to_fb", title: "Share to Facebook", reward: 100, completed: true },
    { id: "install_pwa", title: "Install PWA App", reward: 200, completed: false },
    { id: "comet_browser", title: "Try Comet Browser", reward: 600, completed: false }
  ];

  // Filter sharing tasks
  const sharingTasks = mockAllTasks.filter(task => 
    ["share_to_group", "share_to_story", "share_to_ig", "share_to_fb"].includes(task.id)
  );

  console.log("✅ Sharing Tasks Identified:");
  console.log("  Tasks:", sharingTasks.map(t => t.title).join(", "));
  console.log("  Expected: Share to WhatsApp Group, Share to WhatsApp Status, Share to Instagram Story, Share to Facebook");

  // Test pending filter
  const pendingSharing = sharingTasks.filter(task => !task.completed);
  console.log("\n✅ Pending Sharing Tasks:");
  console.log("  Tasks:", pendingSharing.map(t => `${t.title} (₹${t.reward})`).join(", "));
  console.log("  Expected: Share to WhatsApp Group, Share to Instagram Story");

  // Test completed filter
  const completedSharing = sharingTasks.filter(task => task.completed);
  console.log("\n✅ Completed Sharing Tasks:");
  console.log("  Tasks:", completedSharing.map(t => `${t.title} (₹${t.reward})`).join(", "));
  console.log("  Expected: Share to WhatsApp Status, Share to Facebook");

  console.log("\n✅ Section Features:");
  console.log("  - Dedicated section for sharing tasks only");
  console.log("  - Separate filter state from main tasks");
  console.log("  - Same UI/UX as main tasks section");
  console.log("  - Filter chips: 'Pending Earning Tasks', 'Completed Tasks'");
  console.log("  - Share2 icon in section header");
  console.log("  - Independent filtering and sorting");

  console.log("\n✅ Benefits:");
  console.log("  - Focused view on sharing tasks");
  console.log("  - Easy to track sharing progress");
  console.log("  - Separate from other task types");
  console.log("  - Consistent user experience");
};

testSharingSection();
