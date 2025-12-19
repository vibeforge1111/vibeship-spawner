# Anti-Patterns: DevOps Engineering

These approaches look like reasonable infrastructure practices but consistently lead to outages, security incidents, and operational nightmares.

---

## 1. The ClickOps Chaos

**The Mistake:**
```
"Let me just quickly create this security group in the console..."
"I'll just update the load balancer settings manually..."
"Added a new IAM role through the UI for testing..."

Result: Configuration drift, undocumented changes,
can't recreate environment, audit nightmare
```

**Why It's Wrong:**
- No version control for changes
- Can't recreate environments
- No review process
- Drift between environments
- Impossible to audit

**The Fix:**
```hcl
# Everything in Terraform/Pulumi
# Even "quick" changes

resource "aws_security_group" "web" {
  name        = "web-sg"
  description = "Web server security group"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "web-sg"
    Environment = var.environment
    Terraform   = "true"
  }
}

# Detect drift
terraform plan  # Shows any manual changes

# AWS Config rules to detect non-IaC resources
resource "aws_config_config_rule" "required_tags" {
  name = "required-tags"
  source {
    owner             = "AWS"
    source_identifier = "REQUIRED_TAGS"
  }
  input_parameters = jsonencode({
    tag1Key = "Terraform"
  })
}

# All infrastructure changes through PR
# No AWS console access except for read-only
```

---

## 2. The Everything-in-One-Pipeline

**The Mistake:**
```yaml
# One giant pipeline
jobs:
  build-test-deploy-everything:
    steps:
      - checkout
      - npm install
      - npm test
      - npm build
      - docker build frontend
      - docker build backend
      - docker build worker
      - docker push frontend
      - docker push backend
      - docker push worker
      - terraform apply infra
      - kubectl apply frontend
      - kubectl apply backend
      - kubectl apply worker
      - run e2e tests
      - notify slack

# Takes 45 minutes
# Fails somewhere in the middle
# Which part failed? Who knows
```

**Why It's Wrong:**
- Long feedback loops
- Unclear failure points
- Can't retry individual steps
- Blocks everything on one failure
- No parallelization

**The Fix:**
```yaml
# Separate, focused pipelines

# Build pipeline
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm test

  build:
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      - run: npm run build
      - run: docker build -t app:${{ github.sha }}
      - run: docker push app:${{ github.sha }}

# Deploy pipeline (separate)
name: Deploy
on:
  workflow_dispatch:  # Manual trigger
  push:
    tags: ['v*']

jobs:
  deploy-staging:
    steps:
      - run: kubectl apply -k overlays/staging

  smoke-test:
    needs: deploy-staging
    steps:
      - run: ./smoke-tests.sh staging

  deploy-production:
    needs: smoke-test
    environment: production  # Requires approval
    steps:
      - run: kubectl apply -k overlays/production

# Infrastructure pipeline (completely separate)
name: Infrastructure
on:
  push:
    paths: ['terraform/**']
```

---

## 3. The Shared Credentials

**The Mistake:**
```
# .aws/credentials on shared machine
[default]
aws_access_key_id = AKIA...
aws_secret_access_key = ...

# Everyone uses the same key
# Key has admin access
# Been there for 3 years
# Who created it? Nobody knows
```

**Why It's Wrong:**
- No accountability
- Can't revoke one person
- Lateral movement risk
- No audit trail
- Credential rotation nightmare

**The Fix:**
```yaml
# Individual IAM users with MFA
resource "aws_iam_user" "developer" {
  name = "john.doe"

  # Require MFA for console
  # Require MFA for CLI (assume role)
}

# Role-based access
resource "aws_iam_role" "developer" {
  name = "developer-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::123456789012:root"
        }
        Action = "sts:AssumeRole"
        Condition = {
          Bool = {
            "aws:MultiFactorAuthPresent": "true"
          }
        }
      }
    ]
  })
}

# CI/CD uses short-lived credentials
# GitHub Actions OIDC
jobs:
  deploy:
    permissions:
      id-token: write
      contents: read
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/github-deploy
          aws-region: us-east-1

# No long-lived credentials anywhere
# - AWS: OIDC federation
# - GCP: Workload identity
# - Azure: Managed identity
```

---

## 4. The Orphaned Resources

**The Mistake:**
```
# 6 months later...
"Why do we have 47 EBS volumes not attached to anything?"
"What is this load balancer for? It costs $200/month"
"There are 200 unused elastic IPs"
"Our CloudWatch bill is $3000/month and nobody knows why"
```

**Why It's Wrong:**
- Wasted money (often thousands)
- Security risk (forgotten services)
- Confusion about what's used
- Makes cleanup harder over time

