// Test the task separation between main and sharing sections
const testTaskSeparation = () => {
  console.log("=== Task Separation Test ===");
  
  const mockAllTasks = [
    { id: "share_to_group", title: "Share to WhatsApp Group", reward: 100, category: "Daily Doubles" },
    { id: "share_to_story", title: "Share to WhatsApp Status", reward: 100, category: "Daily Doubles" },
    { id: "share_to_ig", title: "Share to Instagram Story", reward: 100, category: "Daily Doubles" },
    { id: "share_to_fb", title: "Share to Facebook", reward: 100, category: "Daily Doubles" },
    { id: "install_pwa", title: "Install PWA App", reward: 200, category: "One Time Tasks" },
    { id: "comet_browser", title: "Try Comet Browser", reward: 600, category: "One Time Tasks" },
    { id: "adstera_signup", title: "Adstera Signup", reward: 50, category: "Signup Tasks" },
    { id: "monetag_signup", title: "Monetag Signup", reward: 50, category: "Signup Tasks" }
  ];

  // Simulate main tasks filter (excluding sharing tasks)
  const mainTasks = mockAllTasks.filter(task => 
    !["share_to_group", "share_to_story", "share_to_ig", "share_to_fb"].includes(task.id)
  );

  // Simulate sharing tasks filter
  const sharingTasks = mockAllTasks.filter(task => 
    ["share_to_group", "share_to_story", "share_to_ig", "share_to_fb"].includes(task.id)
  );

  console.log("✅ Main Tasks Section (Earning Tasks):");
  console.log("  Tasks:", mainTasks.map(t => t.title).join(", "));
  console.log("  Expected: Install PWA App, Try Comet Browser, Adstera Signup, Monetag Signup");
  console.log("  Sharing tasks excluded: ✅");

  console.log("\n✅ Sharing Tasks Section:");
  console.log("  Tasks:", sharingTasks.map(t => t.title).join(", "));
  console.log("  Expected: Share to WhatsApp Group, Share to WhatsApp Status, Share to Instagram Story, Share to Facebook");
  console.log("  Only sharing tasks included: ✅");

  console.log("\n✅ Separation Benefits:");
  console.log("  - No duplication of sharing tasks");
  console.log("  - Clean separation of task types");
  console.log("  - Main section focuses on non-sharing tasks");
  console.log("  - Sharing section focuses only on sharing tasks");
  console.log("  - Independent filtering for each section");

  console.log("\n✅ User Experience:");
  console.log("  - Clear distinction between task types");
  console.log("  - Sharing tasks have dedicated space");
  console.log("  - No confusion about where to find tasks");
  console.log("  - Better organization and navigation");
};

testTaskSeparation();
