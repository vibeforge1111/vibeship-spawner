# Decisions: DevOps Engineering

Critical decision points that determine infrastructure success.

---

## Decision 1: Cloud Provider Selection

**Context:** When choosing where to run your infrastructure.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **AWS** | Largest ecosystem, most services, hiring pool | Complex, can be expensive | Enterprise, complex needs, most use cases |
| **GCP** | Great DX, Kubernetes origin, data/ML | Smaller ecosystem, fewer regions | Kubernetes-heavy, data/ML focus |
| **Azure** | Microsoft integration, enterprise | Confusing pricing, slower innovation | Microsoft shop, hybrid cloud |
| **Cloudflare** | Edge computing, simple, generous free | Fewer services, newer | Edge-first, simple needs, global distribution |
| **Vercel/Railway** | Developer-first, simple, fast | Less control, vendor lock-in | Small team, Node.js apps, fast iteration |

**Framework:**
```
Decision factors:

Team expertise?
├── Strong AWS → Stay AWS
├── Strong GCP → Stay GCP
└── No strong preference → Continue

Application type?
├── Traditional web app → Any major cloud
├── Kubernetes-heavy → GCP (GKE is best)
├── Data/ML → GCP or AWS
├── Edge/JAMstack → Cloudflare + Vercel
└── Enterprise/.NET → Azure

Budget and complexity tolerance?
├── Optimize for simplicity → Vercel/Railway
├── Optimize for cost → Careful AWS/GCP
├── Optimize for features → AWS

Compliance requirements?
├── Specific regions needed → Check provider availability
├── Specific certifications → Check compliance offerings
└── No special needs → Any

Multi-cloud is usually a mistake:
- Operational complexity doubles
- Expertise spread thin
- Lowest common denominator
- Only valid for specific DR requirements
```

**Default Recommendation:** AWS for most production workloads (largest ecosystem, most proven). Vercel/Railway for early stage/simple apps (faster iteration). Cloudflare Workers for edge computing.

---

## Decision 2: Container Orchestration

**Context:** When deciding how to run containerized applications.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Kubernetes** | Standard, powerful, ecosystem | Complex, overhead | Large team, complex needs, multi-team |
| **ECS/Fargate** | Simpler than K8s, AWS integrated | AWS lock-in | AWS shop, simpler needs |
| **Cloud Run/App Engine** | Serverless, simple | Less control | Simple apps, variable traffic |
| **Docker Compose** | Simple, local-friendly | Not production-grade | Development, small projects |
| **No containers** | Simplest | Manual scaling | Very small, PaaS can handle |

**Framework:**
```
Container orchestration decision:

Team size and expertise?
├── < 5 engineers, no K8s experience → Skip Kubernetes
├── 5-20 engineers → Consider managed Kubernetes
└── > 20 engineers → Kubernetes probably makes sense

Application complexity?
├── Monolith or few services → Simpler options fine
├── Many microservices → Kubernetes helps
└── Serverless-friendly → Cloud Run/Lambda

Managed vs self-managed Kubernetes:
Always managed (EKS, GKE, AKS) unless:
- Specific compliance requirements
- Edge/on-prem deployment
- Cost optimization at massive scale

If using Kubernetes:
- Start with managed
- Use GitOps (ArgoCD/Flux)
- Invest in developer experience
- Platform team to abstract complexity

Simpler alternatives:
- Vercel, Railway, Render (PaaS)
- Cloud Run (containers, no orchestration)
- ECS Fargate (AWS, simpler than K8s)
```

**Default Recommendation:** Don't use Kubernetes until you need it. ECS Fargate or Cloud Run for simpler container orchestration. Kubernetes only when you have the team and complexity to justify it.

---

## Decision 3: CI/CD Platform

**Context:** When choosing your continuous integration and delivery platform.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **GitHub Actions** | Integrated, marketplace, simple | GitHub-only | GitHub repos, simple to medium complexity |
| **GitLab CI** | Integrated, self-hosted option | GitLab ecosystem | GitLab repos, self-hosted needs |
| **CircleCI** | Powerful, good caching, orbs | Cost at scale, separate system | Complex builds, parallel execution |
| **Jenkins** | Customizable, self-hosted | Maintenance burden, dated | Legacy, specific plugins needed |

