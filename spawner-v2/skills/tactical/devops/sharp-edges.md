# Sharp Edges: DevOps Engineering

These are the DevOps mistakes that cause outages, security breaches, and runaway costs. Each edge represents real incidents, sleepless nights, and postmortems that could have been prevented.

---

## 1. The Missing Health Check

**Severity:** Critical

**The Trap:**
Load balancer sends traffic to a container that's running but not ready. The app is still connecting to the database, loading config, warming caches. Users hit a broken service. Or worse - the container is OOM but the process is still running, just failing every request.

**Why It Happens:**
"Running" seems sufficient. Health checks seem like overhead. Default checks just verify process is alive. Testing doesn't simulate startup delays.

**The Fix:**
```yaml
# WRONG - Only checks if container is running
healthcheck:
  test: ["CMD", "echo", "healthy"]
  interval: 30s

# RIGHT - Checks if app is actually ready
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
  interval: 10s
  timeout: 5s
  retries: 3
  start_period: 30s

# Application health endpoint - check dependencies
app.get('/health', async (req, res) => {
  try {
    // Check database
    await db.query('SELECT 1')

    // Check Redis
    await redis.ping()

    // Check external services if critical
    const healthy = await checkExternalDeps()

    res.json({ status: 'healthy', checks: { db: true, redis: true } })
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    })
  }
})

# Kubernetes - separate liveness and readiness
livenessProbe:
  httpGet:
    path: /health/live
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health/ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

**Detection Pattern:**
- 502/503 errors after deploy
- Traffic to containers during startup
- Containers marked healthy but failing requests
- No `/health` endpoint

---

## 2. The Secrets in Repository

**Severity:** Critical

**The Trap:**
Database password committed "temporarily." API key in docker-compose.yml. AWS credentials in terraform.tfvars. Even after rotation, they're in git history forever. Attacker finds old key, compromises production.

**Why It Happens:**
"Just for development." Copy-paste from docs. Not in .gitignore. Need to get things working fast.

**The Fix:**
```bash
# WRONG - Secrets in repo
# .env
DATABASE_URL=postgres://admin:password123@prod.db.com/main
STRIPE_KEY=sk_live_abc123

# terraform.tfvars
aws_access_key = "AKIA..."
aws_secret_key = "..."

# RIGHT - Never commit secrets

# .gitignore
.env
.env.*
*.tfvars
secrets/

# .env.example (commit this)
DATABASE_URL=postgres://user:pass@localhost/dev
STRIPE_KEY=sk_test_...

# Use secret managers
# AWS: Secrets Manager, Parameter Store
# GCP: Secret Manager
# GitHub Actions:
jobs:
  deploy:
    env:
      DATABASE_URL: ${{ secrets.DATABASE_URL }}

# Terraform with secrets
data "aws_secretsmanager_secret_version" "db_creds" {
  secret_id = "prod/db/creds"
}

resource "aws_db_instance" "main" {
  password = jsondecode(
    data.aws_secretsmanager_secret_version.db_creds.secret_string
  )["password"]
}

# Pre-commit hook to catch secrets
# Use gitleaks, trufflehog, or git-secrets
```

**Detection Pattern:**
- Strings that look like API keys in code
- .env files committed
- Terraform state with secrets in repo
- No secret scanning in CI

---

## 3. The Unbounded Resource

**Severity:** High

**The Trap:**
Container has no memory limit. Pod uses all node memory. Other pods crash. Or: no CPU limit, one container hogs all cycles. Or: auto-scaling with no max, traffic spike scales to 1000 instances, $100K bill.

**Why It Happens:**
Limits feel like artificial constraints. Testing doesn't hit limits. "We'll optimize later." Auto-scaling seems like free scaling.

**The Fix:**
```yaml
# WRONG - No limits
resources: {}

# RIGHT - Always set limits
resources:
  requests:
    memory: "256Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "500m"

# Auto-scaling with bounds
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  minReplicas: 2
  maxReplicas: 10  # Cap the scaling!
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70

