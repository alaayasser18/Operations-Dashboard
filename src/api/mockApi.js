// Generate 5,200 mock operations with deterministic data

const STATUSES = ['Pending', 'Running', 'Completed', 'Failed'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const ASSIGNEES = [
  { name: 'Sarah Chen', role: 'DevOps Lead', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces' },
  { name: 'Tarek Mansour', role: 'Cloud Architect', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces' },
  { name: 'Elena Rostova', role: 'Security Ops', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces' },
  { name: 'David Lee', role: 'Data Engineer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces' },
  { name: 'Fatima Al-Zahra', role: 'Infrastructure SRE', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces' },
  { name: 'Marcus Vance', role: 'Release Manager', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=faces' },
  { name: 'Amira Khalil', role: 'Backend Systems', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces' },
  { name: 'Alex Rivera', role: 'Network Specialist', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=faces' },
];

const OPERATION_TEMPLATES = [
  'Data Migration Pipeline',
  'Cluster Auto-scaling Routine',
  'PostgreSQL Index Rebuild',
  'Zero-Downtime Deployment',
  'SSL Certificate Renewal',
  'Global CDN Cache Purge',
  'Security Audit & Pen Test',
  'Kafka Topic Partition Rebalance',
  'Docker Image Vulnerability Scan',
  'Disaster Recovery Sync',
  'Microservices Health Check',
  'Redis Cache Cluster Warmup',
  'Elasticsearch Shard Allocation',
  'Kubernetes Node Patching',
  'Encrypted Snapshot Backup',
  'API Gateway Rate Limit Tuning',
  'DNS Zone File Propagation',
  'Log Analytics Aggregation',
  'Payment Webhook Retry Batch',
  'Multi-Region Database Failover'
];

// Seeded generator for 5,200 operations
function generateMockOperations(count = 5200) {
  const operations = [];
  const baseTime = new Date('2026-10-11T12:00:00Z').getTime();

  for (let i = 1; i <= count; i++) {
    const idNum = String(i).padStart(5, '0');
    const id = `OP-${idNum}`;
    const templateName = OPERATION_TEMPLATES[(i * 7) % OPERATION_TEMPLATES.length];
    const region = ['(EMEA)', '(US-EAST)', '(APAC)', '(LATAM)', '(GLOBAL)'][i % 5];
    const name = `${templateName} ${region} #${i}`;
    const assignee = ASSIGNEES[i % ASSIGNEES.length];
    
    // Status distribution: ~45% Completed, ~25% Running, ~20% Pending, ~10% Failed
    let status;
    const mod = i % 20;
    if (mod < 9) status = 'Completed';
    else if (mod < 14) status = 'Running';
    else if (mod < 18) status = 'Pending';
    else status = 'Failed';

    const priority = PRIORITIES[i % PRIORITIES.length];

    // Created between 1 and 30 days ago
    const createdOffset = (i * 135791) % (30 * 24 * 3600 * 1000);
    const createdAt = new Date(baseTime - createdOffset).toISOString();

    // Updated between creation and now
    const updatedOffset = createdOffset - ((i * 31415) % Math.max(1, createdOffset));
    const updatedAt = new Date(baseTime - Math.max(0, updatedOffset)).toISOString();

    operations.push({
      id,
      name,
      assignedPerson: assignee.name,
      assigneeRole: assignee.role,
      assigneeAvatar: assignee.avatar,
      status,
      priority,
      createdAt,
      updatedAt,
      notes: `Telemetry stream monitoring active. Initiated by automated policy run ${id}.`,
      progress: status === 'Completed' ? 100 : status === 'Running' ? (35 + (i % 55)) : status === 'Pending' ? 0 : (10 + (i % 25))
    });
  }

  return operations;
}

// In-memory data store for client session
let operationsStore = generateMockOperations(5200);

// Simulator settings
let simulateErrorRate = 0; // 0 to 1
let simulateMinLatency = 200;
let simulateMaxLatency = 500;

export function setSimulatorConfig({ errorRate, minLatency, maxLatency }) {
  if (typeof errorRate === 'number') simulateErrorRate = errorRate;
  if (typeof minLatency === 'number') simulateMinLatency = minLatency;
  if (typeof maxLatency === 'number') simulateMaxLatency = maxLatency;
}

export function getSimulatorConfig() {
  return {
    errorRate: simulateErrorRate,
    minLatency: simulateMinLatency,
    maxLatency: simulateMaxLatency,
  };
}

// Helper to simulate network latency with abort signal support
function delayWithSignal(signal) {
  const latency = Math.floor(Math.random() * (simulateMaxLatency - simulateMinLatency + 1)) + simulateMinLatency;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      resolve();
    }, latency);

    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Request aborted', 'AbortError'));
      });
    }
  });
}

/**
 * Fetch Operations with search, status filter, sort, pagination, and signal handling
 */
export async function fetchOperations({
  search = '',
  status = 'all',
  sortBy = 'updatedAt',
  sortOrder = 'desc',
  page = 1,
  limit = 20,
  signal
} = {}) {
  await delayWithSignal(signal);

  let filtered = operationsStore;

  // Search filter (by ID or Name)
  if (search && search.trim() !== '') {
    const term = search.toLowerCase().trim();
    filtered = filtered.filter(op => 
      op.id.toLowerCase().includes(term) ||
      op.name.toLowerCase().includes(term) ||
      op.assignedPerson.toLowerCase().includes(term)
    );
  }

  // Status filter
  if (status && status !== 'all') {
    filtered = filtered.filter(op => op.status.toLowerCase() === status.toLowerCase());
  }

  // Sorting
  filtered = [...filtered].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
      const aTime = new Date(aVal).getTime();
      const bTime = new Date(bVal).getTime();
      return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
    }

    if (typeof aVal === 'string') {
      const cmp = aVal.localeCompare(bVal);
      return sortOrder === 'asc' ? cmp : -cmp;
    }

    return 0;
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * limit;
  const paginatedData = filtered.slice(startIndex, startIndex + limit);

  return {
    operations: paginatedData,
    total,
    totalPages,
    currentPage,
    limit
  };
}

/**
 * Fetch overall Status Counts (Statistics)
 */
export async function fetchOperationStats({ signal } = {}) {
  await delayWithSignal(signal);

  const stats = {
    total: operationsStore.length,
    Pending: 0,
    Running: 0,
    Completed: 0,
    Failed: 0,
  };

  for (let i = 0; i < operationsStore.length; i++) {
    const s = operationsStore[i].status;
    if (stats[s] !== undefined) {
      stats[s]++;
    }
  }

  return stats;
}

/**
 * Fetch single Operation by ID
 */
export async function fetchOperationById(id, { signal } = {}) {
  await delayWithSignal(signal);
  const op = operationsStore.find(item => item.id === id);
  if (!op) {
    throw new Error(`Operation with ID ${id} not found.`);
  }
  return { ...op };
}

/**
 * Update an operation (with random failure simulation to test optimistic rollback)
 */
export async function updateOperation(id, updates, { signal } = {}) {
  await delayWithSignal(signal);

  // Check if simulated error rate should trigger failure
  if (simulateErrorRate > 0 && Math.random() < simulateErrorRate) {
    throw new Error(`Simulated API failure on operation ${id}: Network timeout or backend validation error.`);
  }

  const index = operationsStore.findIndex(item => item.id === id);
  if (index === -1) {
    throw new Error(`Operation ${id} not found in database.`);
  }

  const updatedRecord = {
    ...operationsStore[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  operationsStore[index] = updatedRecord;

  return { ...updatedRecord };
}
