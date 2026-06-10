import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.warn("⚠️ Aborting seed: Seeding is blocked in production environments.");
    process.exit(0); // Exit cleanly
  }
  console.log("🌱 Starting database seeding...");

  // 1. Clean existing test data (safe deletion using target email domain)
  console.log("🧹 Cleaning up old test seed data...");

  await prisma.profile.deleteMany({
    where: {
      email: {
        endsWith: "@example.com",
      },
    },
  });

  // 2. Create seed users
  console.log("👤 Creating seed users...");
  const hashedPassword = await bcrypt.hash("Password123!", 10);

  // John Doe (Admin / Owner)
  const john = await prisma.profile.create({
    data: {
      email: "john.doe@example.com",
      password: hashedPassword,
      full_name: "John Doe",
      avatar_url: "https://api.dicebear.com/7.x/adventurer/svg?seed=John",
      language: "en",
    },
  });

  // Jane Smith (Member)
  const jane = await prisma.profile.create({
    data: {
      email: "jane.smith@example.com",
      password: hashedPassword,
      full_name: "Jane Smith",
      avatar_url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Jane",
      language: "en",
    },
  });

  // Bob Johnson (Member)
  const bob = await prisma.profile.create({
    data: {
      email: "bob.johnson@example.com",
      password: hashedPassword,
      full_name: "Bob Johnson",
      avatar_url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Bob",
      language: "en",
    },
  });

  // Link John to a mock GitHub account
  await prisma.userGitHubAccount.create({
    data: {
      user_id: john.id,
      github_user_id: 12345678,
      github_username: "johndoe_gh",
      access_token: "mock_encrypted_token",
    },
  });

  // 3. Create Workspace
  console.log("💼 Creating seed workspace...");
  const workspace = await prisma.workspace.create({
    data: {
      name: "Development Workspace",
      slug: "dev-workspace",
      description: "Collaborative environment for task tracking and engineering",
      owner_id: john.id,
    },
  });

  // Add Jane and Bob as members of workspace
  await prisma.workspaceMember.createMany({
    data: [
      { workspace_id: workspace.id, user_id: jane.id, role: "member" },
      { workspace_id: workspace.id, user_id: bob.id, role: "member" },
    ],
  });

  // 4. Create Board
  console.log("📋 Creating board...");
  const board = await prisma.board.create({
    data: {
      title: "Engineering Board",
      key: "ENG",
      workspace_id: workspace.id,
      type: "private",
      is_favorite: true,
      owner_id: john.id,
      github_repo_full_name: "taskbox/test-repo",
    },
  });

  // Add members to board
  await prisma.boardMember.createMany({
    data: [
      { board_id: board.id, user_id: john.id, role: "admin" },
      { board_id: board.id, user_id: jane.id, role: "member" },
      { board_id: board.id, user_id: bob.id, role: "member" },
    ],
  });

  // 5. Create Columns (TODO, IN_PROGRESS, DONE categories)
  console.log("🗂️ Creating columns...");
  const todoCol = await prisma.column.create({
    data: { board_id: board.id, title: "Todo", position: 0, category: "TODO" },
  });

  const progressCol = await prisma.column.create({
    data: { board_id: board.id, title: "In Progress", position: 1, category: "IN_PROGRESS" },
  });

  const qaCol = await prisma.column.create({
    data: { board_id: board.id, title: "QA Testing", position: 2, category: "IN_PROGRESS" },
  });

  const doneCol = await prisma.column.create({
    data: { board_id: board.id, title: "Done", position: 3, category: "DONE" },
  });

  // 6. Create Labels
  console.log("🏷️ Creating board labels...");
  const bugLabel = await prisma.label.create({
    data: { board_id: board.id, title: "Bug", color: "#ef4444" },
  });
  const featureLabel = await prisma.label.create({
    data: { board_id: board.id, title: "Feature", color: "#10b981" },
  });

  // 7. Create Tasks
  console.log("📝 Creating tasks...");

  // Todo tasks
  const task1 = await prisma.task.create({
    data: {
      sequence_id: 1,
      board_id: board.id,
      column_id: todoCol.id,
      content: "Setup Redis Caching Layers",
      description: "Configure ioredis and set up invalidation logic on all resource mutations",
      priority: "high",
      position: 0,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      sequence_id: 2,
      board_id: board.id,
      column_id: todoCol.id,
      content: "Design Swagger API Specs",
      description: "Write OpenAPI specifications for all analytical endpoints",
      priority: "medium",
      position: 1,
    },
  });

  // In Progress tasks
  const task3 = await prisma.task.create({
    data: {
      sequence_id: 3,
      board_id: board.id,
      column_id: progressCol.id,
      content: "Build Recharts Dashboard",
      description: "Develop workload pie charts and status bar distribution graphs",
      priority: "high",
      position: 0,
      assignees: {
        create: { user_id: jane.id },
      },
      taskLabels: {
        create: { label_id: featureLabel.id },
      },
    },
  });

  // QA tasks
  const task4 = await prisma.task.create({
    data: {
      sequence_id: 4,
      board_id: board.id,
      column_id: qaCol.id,
      content: "Validate SQL Unique Constraints",
      description: "Check PostgreSQL partial index behavior with concurrent requests",
      priority: "high",
      position: 0,
      assignees: {
        create: { user_id: bob.id },
      },
      taskLabels: {
        create: { label_id: bugLabel.id },
      },
    },
  });

  // Done tasks (set historical created_at times to populate analytics cycle time data)
  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  await prisma.task.create({
    data: {
      sequence_id: 5,
      board_id: board.id,
      column_id: doneCol.id,
      content: "Configure Passport JWT Strategy",
      description: "Setup stateless JSON Web Token auth workflow",
      priority: "medium",
      position: 0,
      created_at: fiveDaysAgo,
      assignees: {
        create: { user_id: john.id },
      },
    },
  });

  await prisma.task.create({
    data: {
      sequence_id: 6,
      board_id: board.id,
      column_id: doneCol.id,
      content: "Implement Checklist Component",
      description: "Create interactive checklists with progress bars for task details",
      priority: "low",
      position: 1,
      created_at: twoDaysAgo,
      assignees: {
        create: { user_id: jane.id },
      },
    },
  });

  // 8. Create Task Rules (Automation rules)
  console.log("🤖 Creating automation rules...");
  await prisma.automationRule.create({
    data: {
      board_id: board.id,
      title: "Assign to John when moved to Done",
      trigger: { type: "TASK_MOVED" },
      condition: { column_title: "Done" },
      action: { type: "ASSIGN_USER", userId: john.id },
      is_active: true,
    },
  });

  await prisma.automationRule.create({
    data: {
      board_id: board.id,
      title: "Auto-assign Jane when task moves to QA",
      trigger: { type: "TASK_MOVED" },
      condition: { column_title: "QA Testing" },
      action: { type: "ASSIGN_USER", userId: jane.id },
      is_active: true,
    },
  });

  console.log("✨ Seeding completed successfully!");
  console.log("\n💡 Log in credentials for testing:");
  console.log("=========================================");
  console.log("Owner: john.doe@example.com      | Password123!");
  console.log("Member: jane.smith@example.com   | Password123!");
  console.log("Member: bob.johnson@example.com  | Password123!");
  console.log("=========================================");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed with error:", e);
    process.exit(0);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