# AWS auto-scaling with cost protection
resource "aws_autoscaling_group" "main" {
  min_size         = 2
  max_size         = 20  # Cap!
  desired_capacity = 2
}

# Budget alert
resource "aws_budgets_budget" "monthly" {
  name         = "monthly-budget"
  budget_type  = "COST"
  limit_amount = "1000"
  limit_unit   = "USD"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = ["alerts@company.com"]
  }
}

# Monitor resource usage
# Set alerts for:
# - Memory > 80% of limit
# - CPU sustained > 90%
# - Pod restarts > 0
# - OOMKilled events
```

**Detection Pattern:**
- OOMKilled in pod events
- Cost spikes
- Missing resource limits in manifests
- No max on auto-scaling

---

## 4. The Single Point of Failure

**Severity:** Critical

**The Trap:**
One database instance. One load balancer. One availability zone. Single NAT gateway. One DNS provider. When that one thing fails, everything fails. And it will fail.

**Why It Happens:**
Redundancy costs money. "We're not at that scale yet." Complexity of multi-region. Testing doesn't simulate failures.

**The Fix:**
```hcl
# WRONG - Single AZ
resource "aws_instance" "web" {
  availability_zone = "us-east-1a"
  # One AZ = one failure domain
}

# RIGHT - Multi-AZ
resource "aws_db_instance" "main" {
  multi_az = true  # Automatic failover
}

resource "aws_autoscaling_group" "web" {
  availability_zones = [
    "us-east-1a",
    "us-east-1b",
    "us-east-1c"
  ]
  min_size = 2  # At least 2 for redundancy
}

# Kubernetes - pod anti-affinity
spec:
  affinity:
    podAntiAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchLabels:
            app: web
        topologyKey: "topology.kubernetes.io/zone"

# Multi-region for critical services
# - Primary in us-east-1
# - Hot standby in us-west-2
# - Database replication
# - DNS failover

# Minimum for production:
# - Multi-AZ deployment
# - 2+ instances of each service
# - Database with replica
# - Load balancer health checks
# - DNS with multiple IPs
```

**Detection Pattern:**
- Resources in single AZ
- Single replica/instance counts
- No failover configured
- Blast radius = everything

---

## 5. The Deployment Without Rollback

**Severity:** Critical

**The Trap:**
Deploy new version. It's broken. How do you roll back? Manually edit the deployment? Find the old Docker image tag? Hope the database migrations are reversible? Panic.

**Why It Happens:**
"Rollback is just deploying the old version." No tested rollback procedure. Deployment is manual. Database migrations are forward-only.

**The Fix:**
```yaml
# Kubernetes - built-in rollback
kubectl rollout undo deployment/web

# Keep revision history
spec:
  revisionHistoryLimit: 10  # Keep 10 previous versions

# Deployment strategy
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 25%
    maxUnavailable: 0  # No downtime

# Blue-green with quick switch
# - Blue (current) running
# - Deploy Green (new)
# - Test Green
# - Switch traffic to Green
# - Keep Blue running for quick rollback

# Database migrations - make reversible
// Migration: add column
exports.up = async (db) => {
  await db.schema.alterTable('users', t => {
    t.string('phone').nullable()  // Nullable = backwards compatible
  })
}

exports.down = async (db) => {
  await db.schema.alterTable('users', t => {
    t.dropColumn('phone')
  })
}

// Pattern: expand then contract
// 1. Add new column (nullable)
// 2. Deploy code that writes to both old and new
// 3. Backfill new column
// 4. Deploy code that reads from new
// 5. Remove old column

# Automated rollback
# GitHub Actions example
- name: Deploy
  run: kubectl apply -f deployment.yaml

- name: Verify
  run: |
    kubectl rollout status deployment/web --timeout=5m
    # Health check
    curl -f https://app.com/health || exit 1

- name: Rollback on failure
  if: failure()
  run: kubectl rollout undo deployment/web
