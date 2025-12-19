# Patterns: DevOps Engineering

These are the proven approaches that consistently deliver reliable, scalable, and maintainable infrastructure.

---

## 1. The GitOps Pattern

**What It Is:**
Using Git as the single source of truth for infrastructure and application deployments, with automated reconciliation.

**When To Use:**
- Kubernetes deployments
- When you need audit trail
- When you want declarative infrastructure
- When multiple people manage infrastructure

**The Pattern:**

```yaml
# Repository structure
infrastructure/
├── base/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── kustomization.yaml
├── overlays/
│   ├── staging/
│   │   ├── kustomization.yaml
│   │   └── patches/
│   └── production/
│       ├── kustomization.yaml
│       └── patches/
└── apps/
    ├── web/
    ├── api/
    └── worker/

# ArgoCD Application
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: web-production
spec:
  project: default
  source:
    repoURL: https://github.com/company/infrastructure
    targetRevision: main
    path: overlays/production/web
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true

# Workflow:
# 1. Developer changes manifest in Git
# 2. PR reviewed and merged
# 3. ArgoCD detects change
# 4. ArgoCD applies to cluster
# 5. Cluster state matches Git

# Benefits:
# - Git history = deployment history
# - Rollback = git revert
# - Who changed what = git blame
# - PR review for infra changes
# - Cluster can self-heal to desired state

# Flux alternative
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: infrastructure
spec:
  interval: 1m
  url: https://github.com/company/infrastructure
  ref:
    branch: main
```

**Why It Works:**
Git provides version control, audit trail, and collaboration for infrastructure. Automated sync ensures cluster state matches declared state. Drift is automatically corrected.

---

## 2. The 12-Factor App Pattern

**What It Is:**
A methodology for building modern, cloud-native applications that are portable and scalable.

**When To Use:**
- Building new services
- Containerizing existing apps
- Moving to cloud
- When horizontal scaling needed

**The Pattern:**

```
The 12 Factors:

1. Codebase: One codebase, many deploys
   - One repo per app
   - Branches for environments, not separate repos

2. Dependencies: Explicitly declare and isolate
   - package.json, requirements.txt
   - No system-wide packages assumed

3. Config: Store config in environment
   - DATABASE_URL, API_KEYS in env vars
   - Not in code or config files

4. Backing services: Treat as attached resources
   - Database is a URL, swappable
   - Redis, S3, etc. are URLs

5. Build, release, run: Strictly separate stages
   - Build: Create artifact
   - Release: Combine with config
   - Run: Execute in environment

6. Processes: Stateless and share-nothing
   - No sticky sessions
   - No local file storage (use S3)
   - State in database/cache

7. Port binding: Export services via port
   - App is self-contained
   - No external web server needed

8. Concurrency: Scale out via processes
   - Horizontal scaling
   - Multiple instances, not bigger instance

9. Disposability: Fast startup, graceful shutdown
   - Start in seconds
   - Handle SIGTERM gracefully

10. Dev/prod parity: Keep environments similar
    - Same backing services
    - Same versions
    - Same processes

11. Logs: Treat as event streams
    - Write to stdout
    - Aggregation is infrastructure concern

12. Admin processes: Run as one-off processes
    - Migrations, scripts
    - Same codebase, same config
```

```typescript
// Example: Config from environment
const config = {
  database: process.env.DATABASE_URL,
  redis: process.env.REDIS_URL,
  port: parseInt(process.env.PORT || '3000'),
  environment: process.env.NODE_ENV || 'development'
}

// Example: Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...')
  server.close()
  await db.disconnect()
  await redis.quit()
  process.exit(0)
})

// Example: Stateless - use external storage
// WRONG
const sessions = {}  // In-memory, lost on restart

// RIGHT
const sessions = new RedisStore({ client: redis })
```

**Why It Works:**
Applications become portable across cloud providers. Scaling is straightforward. Operations are predictable.

---

## 3. The Blue-Green Deployment Pattern

**What It Is:**
Maintaining two identical production environments, switching traffic between them for zero-downtime deployments.

**When To Use:**
- When zero downtime is required
- When you need instant rollback
- When testing in production-like environment
- When changes are risky

**The Pattern:**

```
Current state:
Load Balancer → Blue (v1) ←── traffic
                Green (v1) ← idle

Deploy new version:
Load Balancer → Blue (v1) ←── traffic
                Green (v2) ← deploy here

Test green:
Run smoke tests against Green
Verify v2 works correctly

Switch traffic:
Load Balancer → Blue (v1) ← idle (keep for rollback)
                Green (v2) ←── traffic

If problems:
Load Balancer → Blue (v1) ←── traffic (instant rollback)
                Green (v2) ← idle
```