**The Fix:**
```hcl
# Tag EVERYTHING
locals {
  common_tags = {
    Environment = var.environment
    Project     = var.project_name
    Owner       = "platform-team"
    ManagedBy   = "terraform"
    CostCenter  = "engineering"
  }
}

resource "aws_instance" "web" {
  # ... config ...
  tags = merge(local.common_tags, {
    Name = "web-${var.environment}"
  })
}

# AWS Cost Explorer queries by tag
# Find untagged resources

# Automated cleanup
# AWS Janitor / Cloud Custodian
policies:
  - name: delete-unused-volumes
    resource: ebs
    filters:
      - State: available
      - "tag:Environment": absent
    actions:
      - delete

# Regular audit
# Weekly: Review unused resources
# Monthly: Check untagged resources
# Quarterly: Full resource audit

# Terraform state list
# If it's not in state, should it exist?

# AWS Config for compliance
resource "aws_config_config_rule" "required_tags" {
  name = "required-tags"
  source {
    owner             = "AWS"
    source_identifier = "REQUIRED_TAGS"
  }
  input_parameters = jsonencode({
    tag1Key = "Environment"
    tag2Key = "Project"
    tag3Key = "Owner"
  })
}
```

---

## 5. The Alert Avalanche

**The Mistake:**
```
# Slack channel with 500 alerts per day
# Everyone has notifications muted
# Real incidents lost in noise

@here CPU > 50% on server-1
@here Memory > 60% on server-2
@here Disk > 40% on server-3
@here API latency > 100ms
@here 1 error in logs
@here SSL cert expires in 90 days
... x500
```

**Why It's Wrong:**
- Alert fatigue = ignored alerts
- Real incidents missed
- Team burned out
- False sense of monitoring
- Wasted time acknowledging noise

**The Fix:**
```yaml
# Alert hierarchy
# Critical: Page immediately (production down)
# Warning: Review during business hours
# Info: Dashboard only

# Rules for alerts:
# 1. Alert must be actionable
# 2. If you can't act on it, don't alert
# 3. If it fires daily, fix it or delete it

# Critical (page):
- alert: ServiceDown
  expr: up == 0
  for: 2m
  labels:
    severity: critical
  annotations:
    runbook: "https://wiki/runbooks/service-down"

# Warning (Slack, business hours):
- alert: HighLatency
  expr: |
    histogram_quantile(0.99, http_request_duration_seconds) > 2
  for: 10m
  labels:
    severity: warning

# No alert, just dashboard:
# - CPU usage (unless sustained > 90%)
# - Memory usage (unless OOM)
# - Normal traffic patterns

# SLO-based alerting
# Alert when SLO burn rate is high
- alert: HighErrorBudgetBurn
  expr: |
    (
      slo:error_budget_remaining:ratio < 0.1
    ) and (
      slo:error_budget_burn_rate:1h > 10
    )
  for: 5m
  labels:
    severity: critical

# Every alert needs:
# 1. Runbook link
# 2. Expected frequency
# 3. Owner
# 4. Review date
```

---

## 6. The Pet Server

**The Mistake:**
```
# "The" production server
# Named: "old-faithful"
# Created 4 years ago
# Has been patched, modified, tuned
# Nobody knows what's installed
# If it dies, we're dead
# Backup? What backup?
```

**Why It's Wrong:**
- Single point of failure
- Can't reproduce
- Security patches scary
- Scaling impossible
- Documentation = server state

**The Fix:**
```
Cattle, not pets:

# Servers are numbered, not named
web-1, web-2, web-3

# Any server can be killed and replaced
# State is external (database, S3)
# Configuration is in code

# Immutable infrastructure
# - Never SSH to production to fix
# - Never install packages manually
# - All changes = new deployment

# Auto-healing
apiVersion: apps/v1
kind: Deployment
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: app
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
        # Kubernetes restarts unhealthy pods

# Auto-scaling
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70

# Chaos engineering
# Regularly kill servers to verify resilience
# Netflix Chaos Monkey approach
```

---

## 7. The Environment Sprawl

**The Mistake:**
```
Environments:
- dev1, dev2, dev3, dev4
- feature-branch-x
- john-test
- staging
- staging-2
- qa
- uat
- pre-prod
- prod

# Nobody remembers what each is for
# Configuration differs between all
# "Works in dev1" doesn't mean anything
```

**Why It's Wrong:**
- Maintenance nightmare
- Configuration drift
- Unclear path to production
- Wasted resources
- Different problems in each env

