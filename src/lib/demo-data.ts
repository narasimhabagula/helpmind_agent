export type MemoryCategory = "World Facts" | "Experience" | "Observations";

export type MemoryItem = {
  id: string;
  index: string;
  title: string;
  text: string;
  category: MemoryCategory;
  date: string;
  source: string;
  lastUsed: string;
};

export const customer = {
  name: "Customer",
  firstName: "Customer",
  id: "CUST-1001",
  location: "Customer Profile",
  preferredChannel: "Email",
  recentIssues: [],
};

export const memories: MemoryItem[] = [];

export type ChatMessageItem = {
  id: string;
  role: "customer" | "ai";
  text?: string | undefined;
  greeting?: string | undefined;
  intro?: string | undefined;
  listTitle?: string | undefined;
  list?: string[] | undefined;
  outro?: string[] | undefined;
  signature?: string[] | undefined;
  memoryUsed?: { label: string; detail: string } | undefined;
  timestamp?: string | undefined;
};

export const exampleConversation: ChatMessageItem[] = [];

export const suggestedPrompts = ["Order issue", "Payment issue", "Account help"];

export const dashboardStats = [
  { label: "Active Conversations", value: "18", delta: "+3 today", tone: "primary" as const },
  { label: "Customers Helped", value: "1,284", delta: "+64 this week", tone: "primary" as const },
  { label: "Memories Stored", value: "9,412", delta: "+218 this week", tone: "memory" as const },
  {
    label: "Memory-Assisted Resolutions",
    value: "73%",
    delta: "+6% vs last month",
    tone: "success" as const,
  },
];

export const recentActivity = [
  {
    customer: "Priya Sharma",
    issue: "Order #436 not delivered",
    time: "2 min ago",
    status: "Open",
  },
  { customer: "Arjun Mehta", issue: "Refund not received", time: "24 min ago", status: "Resolved" },
  {
    customer: "Lena Fischer",
    issue: "Login verification loop",
    time: "1 hr ago",
    status: "Resolved",
  },
  {
    customer: "Tomás Rivera",
    issue: "Duplicate payment charge",
    time: "3 hrs ago",
    status: "Open",
  },
];

export const memoryResolutions = [
  {
    customer: "Priya Sharma",
    memory: "Prefers email updates",
    outcome: "Status report scheduled instead of a call-back",
  },
  {
    customer: "Arjun Mehta",
    memory: "Refund raised on Sep 02",
    outcome: "Agent skipped re-verification, resolved in 2 messages",
  },
  {
    customer: "Lena Fischer",
    memory: "Uses a corporate SSO account",
    outcome: "Routed straight to the SSO reset flow",
  },
];

export const conversationHistory = [
  {
    id: "h1",
    customer: "Priya Sharma",
    issue: "Order #436 not delivered",
    date: "Sep 27, 2026",
    resolution: "Ticket opened with logistics",
    memoryUsed: "Email update preference",
  },
  {
    id: "h2",
    customer: "Priya Sharma",
    issue: "Order #456 delayed",
    date: "Aug 26, 2026",
    resolution: "Replacement dispatched",
    memoryUsed: "Hyderabad delivery zone",
  },
  {
    id: "h3",
    customer: "Arjun Mehta",
    issue: "Refund not received",
    date: "Sep 18, 2026",
    resolution: "Refund re-initiated",
    memoryUsed: "Previous refund request",
  },
  {
    id: "h4",
    customer: "Lena Fischer",
    issue: "Login verification loop",
    date: "Sep 14, 2026",
    resolution: "SSO reset link sent",
    memoryUsed: "Corporate SSO account",
  },
  {
    id: "h5",
    customer: "Tomás Rivera",
    issue: "Duplicate payment charge",
    date: "Sep 09, 2026",
    resolution: "Duplicate charge reversed",
    memoryUsed: "—",
  },
];