```yaml
# AWS ALB with target groups
resource "aws_lb_target_group" "blue" {
  name     = "app-blue"
  port     = 80
  protocol = "HTTP"
  vpc_id   = var.vpc_id
}

resource "aws_lb_target_group" "green" {
  name     = "app-green"
  port     = 80
  protocol = "HTTP"
  vpc_id   = var.vpc_id
}

# Listener switches between groups
resource "aws_lb_listener" "main" {
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"

  default_action {
    type             = "forward"
    target_group_arn = var.active_color == "blue" ?
      aws_lb_target_group.blue.arn :
      aws_lb_target_group.green.arn
  }
}

# Kubernetes with Argo Rollouts
apiVersion: argoproj.io/v1alpha1
kind: Rollout
spec:
  strategy:
    blueGreen:
      activeService: app-active
      previewService: app-preview
      autoPromotionEnabled: false
      prePromotionAnalysis:
        templates:
        - templateName: smoke-tests
```

**Why It Works:**
Traffic switch is instant. Full rollback capability. New version tested with production data/load before receiving traffic.

---

## 4. The Canary Deployment Pattern

**What It Is:**
Gradually rolling out changes to a small subset of users before full deployment.

**When To Use:**
- When you want to limit blast radius
- When testing with real traffic
- When you need metrics-based decisions
- For high-risk changes

**The Pattern:**

```
Stage 1: Deploy to 5%
Load Balancer →  95% → v1 (stable)
                  5% → v2 (canary)

Monitor for 15 minutes:
- Error rate comparison
- Latency comparison
- Business metrics

Stage 2: If healthy, increase to 25%
Load Balancer →  75% → v1
                 25% → v2

Stage 3: Continue to 50%, 100%
Or: Auto-rollback if metrics degrade
```

```yaml
# Kubernetes with Argo Rollouts
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: api
spec:
  replicas: 10
  strategy:
    canary:
      steps:
      - setWeight: 5
      - pause: { duration: 10m }
      - setWeight: 25
      - pause: { duration: 10m }
      - setWeight: 50
      - pause: { duration: 10m }
      - setWeight: 100
      analysis:
        templates:
        - templateName: success-rate
          args:
          - name: service-name
            value: api

# Analysis template
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: success-rate
spec:
  metrics:
  - name: success-rate
    interval: 1m
    successCondition: result[0] >= 0.95
    provider:
      prometheus:
        address: http://prometheus:9090
        query: |
          sum(rate(http_requests_total{
            service="{{args.service-name}}",
            status!~"5.."
          }[5m]))
          /
          sum(rate(http_requests_total{
            service="{{args.service-name}}"
          }[5m]))

# Auto-rollback on failure
failureLimit: 3
```

**Why It Works:**
Issues affect only small percentage of users. Real traffic validation. Automated rollback based on metrics.

---

## 5. The Infrastructure as Code Pattern

**What It Is:**
Managing infrastructure through version-controlled code rather than manual processes.

**When To Use:**
- Always (for production infrastructure)
- When you need reproducibility
- When multiple environments
- When audit trail required

**The Pattern:**

```hcl
# Terraform - declarative infrastructure
# main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket = "company-terraform-state"
    key    = "prod/infrastructure.tfstate"
    region = "us-east-1"
  }
}

# Modules for reusability
module "vpc" {
  source = "./modules/vpc"

  name       = "production"
  cidr_block = "10.0.0.0/16"
  azs        = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

module "eks" {
  source = "./modules/eks"

  cluster_name    = "production"
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnet_ids
  node_count      = 3
  instance_types  = ["t3.large"]
}

module "rds" {
  source = "./modules/rds"

  name               = "production-db"
  engine             = "postgres"
  engine_version     = "15.4"
  instance_class     = "db.r6g.large"
  allocated_storage  = 100
  vpc_id             = module.vpc.vpc_id
  subnet_ids         = module.vpc.private_subnet_ids
}

# Variables for environment differences
# variables.tf
variable "environment" {
  type = string
}

variable "instance_count" {
  type    = number
  default = 2
}

# environments/prod.tfvars
environment    = "production"
instance_count = 5

# environments/staging.tfvars
environment    = "staging"
instance_count = 2

# CI/CD for infrastructure
# .github/workflows/terraform.yml
jobs:
  plan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Terraform Init
        run: terraform init
      - name: Terraform Plan
        run: terraform plan -out=plan.tfplan
      - name: Upload Plan
        uses: actions/upload-artifact@v3
        with:
          name: terraform-plan
          path: plan.tfplan

  apply:
    needs: plan
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production  # Requires approval
    steps:
      - name: Download Plan
        uses: actions/download-artifact@v3
      - name: Terraform Apply
        run: terraform apply plan.tfplan
```