```

**Detection Pattern:**
- No rollback procedure documented
- Deployment is manual
- Migrations are forward-only
- No version history kept

---

## 6. The Log Black Hole

**Severity:** High

**The Trap:**
Incident happens. You SSH to server to check logs. They're rotated out. Or there's 500GB of logs and you can't grep fast enough. Or logs are unstructured and you can't query. Or logs are on the container that died.

**Why It Happens:**
"We can SSH and check logs." Log aggregation seems like overhead. Logs are write-only until incident. Costs money to store.

**The Fix:**
```yaml
# WRONG - Logs on local disk
# Container dies, logs gone

# RIGHT - Centralized logging

# Docker - ship to logging driver
services:
  web:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

# Kubernetes - log shipping with Fluent Bit
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluent-bit
spec:
  template:
    spec:
      containers:
      - name: fluent-bit
        image: fluent/fluent-bit
        volumeMounts:
        - name: varlog
          mountPath: /var/log

# Application - structured logging
const logger = pino({
  level: 'info',
  formatters: {
    level: (label) => ({ level: label })
  }
})

// Structured log with context
logger.info({
  event: 'order_created',
  orderId: order.id,
  userId: user.id,
  amount: order.total
}, 'Order created successfully')

// NOT: console.log('Order created: ' + order.id)

# Log levels
# ERROR: Something broke, needs attention
# WARN: Something unexpected, might break
# INFO: Normal operations
# DEBUG: Development details (off in prod)

# What to log:
# - Request/response (without PII)
# - Business events (order, payment, signup)
# - Errors with context
# - Performance metrics
#
# What NOT to log:
# - Passwords, tokens
# - Full credit card numbers
# - PII unless required
# - High-frequency debug in prod
```

**Detection Pattern:**
- No centralized logging
- Logs only on container filesystem
- Unstructured log.info("stuff")
- No retention policy

---

## 7. The YOLO Deploy to Production

**Severity:** Critical

**The Trap:**
Developer pushes to main. Production deploys automatically. No review, no staging test, no gradual rollout. Bug goes to 100% of users instantly. Or worse - security vulnerability deployed before anyone notices.

**Why It Happens:**
"Fast iteration." "We're a small team." "We trust each other." "Staging is slow."

**The Fix:**
```yaml
# RIGHT - Deploy pipeline with gates

# GitHub Actions
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm test
      - run: npm run lint
      - run: npm run type-check

  deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    environment: staging  # Requires environment approval
    steps:
      - name: Deploy to staging
        run: ./deploy.sh staging

  smoke-test-staging:
    needs: deploy-staging
    runs-on: ubuntu-latest
    steps:
      - name: Run smoke tests
        run: ./smoke-tests.sh https://staging.app.com

  deploy-production:
    needs: smoke-test-staging
    runs-on: ubuntu-latest
    environment: production  # Manual approval required
    steps:
      - name: Deploy to production
        run: ./deploy.sh production

# Canary deployment
# 1. Deploy to 5% of traffic
# 2. Monitor for 15 minutes
# 3. If healthy, roll to 25%, 50%, 100%
# 4. If errors spike, automatic rollback

# Feature flags for risky changes
if (featureFlags.isEnabled('new-checkout', user)) {
  return newCheckoutFlow()
} else {
  return oldCheckoutFlow()
}

# Branch protection
# - Require PR reviews
# - Require status checks
# - No direct push to main
```

**Detection Pattern:**
- Direct push to main allowed
- No staging environment
- No tests in pipeline
- No approval for production
- 100% traffic immediately

---

## 8. The Terraform State Crisis

**Severity:** Critical

**The Trap:**
Terraform state file on local disk. Someone else runs terraform apply. State conflict. Or: state file gets corrupted. Or: state file has secrets in plain text. Or: running terraform and someone else runs it simultaneously.

**Why It Happens:**
Local state is the default. Remote state setup is "extra work." State locking seems paranoid. Testing locally "just works."

**The Fix:**
```hcl
# WRONG - Local state
# State on your laptop, lost when laptop lost
# No locking, conflicts between team members

