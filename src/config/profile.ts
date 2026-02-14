import avatarUrl from "../assets/profile/profile-avatar.jpg";

export type ProfileLink = {
  label: string;
  href: string;
  icon: "github" | "mail" | "server" | "globe";
};

export type ProfileProject = {
  name: string;
  description: string;
  href?: string;
  images: string[];
  stack: string[];
};

export type ProfileExperience = {
  company: string;
  role: string;
  period: string;
  location: string;
  logoUrl?: string;
  current?: boolean;
  summary: string;
  responsibilities: string[];
};

export type ProfileSkill = {
  name: string;
  level: number;
  levelLabel: string;
  detail: string;
  icon:
    | "architecture"
    | "database"
    | "performance"
    | "observability"
    | "devops"
    | "security";
};

export type Profile = {
  name: string;
  title: string;
  location: string;
  avatarUrl?: string;
  motto: string;
  quote: string;
  bio: string;
  focus: string[];
  hobbies: string[];
  links: ProfileLink[];
  skills: ProfileSkill[];
  projects: ProfileProject[];
  experiences: ProfileExperience[];
};

export const profile: Profile = {
  name: "沉默的老李",
  title: "后端开发工程师",
  location: "中国 · 上海",
  avatarUrl,
  motto: "保持好奇，持续构建。",
  quote: "写代码是为了让复杂的系统变得可理解、可演化。",
  bio: "我专注于高并发服务、分布式系统与稳定性建设，喜欢把复杂的业务拆解成清晰的领域模型，并通过工程化手段持续提升交付效率与系统可靠性。",
  focus: ["分布式架构", "服务治理", "性能调优", "开发者体验"],
  hobbies: ["徒步与旅行", "机械键盘", "写技术随笔", "咖啡"],
  links: [
    { label: "GitHub", href: "https://github.com/refinex-lab", icon: "github" },
    { label: "邮箱", href: "mailto:hello@refinex.dev", icon: "mail" },
    { label: "博客", href: "https://refinex.dev", icon: "globe" },
    { label: "服务状态", href: "https://status.refinex.dev", icon: "server" },
  ],
  skills: [
    {
      name: "分布式架构",
      level: 90,
      levelLabel: "精通",
      detail: "具备复杂系统拆分与演进经验，擅长领域建模与服务治理。",
      icon: "architecture",
    },
    {
      name: "数据层设计",
      level: 88,
      levelLabel: "精通",
      detail: "熟悉事务一致性、索引优化与冷热数据分层策略。",
      icon: "database",
    },
    {
      name: "性能与稳定性",
      level: 86,
      levelLabel: "熟练",
      detail: "在高并发与降级策略方面有实践，持续关注尾延迟优化。",
      icon: "performance",
    },
    {
      name: "可观测性",
      level: 84,
      levelLabel: "熟练",
      detail: "搭建统一的日志、指标与链路平台，提升问题定位效率。",
      icon: "observability",
    },
    {
      name: "DevOps 体系",
      level: 80,
      levelLabel: "熟练",
      detail: "落地自动化发布与灰度策略，关注交付效率与风险控制。",
      icon: "devops",
    },
    {
      name: "安全与合规",
      level: 76,
      levelLabel: "进阶",
      detail: "关注数据安全与权限治理，熟悉常见安全规范。",
      icon: "security",
    },
  ],
  projects: [
    {
      name: "Refinex Blog",
      description: "基于 Next.js 与 Tailwind CSS 构建的个人博客，记录技术分享与生活感悟。",
      href: "https://github.com/refinex-lab/Refinex-Blog",
      images: ["/logo.svg", "/logo.svg", "/logo.svg"],
      stack: ["Tailwind CSS", "TypeScript", "React", "Radix UI"],
    },
    {
      name: "Gateway Suite",
      description: "面向多租户的 API 网关与策略引擎，支持灰度与限流策略。",
      href: "https://refinex.dev/projects/gateway",
      images: ["/logo.svg", "/logo.svg"],
      stack: ["Gateway", "Rate Limit", "Envoy", "Policy Engine"],
    },
    {
      name: "Release Matrix",
      description: "自动化发布与回滚平台，结合变更审计与依赖追踪。",
      href: "https://refinex.dev/projects/release",
      images: ["/logo.svg", "/logo.svg", "/logo.svg"],
      stack: ["DevOps", "Release", "Audit", "GitOps"],
    },
  ],
  experiences: [
    {
      company: "Refinex Lab",
      role: "后端技术负责人",
      period: "2022 - 至今",
      location: "成都",
      logoUrl: "/logo.svg",
      current: true,
      summary:
        "带领团队完成核心服务拆分与基础设施升级，建立从研发到监控的一体化交付体系。",
      responsibilities: [
        "推动服务网格落地，核心链路稳定性提升 30%",
        "构建统一中间件能力，实现多业务线复用",
        "制定故障演练与应急预案，缩短 MTTR",
      ],
    },
    {
      company: "CloudStack Tech",
      role: "资深后端工程师",
      period: "2019 - 2022",
      location: "上海",
      logoUrl: "/logo.svg",
      summary:
        "负责订单与结算系统，优化数据库与缓存架构，提升高峰期吞吐。",
      responsibilities: [
        "服务接口 QPS 提升 2.6 倍",
        "优化索引与异步化改造，降低 45% 延迟",
      ],
    },
  ],
};