**Why It Works:**
Infrastructure changes are reviewed, versioned, and reproducible. Disaster recovery becomes terraform apply. Environments are consistent.

---

## 6. The Sidecar Pattern

**What It Is:**
Attaching a helper container to your main application container to handle cross-cutting concerns.

**When To Use:**
- Logging and monitoring
- Proxying and service mesh
- Security (mTLS, authentication)
- Configuration and secrets

**The Pattern:**

```yaml
# Sidecar for logging
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: app
    image: my-app:latest
    volumeMounts:
    - name: logs
      mountPath: /var/log/app

  - name: log-shipper
    image: fluent-bit:latest
    volumeMounts:
    - name: logs
      mountPath: /var/log/app
      readOnly: true
    - name: fluent-config
      mountPath: /fluent-bit/etc/

  volumes:
  - name: logs
    emptyDir: {}

# Service mesh sidecar (Istio)
# Automatic injection
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    istio-injection: enabled

# Results in pods with:
# - App container
# - Envoy proxy sidecar (handles mTLS, routing, telemetry)

# Benefits of service mesh:
# - mTLS between services (zero-trust)
# - Traffic management (canary, circuit breaking)
# - Observability (tracing, metrics)
# - Retries and timeouts

# Sidecar for secrets
apiVersion: v1
kind: Pod
spec:
  serviceAccountName: app
  containers:
  - name: app
    image: my-app:latest
    env:
    - name: DB_PASSWORD
      valueFrom:
        secretKeyRef:
          name: db-creds
          key: password

  # Or with HashiCorp Vault agent
  - name: vault-agent
    image: vault:latest
    args:
    - agent
    - -config=/vault/config/agent.hcl
    volumeMounts:
    - name: vault-token
      mountPath: /vault/secrets
```

**Why It Works:**
Cross-cutting concerns are handled uniformly. Application stays focused on business logic. Concerns can be updated independently.

---

## 7. The Circuit Breaker Pattern

**What It Is:**
Preventing cascading failures by quickly failing requests to unhealthy services.

**When To Use:**
- Microservices communication
- External API calls
- When dependencies can fail
- When you want graceful degradation

**The Pattern:**

```yaml
# Istio DestinationRule with circuit breaker
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: payment-service
spec:
  host: payment-service
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        http1MaxPendingRequests: 100
        http2MaxRequests: 1000
    outlierDetection:
      consecutive5xxErrors: 5
      interval: 30s
      baseEjectionTime: 30s
      maxEjectionPercent: 50

# Circuit states:
# CLOSED: Normal operation, requests go through
# OPEN: Failures exceeded threshold, fail fast
# HALF-OPEN: Testing if service recovered

# AWS App Mesh
apiVersion: appmesh.k8s.aws/v1beta2
kind: VirtualNode
spec:
  listeners:
  - portMapping:
      port: 8080
      protocol: http
    outlierDetection:
      maxServerErrors: 5
      interval:
        value: 30
        unit: s
      baseEjectionDuration:
        value: 30
        unit: s
      maxEjectionPercent: 50

# Application level (Node.js with opossum)
const CircuitBreaker = require('opossum')

const breaker = new CircuitBreaker(callPaymentService, {
  timeout: 3000,           // 3 second timeout
  errorThresholdPercentage: 50,  // Open if 50% failures
  resetTimeout: 30000      // Try again after 30 seconds
})

breaker.fallback(() => ({
  status: 'pending',
  message: 'Payment service unavailable, will retry'
}))

breaker.on('open', () => {
  logger.warn('Payment circuit opened')
  metrics.increment('circuit_breaker.open')
})

// Usage
const result = await breaker.fire(paymentData)
```

**Why It Works:**
Failing fast prevents resource exhaustion. Gives dependent services time to recover. Enables graceful degradation.

---

## 8. The Immutable Infrastructure Pattern

**What It Is:**
Never modifying running infrastructure; instead, replacing it with new versions.

**When To Use:**
- Always for production
- When consistency is critical
- When you need rollback capability
- Cloud-native environments

**The Pattern:**

