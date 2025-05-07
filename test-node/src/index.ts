console.log("Welcome to your TypeScript project!");

// Your project code starts here
const start = async (): Promise<void> => {
  console.log("Project is running...");

  // Add your code here
};

start().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