**Framework:**
```
CI/CD selection:

Where is your code?
├── GitHub → GitHub Actions (simplest)
├── GitLab → GitLab CI (simplest)
├── Self-hosted → GitLab CI or Jenkins

Build complexity?
├── Simple (npm build, docker) → GitHub Actions
├── Complex (custom tools, long builds) → CircleCI
├── Very custom → Jenkins (reluctantly)

Self-hosted runners needed?
├── Yes → GitHub Actions, GitLab CI, Jenkins
└── No → Any

Cost sensitivity?
├── Very → GitHub Actions (generous free)
├── Medium → CircleCI (pay for what you use)
└── Not → Any

GitHub Actions is the default:
- Most projects on GitHub
- Generous free tier
- Large marketplace
- Good enough for most

# Best practices (any platform):
# - Fast feedback (< 10 min builds)
# - Cache dependencies
# - Parallel where possible
# - Separate build and deploy
# - Environment protection
```

**Default Recommendation:** GitHub Actions. It's where your code is, it's simple, and it's good enough for 90% of use cases. Only use alternatives with specific justification.

---

## Decision 4: Infrastructure as Code Tool

**Context:** When choosing how to define your infrastructure.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Terraform** | Standard, multi-cloud, huge ecosystem | HCL learning curve, state management | Most production infrastructure |
| **Pulumi** | Real languages, better DX | Smaller ecosystem | Team prefers TypeScript/Python |
| **CDK** | AWS native, TypeScript | AWS-only | All-in on AWS, complex infra |
| **CloudFormation** | AWS native, no state to manage | Verbose, AWS-only | Simple AWS, avoiding Terraform |

**Framework:**
```
IaC tool selection:

Multi-cloud requirement?
├── Yes → Terraform
└── No → Continue

Team's language preferences?
├── Prefer YAML/DSL → Terraform
├── Prefer TypeScript → Pulumi or CDK
├── Prefer Python → Pulumi

AWS-only?
├── Yes, and simple → CloudFormation acceptable
├── Yes, and complex → CDK or Terraform
└── No → Terraform

Terraform specifics:
- Use remote state (S3 + DynamoDB)
- Use modules for reusability
- Use workspaces or directories for environments
- Pin provider versions

Module structure:
terraform/
├── modules/
│   ├── vpc/
│   ├── eks/
│   └── rds/
├── environments/
│   ├── dev/
│   ├── staging/
│   └── production/
└── global/
    └── iam/
```

**Default Recommendation:** Terraform. It's the industry standard, has the largest ecosystem, and works everywhere. Only use alternatives with specific justification (Pulumi if team really wants TypeScript, CDK if deep AWS integration needed).

---

## Decision 5: Monitoring Stack

**Context:** When choosing your observability platform.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Datadog** | Full platform, great UX, APM | Expensive at scale | Budget available, want single platform |
| **Prometheus + Grafana** | Open source, Kubernetes native | Self-managed, steeper curve | Cost-sensitive, K8s, OSS preference |
| **CloudWatch** | AWS native, integrated | Limited features, AWS-only | Simple AWS apps |
| **New Relic** | Good APM, full platform | Expensive, complex | APM focus, .NET apps |

**Framework:**
```
Monitoring decision:

Budget?
├── $0-$500/mo → Prometheus + Grafana, CloudWatch
├── $500-$5000/mo → Consider Datadog
└── $5000+/mo → Datadog or managed Prometheus

Team expertise?
├── Can manage Prometheus → Self-hosted viable
└── Want managed → Datadog, Grafana Cloud

Key requirements:
- Metrics → All options
- Logs → Datadog, ELK, Loki
- Traces → Datadog, Jaeger, Zipkin
- APM → Datadog, New Relic

Minimum viable observability:
1. Metrics: Prometheus (or CloudWatch)
2. Logs: Loki (or CloudWatch)
3. Traces: Jaeger (or skip initially)
4. Dashboards: Grafana
5. Alerting: Prometheus Alertmanager

# Or just use Datadog if budget allows
# It's simpler and covers everything
```