# RIGHT - Remote state with locking
terraform {
  backend "s3" {
    bucket         = "company-terraform-state"
    key            = "prod/infrastructure.tfstate"
    region         = "us-east-1"
    encrypt        = true  # Encrypt at rest
    dynamodb_table = "terraform-locks"  # State locking
  }
}

# Create the lock table
resource "aws_dynamodb_table" "terraform_locks" {
  name         = "terraform-locks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}

# State file isolation per environment
# prod/infrastructure.tfstate
# staging/infrastructure.tfstate
# dev/infrastructure.tfstate

# Never manually edit state
# Use: terraform state mv, terraform import, terraform state rm

# Run terraform in CI only
# - No local terraform apply to prod
# - PR triggers plan
# - Merge triggers apply
# - State is authoritative

# .gitignore
*.tfstate
*.tfstate.*
.terraform/
*.tfvars  # Contains secrets
```

**Detection Pattern:**
- `*.tfstate` files in repo
- No remote backend configured
- No state locking
- Multiple people running apply locally

---

## 9. The Exposed Database

**Severity:** Critical

**The Trap:**
Database has public IP. Security group allows 0.0.0.0/0 on port 5432. "It's password protected." Attacker scans the internet, finds your database, brute forces in, downloads everything.

**Why It Happens:**
Need to connect from local machine. "Temporarily" opened for debugging. Didn't understand VPC/networking. Testing convenience.

**The Fix:**
```hcl
# WRONG - Database publicly accessible
resource "aws_db_instance" "main" {
  publicly_accessible = true  # NO!
}

resource "aws_security_group_rule" "db" {
  type        = "ingress"
  from_port   = 5432
  to_port     = 5432
  cidr_blocks = ["0.0.0.0/0"]  # NO!
}

# RIGHT - Database in private subnet
resource "aws_db_instance" "main" {
  publicly_accessible    = false
  db_subnet_group_name   = aws_db_subnet_group.private.name
  vpc_security_group_ids = [aws_security_group.db.id]
}

resource "aws_security_group" "db" {
  vpc_id = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    security_groups = [aws_security_group.app.id]
    # Only app servers can connect
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# For local development access:
# Option 1: VPN
# Option 2: Bastion host
# Option 3: AWS SSM Session Manager
# Option 4: Cloud SQL Proxy (GCP)

# SSH tunnel through bastion
ssh -L 5432:db.internal:5432 bastion.company.com
psql -h localhost

# AWS SSM (no bastion needed)
aws ssm start-session \
  --target i-0123456789 \
  --document-name AWS-StartPortForwardingSession \
  --parameters portNumber=5432,localPortNumber=5432
```

**Detection Pattern:**
- `publicly_accessible = true`
- Security group with 0.0.0.0/0 on DB port
- Database has public IP
- No VPN/bastion for access

---

## 10. The Missing Monitoring

**Severity:** High

**The Trap:**
Customer tweets "your site is down." You didn't know. Check monitoring - there is none. Or: monitoring exists but alerts go to an email nobody reads. Or: alerts are so noisy everyone ignores them.

**Why It Happens:**
"We'll add monitoring later." Testing doesn't need monitoring. Alerts set up once, never tuned. Too many alerts = ignored.

**The Fix:**
```yaml
# Core metrics to monitor (RED method):
# Rate: requests per second
# Errors: error rate percentage
# Duration: latency percentiles

# Prometheus alerting rules
groups:
- name: app-alerts
  rules:
  # Error rate alert
  - alert: HighErrorRate
    expr: |
      sum(rate(http_requests_total{status=~"5.."}[5m]))
      /
      sum(rate(http_requests_total[5m]))
      > 0.05
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"

  # Latency alert
  - alert: HighLatency
    expr: |
      histogram_quantile(0.95,
        sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
      ) > 1
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "95th percentile latency > 1s"

  # Service down
  - alert: ServiceDown
    expr: up == 0
    for: 1m
    labels:
      severity: critical

# Uptime monitoring (external)
# - Pingdom, StatusCake, UptimeRobot
# - Check from multiple regions
# - Alert on SSL expiry

# Alert hygiene:
# - Critical: Page immediately (PagerDuty)
# - Warning: Slack channel, review daily
# - Info: Dashboard only
#
# If alert fires and doesn't need action → delete it
# If alert fires too often → tune threshold or fix issue
# Alert fatigue = ignored alerts = outages

# Runbook for each alert
# What to check, who to contact, how to fix
```

**Detection Pattern:**
- No monitoring dashboard
- No alerting configured
- Alerts go to email only
- Alert:action ratio is low

---

## 11. The Unbacked-Up Database

**Severity:** Critical

**The Trap:**
Database disk fails. Or: ransomware encrypts everything. Or: developer runs DELETE without WHERE. Where's the backup? When was it last tested? Can we actually restore?

**Why It Happens:**
"Cloud provider handles it." Backups are set up but never tested. Backup retention is 1 day. No point-in-time recovery.

**The Fix:**
```hcl
# RIGHT - Automated backups with retention
resource "aws_db_instance" "main" {
  backup_retention_period = 30  # Keep 30 days
  backup_window           = "03:00-04:00"
  copy_tags_to_snapshot   = true

  # Point-in-time recovery
  deletion_protection = true  # Prevent accidents
}

# Additional snapshot before risky operations
resource "aws_db_snapshot" "before_migration" {
  db_instance_identifier = aws_db_instance.main.id
  db_snapshot_identifier = "before-migration-${timestamp()}"
}

# Backup testing - automate quarterly
# 1. Restore snapshot to new instance
# 2. Verify data integrity
# 3. Run application against restored DB
# 4. Measure restore time (RTO)

# Point-in-time recovery test
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier prod-db \
  --target-db-instance-identifier test-restore \
  --restore-time 2024-01-15T12:00:00Z

# Verify with checksums
pg_dump prod-db | md5sum
pg_dump test-restore | md5sum

# Backup strategy:
# - Automated daily snapshots (RDS handles)
# - Transaction log backups for PITR
# - Cross-region replication for DR
# - Regular restore testing
# - Documented restore procedure

# Recovery objectives:
# RTO: How long to restore (target < 1 hour)
# RPO: How much data can you lose (target < 5 minutes)
```

**Detection Pattern:**
- No backup retention configured
- Backups never tested
- No cross-region backup
- No documented restore procedure

---

## 12. The Forgotten Dependency

**Severity:** High

**The Trap:**
Build uses `npm install` with no lockfile. Today it installs 1.2.3, tomorrow 1.2.4 with breaking change. Or: using `:latest` Docker tags. Or: base image gets updated, breaks build. Same code, different results.

**Why It Happens:**
Lock files seem like noise. `:latest` seems like "always up to date." Didn't understand version pinning. Works on my machine.

**The Fix:**
```dockerfile
# WRONG - Latest tag
FROM node:latest
RUN npm install

# RIGHT - Pinned versions
FROM node:20.11.0-alpine3.19

# Copy lockfile first for caching
COPY package.json package-lock.json ./
RUN npm ci  # Not npm install

# Lock file requirements:
# - package-lock.json (npm)
# - yarn.lock (yarn)
# - pnpm-lock.yaml (pnpm)
# - Committed to repo
# - CI fails if lock file out of sync

# npm ci vs npm install:
# npm ci: Uses exact versions from lock file
# npm install: May update lock file

# Dependency updates:
# - Renovate or Dependabot for automated PRs
# - Test before merging
# - Don't auto-merge major versions

# Renovate config
{
  "extends": ["config:base"],
  "packageRules": [
    {
      "matchUpdateTypes": ["minor", "patch"],
      "automerge": true
    },
    {
      "matchUpdateTypes": ["major"],
      "automerge": false
    }
  ]
}

# Docker base image updates:
# - Pin to specific tag (20.11.0, not 20)
# - Subscribe to security updates
# - Rebuild weekly with latest patches
# - Use official images only
```

**Detection Pattern:**
- `:latest` Docker tags
- No lock files committed
- `npm install` instead of `npm ci`
- Random build failures