**The Fix:**
```
# Three environments (maximum)
# Dev → Staging → Production

# Development
# - Developers local or shared
# - Quick iteration
# - May have mocked services

# Staging
# - Mirror of production
# - Same infrastructure, smaller scale
# - Production data (anonymized)
# - Gate for production deploy

# Production
# - The real thing

# Same infrastructure code, different values
# terraform/
# ├── modules/          # Shared modules
# ├── environments/
# │   ├── dev/
# │   ├── staging/
# │   └── production/

# Feature flags instead of environments
# Test features in production
if (featureFlags.enabled('new-checkout', user)) {
  return newCheckout()
} else {
  return oldCheckout()
}

# Preview environments (ephemeral)
# Per-PR environments that auto-delete
# Vercel, Railway do this automatically
```

---

## 8. The Unmonitored Dependency

**The Mistake:**
```
# Application dependencies:
# - PostgreSQL ✓ monitored
# - Redis ✓ monitored
# - S3 ✓ monitored
# - Stripe API ✗ not monitored
# - SendGrid ✗ not monitored
# - Auth0 ✗ not monitored

# Stripe is down
# Users can't checkout
# No alert
# Find out from Twitter
```

**Why It's Wrong:**
- External failures affect your users
- No visibility into third-party health
- Incident response delayed
- SLA depends on dependencies

**The Fix:**
```yaml
# Monitor external dependencies

# Health check job
apiVersion: batch/v1
kind: CronJob
spec:
  schedule: "* * * * *"  # Every minute
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: health-check
            image: curlimages/curl
            command:
            - /bin/sh
            - -c
            - |
              curl -f https://api.stripe.com/v1/health || exit 1
              curl -f https://api.sendgrid.com/v3/health || exit 1

# Prometheus blackbox exporter
modules:
  http_2xx:
    prober: http
    http:
      preferred_ip_protocol: "ip4"

scrape_configs:
  - job_name: 'external-apis'
    metrics_path: /probe
    params:
      module: [http_2xx]
    static_configs:
      - targets:
        - https://api.stripe.com/v1/health
        - https://api.sendgrid.com/v3/health
        - https://auth0.com/health
    relabel_configs:
      - source_labels: [__address__]
        target_label: __param_target
      - source_labels: [__param_target]
        target_label: instance

# Alert on external failure
- alert: ExternalAPIDown
  expr: probe_success == 0
  for: 2m
  labels:
    severity: critical
  annotations:
    summary: "External API {{ $labels.instance }} is down"

# Subscribe to status pages
# - status.stripe.com
# - status.sendgrid.com
# RSS feed to Slack
```

---

## 9. The Flat Network

**The Mistake:**
```
# Everything in one subnet
# Database has public IP
# All services can talk to all services
# No network segmentation

Web server → Database (direct)
Web server → Admin panel (direct)
Random container → Database (whoops)
```

**Why It's Wrong:**
- No defense in depth
- Lateral movement is trivial
- Database shouldn't be reachable from web
- Blast radius = everything

**The Fix:**
```hcl
# Network segmentation
# Public subnet: Load balancers only
# Private subnet: Application servers
# Data subnet: Databases, caches

resource "aws_subnet" "public" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "us-east-1a"

  tags = { Name = "public" }
}

resource "aws_subnet" "private" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "us-east-1a"

  tags = { Name = "private-app" }
}

resource "aws_subnet" "data" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.3.0/24"
  availability_zone = "us-east-1a"

  tags = { Name = "private-data" }
}

# Security groups with minimal access
resource "aws_security_group" "db" {
  vpc_id = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    security_groups = [aws_security_group.app.id]
    # Only app servers, not entire VPC
  }

  # No egress except responses
}

# Kubernetes network policies
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: db-policy
spec:
  podSelector:
    matchLabels:
      app: database
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: api
    ports:
    - port: 5432
```

---

## 10. The Manual Scaling

**The Mistake:**
```
# Friday 5pm
"Traffic spike incoming, need to scale up"
*SSH to server*
*Manually add instances*
*Forget to scale down*
*$10,000 bill*

# Or:
# Traffic spike
# Nobody available to scale
# Site goes down
```

**Why It's Wrong:**
- Human bottleneck
- Slow response to load
- Error-prone
- Expensive (over-provision) or unreliable (under-provision)
- Doesn't work at 3am

**The Fix:**
```yaml
# Auto-scaling based on metrics

# Kubernetes HPA
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15

# AWS Auto Scaling
resource "aws_autoscaling_group" "web" {
  min_size         = 2
  max_size         = 20
  desired_capacity = 2

  target_tracking_scaling_policy {
    predefined_metric_type = "ASGAverageCPUUtilization"
    target_value          = 70.0
  }
}

# Predictive scaling for known patterns
# - Scale up before expected traffic (marketing campaign)
# - Scale based on queue depth
# - Scale based on custom metrics (active users)

# Cost guardrails
# - Max replicas limit
# - Budget alerts
# - Spot instances for burst capacity
```