**Default Recommendation:** Prometheus + Grafana for cost-sensitive/K8s environments. Datadog if budget allows (the time savings justify cost). CloudWatch only for simple AWS apps.

---

## Decision 6: Secrets Management

**Context:** When choosing how to manage sensitive credentials.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Cloud native (AWS SM, GCP SM)** | Integrated, managed, rotation | Vendor lock-in | Single cloud, simple needs |
| **HashiCorp Vault** | Feature-rich, multi-cloud, dynamic secrets | Complex to operate | Multi-cloud, dynamic secrets needed |
| **SOPS/sealed-secrets** | Git-friendly, simple | Limited features | GitOps, static secrets |
| **Environment variables** | Simple | Not secure at rest | Development only |

**Framework:**
```
Secrets management decision:

Multi-cloud or on-prem?
├── Yes → Vault (or cloud-agnostic)
└── No → Cloud native is simpler

Dynamic secrets needed?
├── Yes (DB creds on-demand) → Vault
└── No → Cloud native fine

GitOps workflow?
├── Yes → SOPS or External Secrets Operator
└── No → Any

Minimum requirements:
1. Secrets encrypted at rest
2. Access audited
3. Rotation possible (automated preferred)
4. Application doesn't need restart for new secrets

# AWS Secrets Manager is good default for AWS
# - Automatic rotation for RDS
# - IAM-based access
# - Audit in CloudTrail

# External Secrets Operator for Kubernetes
# - Syncs cloud secrets to K8s secrets
# - Single source of truth
# - Works with any cloud
```

**Default Recommendation:** Use your cloud provider's secrets manager (AWS Secrets Manager, GCP Secret Manager). Vault only for multi-cloud or advanced dynamic secrets requirements. Never store secrets in environment files in repos.

---

## Decision 7: Deployment Strategy

**Context:** When choosing how to deploy changes to production.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Rolling update** | Simple, no extra resources | Slow rollback, mixed versions | Default for most deployments |
| **Blue-green** | Instant switch, full rollback | Double resources | Zero downtime critical |
| **Canary** | Limited blast radius, metrics-driven | Complex, needs good monitoring | High-traffic, risky changes |
| **Recreate** | Simple, clean | Downtime | Acceptable downtime, simple apps |

**Framework:**
```
Deployment strategy selection:

Downtime acceptable?
├── Yes → Recreate (simplest)
└── No → Continue

Instant rollback needed?
├── Yes → Blue-green
└── No → Rolling update

High traffic with risky changes?
├── Yes → Canary
└── No → Rolling update

Kubernetes deployment strategies:

# Rolling (default)
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 25%
    maxUnavailable: 0

# Recreate (downtime OK)
strategy:
  type: Recreate

# Blue-green (with Argo Rollouts)
strategy:
  blueGreen:
    activeService: app-active
    previewService: app-preview
    autoPromotionEnabled: false

# Canary (with Argo Rollouts)
strategy:
  canary:
    steps:
    - setWeight: 5
    - pause: { duration: 10m }
    - setWeight: 25
    - pause: { duration: 10m }
    - setWeight: 100

Progressive delivery:
1. Start with rolling updates
2. Add blue-green for critical services
3. Add canary for high-traffic + risky changes
4. Add feature flags for fine-grained control
```

**Default Recommendation:** Rolling updates for most services. Blue-green for services where instant rollback is critical. Canary for high-traffic services where you want gradual rollout with metrics validation.

---

## Decision 8: Database Hosting

**Context:** When choosing where and how to run your database.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Managed (RDS, Cloud SQL)** | Automated backups, patches, HA | Cost, less control | Most production databases |
| **Self-managed on VMs** | Control, cost at scale | Operational burden | Specific requirements, expertise |
| **Self-managed on K8s** | Portable, declarative | Very complex, risky | Specific use cases only |
| **Serverless (Aurora, PlanetScale)** | Auto-scaling, pay-per-use | Cost unpredictable, vendor lock-in | Variable workloads |