```dockerfile
# Immutable container
FROM node:20.11.0-alpine3.19 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20.11.0-alpine3.19
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER node
CMD ["node", "dist/main.js"]

# No SSH access
# No runtime modification
# No npm install in production
# All changes = new image

# Immutable AMI pipeline
# 1. Base AMI (Amazon Linux)
# 2. Packer builds custom AMI with app
# 3. New deployment = new instances from AMI
# 4. Old instances terminated

# Packer template
source "amazon-ebs" "app" {
  ami_name      = "app-${timestamp()}"
  instance_type = "t3.medium"
  source_ami    = "ami-base"
  ssh_username  = "ec2-user"
}

build {
  sources = ["source.amazon-ebs.app"]

  provisioner "shell" {
    scripts = [
      "scripts/install-deps.sh",
      "scripts/install-app.sh",
      "scripts/harden.sh"
    ]
  }
}

# Benefits:
# - Known state at all times
# - Rollback = deploy previous version
# - No configuration drift
# - Easier security auditing
# - Reproducible environments

# What NOT to do:
# - SSH to production to fix things
# - Install packages on running containers
# - Modify config files in place
# - "Hot patch" production
```

**Why It Works:**
Every deployment is identical. No configuration drift. Rollback is guaranteed to work. Security posture is known.

---

## 9. The Secrets Management Pattern

**What It Is:**
Securely storing, accessing, and rotating sensitive credentials.

**When To Use:**
- Always (for any secrets)
- API keys, database passwords, certificates
- When compliance requires audit trail
- When secrets need rotation

**The Pattern:**

```yaml
# AWS Secrets Manager
resource "aws_secretsmanager_secret" "db_creds" {
  name = "production/database/credentials"

  # Automatic rotation
  rotation_lambda_arn = aws_lambda_function.rotate.arn
  rotation_rules {
    automatically_after_days = 30
  }
}

# Access from application
const { SecretsManager } = require('@aws-sdk/client-secrets-manager')

async function getDbCredentials() {
  const client = new SecretsManager({ region: 'us-east-1' })
  const response = await client.getSecretValue({
    SecretId: 'production/database/credentials'
  })
  return JSON.parse(response.SecretString)
}

# Kubernetes External Secrets
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-credentials
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: SecretStore
  target:
    name: db-credentials
  data:
  - secretKey: password
    remoteRef:
      key: production/database/credentials
      property: password

# HashiCorp Vault
# Dynamic secrets - generated on demand
path "database/creds/app-role" {
  capabilities = ["read"]
}

# App requests credentials
vault read database/creds/app-role
# Returns: username/password valid for 1 hour

# Secret lifecycle:
# 1. Store in secrets manager (not git)
# 2. Application reads at runtime
# 3. Cache with short TTL
# 4. Automatic rotation
# 5. Audit all access

# Never:
# - Commit secrets to git
# - Log secrets
# - Pass in command line (visible in ps)
# - Store in environment file in repo
```

**Why It Works:**
Secrets are encrypted at rest and in transit. Access is audited. Rotation is automated. Principle of least privilege enforced.

---

## 10. The Observability Stack Pattern

**What It Is:**
Implementing the three pillars of observability: logs, metrics, and traces.

**When To Use:**
- All production systems
- When troubleshooting is needed
- When SLOs must be measured
- Distributed systems

**The Pattern:**

```yaml
# Prometheus for metrics
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: api
spec:
  selector:
    matchLabels:
      app: api
  endpoints:
  - port: metrics
    interval: 15s

# Key metrics to collect (RED method):
# Rate: requests per second
# Errors: error rate
# Duration: latency percentiles

# Application metrics
const promClient = require('prom-client')

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5]
})

app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer()
  res.on('finish', () => {
    end({ method: req.method, route: req.path, status: res.statusCode })
  })
  next()
})

# Grafana dashboards
# - Request rate
# - Error rate
# - P50, P95, P99 latency
# - Resource utilization

# Distributed tracing with OpenTelemetry
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node')
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger')

const provider = new NodeTracerProvider()
provider.addSpanProcessor(
  new SimpleSpanProcessor(new JaegerExporter())
)
provider.register()

# Trace context propagation
# Request → Service A → Service B → Service C
# All spans linked by trace ID

# Alerting rules
groups:
- name: slo-alerts
  rules:
  - alert: HighErrorRate
    expr: |
      sum(rate(http_requests_total{status=~"5.."}[5m]))
      /
      sum(rate(http_requests_total[5m]))
      > 0.01
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: Error rate > 1%

  - alert: HighLatency
    expr: |
      histogram_quantile(0.99,
        sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
      ) > 2
    for: 5m
    labels:
      severity: warning
```

**Why It Works:**
Logs tell you what happened. Metrics tell you how much. Traces tell you the flow. Together, you can diagnose any issue.