**Framework:**
```
Database hosting decision:

Operational expertise?
├── DBA on team → Self-managed viable
└── No DBA → Managed is safer

Specific requirements?
├── Custom extensions/config → May need self-managed
└── Standard setup → Managed works

Cost sensitivity vs. risk?
├── Cost priority → Self-managed (with expertise)
└── Reliability priority → Managed

Kubernetes for databases?
├── Stateless caches (Redis) → OK
├── Ephemeral/dev databases → OK
└── Production persistent → Generally avoid

# Why managed databases:
# - Automated backups
# - Point-in-time recovery
# - High availability / Multi-AZ
# - Automated patches
# - Monitoring built-in
# - Read replicas easy

# Managed database setup
resource "aws_db_instance" "main" {
  engine               = "postgres"
  engine_version       = "15.4"
  instance_class       = "db.r6g.large"
  allocated_storage    = 100
  storage_encrypted    = true
  multi_az             = true  # HA
  deletion_protection  = true
  backup_retention     = 30
  monitoring_interval  = 60
  performance_insights = true
}
```

**Default Recommendation:** Managed databases (RDS, Cloud SQL) for production. The operational burden of self-managing databases is rarely worth it. Self-manage only with DBA expertise and specific requirements.

---

## Decision 9: Log Aggregation

**Context:** When choosing where to send and analyze logs.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **CloudWatch Logs** | AWS integrated, simple | Limited querying, cost at scale | Simple AWS apps |
| **ELK (Elasticsearch)** | Powerful, open source | Complex to operate, resource hungry | Self-hosted, complex queries |
| **Loki + Grafana** | Lightweight, Kubernetes native | Less powerful than ELK | Kubernetes, cost-sensitive |
| **Datadog Logs** | Full platform, easy | Expensive | Already using Datadog |

**Framework:**
```
Log aggregation decision:

Already using Datadog?
├── Yes → Datadog Logs (unified platform)
└── No → Continue

Kubernetes-native preference?
├── Yes → Loki + Grafana
└── No → Continue

Complex log analysis needed?
├── Yes → ELK (or managed equivalent)
└── No → Loki or CloudWatch

Cost sensitivity?
├── High → Loki (efficient)
├── Medium → CloudWatch
└── Low → Datadog or ELK

# Loki advantages:
# - Labels like Prometheus (consistent)
# - Doesn't index content (cheap)
# - Integrates with Grafana
# - Good enough for most

# ELK when you need:
# - Full-text search
# - Complex aggregations
# - Log analytics/dashboards

Log shipping pattern:
App → stdout → Container runtime → Log shipper → Aggregator

# Fluent Bit (lightweight shipper)
# Fluentd (powerful, more features)
```

**Default Recommendation:** Loki + Grafana for Kubernetes environments. CloudWatch for simple AWS apps. Datadog if already using their platform. ELK only for complex log analytics requirements.

---

## Decision 10: CDN and Edge

**Context:** When choosing how to serve static content and handle edge computing.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Cloudflare** | Great free tier, Workers, security | Some feature lock-in | Most websites, edge computing |
| **AWS CloudFront** | AWS integration, Lambda@Edge | More complex, AWS-only | AWS-heavy stack |
| **Fastly** | Real-time purging, VCL power | Expensive, complex | High customization needs |
| **Vercel Edge** | Integrated with Vercel, simple | Vercel ecosystem | Using Vercel |

**Framework:**
```
CDN selection:

Edge computing needed?
├── Yes → Cloudflare Workers or Lambda@Edge
└── No → Any CDN works

DDoS protection priority?
├── Yes → Cloudflare (excellent)
└── No → Any

AWS integration priority?
├── Yes → CloudFront + WAF
└── No → Cloudflare (simpler)

Real-time purging needed?
├── Yes → Fastly
└── No → Any

# Cloudflare is excellent default:
# - Generous free tier
# - Great performance
# - DDoS protection included
# - Workers for edge computing
# - Easy setup

# Edge use cases:
# - A/B testing at edge
# - Geolocation routing
# - Authentication at edge
# - Bot protection
# - Response modification

# Basic Cloudflare setup:
# 1. Add site to Cloudflare
# 2. Update DNS to Cloudflare
# 3. Enable SSL (flexible or full)
# 4. Enable caching
# 5. Add page rules as needed
```

**Default Recommendation:** Cloudflare for most use cases. The free tier is generous, the performance is excellent, and Workers enable edge computing. CloudFront only if deeply invested in AWS.

