import {
  BarChartIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Cross2Icon,
  CubeIcon,
  EnvelopeClosedIcon,
  GitHubLogoIcon,
  GlobeIcon,
  LightningBoltIcon,
  LockClosedIcon,
  RocketIcon,
  StackIcon,
} from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import * as HoverCard from "@radix-ui/react-hover-card";
import { useState } from "react";
import { profile } from "../../config/profile";
import { Avatar } from "../../components/ui/Avatar";
import { Card } from "../../components/ui/Card";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { Tag } from "../../components/ui/Tag";

const linkIconMap = {
  github: GitHubLogoIcon,
  mail: EnvelopeClosedIcon,
  globe: GlobeIcon,
  server: StackIcon,
};

const skillIconMap = {
  architecture: CubeIcon,
  database: StackIcon,
  performance: LightningBoltIcon,
  observability: BarChartIcon,
  devops: RocketIcon,
  security: LockClosedIcon,
};

const LinkIcon = ({
  icon,
  label,
  href,
}: (typeof profile.links)[number]) => {
  const Icon = linkIconMap[icon] ?? GlobeIcon;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/5 bg-white/70 text-slate-600 transition-colors hover:border-black/20 hover:bg-white hover:text-slate-900 dark:border-white/10 dark:bg-white/10 dark:text-slate-100 dark:hover:border-white/25 dark:hover:bg-white/15"
    >
      <Icon className="h-5 w-5" />
    </a>
  );
};

const SkillCard = ({
  icon,
  name,
  level,
  levelLabel,
  detail,
}: (typeof profile.skills)[number]) => {
  const Icon = skillIconMap[icon] ?? CubeIcon;
  const safeLevel = Math.max(0, Math.min(100, level));
  return (
    <HoverCard.Root>
      <HoverCard.Trigger asChild>
        <button
          type="button"
          className="group flex w-full items-center justify-between rounded-2xl border border-black/5 bg-white/70 p-4 text-left transition-colors hover:border-black/15 hover:bg-white/90 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/25 dark:hover:bg-white/10"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 dark:text-white">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-200/70">
                {levelLabel}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-200/70">
            {safeLevel}%
          </span>
        </button>
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          sideOffset={12}
          className="w-72 rounded-2xl border border-black/10 bg-white/95 p-4 text-sm text-slate-600 shadow-xl shadow-slate-200/40 backdrop-blur dark:border-white/10 dark:bg-slate-900/95 dark:text-slate-100"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-700 dark:text-white">
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-200/70">
                熟练度 {safeLevel}% · {levelLabel}
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6">{detail}</p>
          <div className="mt-4 h-1.5 rounded-full bg-black/10 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-[var(--accent-color)]"
              style={{ width: `${safeLevel}%` }}
            />
          </div>
          <HoverCard.Arrow className="fill-white dark:fill-slate-900" />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
};

const ProjectCarousel = ({
  images,
  title,
}: {
  images: string[];
  title: string;
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const total = images.length;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % total);
  };

  if (!total) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-black/10 text-sm text-slate-400 dark:border-white/10 dark:text-slate-200/70">
        暂无项目截图
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl border border-black/5 bg-white/70 dark:border-white/10 dark:bg-white/5">
        <button
          type="button"
          onClick={() => setPreviewIndex(activeIndex)}
          className="group block w-full"
        >
          <img
            src={images[activeIndex]}
            alt={`${title} preview`}
            className="h-48 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        </button>
        {total > 1 ? (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
            {images.map((_, index) => (
              <button
                key={`${title}-dot-${index}`}
                type="button"
                aria-label={`切换到第 ${index + 1} 张`}
                className={`h-2.5 w-2.5 rounded-full border transition ${
                  index === activeIndex
                    ? "border-transparent bg-[var(--accent-color)]"
                    : "border-black/20 bg-black/10 dark:border-white/20 dark:bg-white/10"
                }`}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
        ) : null}
        {total > 1 ? (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/80 text-slate-600 shadow-sm transition hover:border-black/20 hover:bg-white dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-white/30"
              aria-label="上一张"
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/80 text-slate-600 shadow-sm transition hover:border-black/20 hover:bg-white dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-white/30"
              aria-label="下一张"
            >
              <ChevronRightIcon />
            </button>
          </>
        ) : null}
      </div>

      <Dialog.Root
        open={previewIndex !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewIndex(null);
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-slate-950/95 p-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">{title}</p>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-slate-200 transition hover:border-white/30 hover:text-white"
                >
                  <Cross2Icon />
                </button>
              </Dialog.Close>
            </div>
            {previewIndex !== null ? (
              <div className="relative mt-4">
                <img
                  src={images[previewIndex]}
                  alt={`${title} large preview`}
                  className="max-h-[70vh] w-full rounded-xl object-contain"
                />
                {total > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewIndex((prev) =>
                          prev === null ? 0 : (prev - 1 + total) % total
                        )
                      }
                      className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 text-white transition hover:border-white/30"
                      aria-label="上一张"
                    >
                      <ChevronLeftIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewIndex((prev) =>
                          prev === null ? 0 : (prev + 1) % total
                        )
                      }
                      className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 text-white transition hover:border-white/30"
                      aria-label="下一张"
                    >
                      <ChevronRightIcon />
                    </button>
                  </>
                ) : null}
              </div>
            ) : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export const AboutPage = () => {
  const initials = profile.name.slice(0, 1).toUpperCase();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-16 pt-10 sm:px-6">
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--accent-color),_transparent_55%)] opacity-80" />
        <div className="relative flex flex-col gap-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-6 sm:flex-row">
              <Avatar
                src={profile.avatarUrl}
                alt={profile.name}
                fallback={initials}
              />
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">
                    About me
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
                    {profile.name}
                  </h1>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-200/80">
                    {profile.title} · {profile.location}
                  </p>
                </div>
                <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-100/80">
                  {profile.bio}
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.focus.map((item) => (
                    <Tag key={item}>{item}</Tag>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex w-full flex-col gap-4 lg:w-[320px]">
              <div className="rounded-2xl border border-black/5 bg-white/70 p-4 text-sm text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-slate-100/80">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {profile.motto}
                </p>
                <p className="mt-2 text-xs">“{profile.quote}”</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.links.map((item) => (
                    <LinkIcon key={item.label} {...item} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <SectionHeader
          title="兴趣爱好"
          description="通过兴趣拓宽边界，也让技术保持温度。"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {profile.hobbies.map((item) => (
            <Tag key={item}>{item}</Tag>
          ))}
        </div>
      </Card>

      <Card>
        <SectionHeader
          title="技术栈"
          description="从架构到交付的全链路能力，保持稳态与迭代速度平衡。"
        />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {profile.skills.map((skill) => (
            <SkillCard key={skill.name} {...skill} />
          ))}
        </div>
      </Card>

      <Card>
        <SectionHeader
          title="工作经历"
          description="以业务价值为导向，持续打磨系统稳定性与团队效率。"
        />
        <div className="mt-6 space-y-4">
          {profile.experiences.map((item) => (
            <div
              key={`${item.company}-${item.role}`}
              className="group rounded-2xl border border-black/5 bg-white/70 p-5 transition-colors hover:border-black/15 hover:bg-white/90 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/25 dark:hover:bg-white/10"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-white/80 text-sm font-semibold text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-white">
                    {item.logoUrl ? (
                      <img
                        src={item.logoUrl}
                        alt={item.company}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      item.company.slice(0, 1)
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {item.role}
                      </span>
                      {item.current ? (
                        <span className="rounded-full border border-[var(--accent-color)]/60 bg-[var(--accent-color)]/30 px-2 py-0.5 text-[11px] text-slate-700 dark:text-white">
                          当前
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-300">
                      {item.company} · {item.location}
                    </p>
                    <p className="text-xs text-slate-400">{item.period}</p>
                  </div>
                </div>
                <div className="max-w-2xl text-sm text-slate-600 dark:text-slate-100/80">
                  {item.summary}
                </div>
              </div>
              <ul className="mt-4 grid gap-2 text-xs text-slate-500 dark:text-slate-300">
                {item.responsibilities.map((task) => (
                  <li key={task} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--accent-color)]" />
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionHeader
          title="项目精选"
          description="兼顾业务价值与可维护性的工程实践。"
        />
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {profile.projects.map((project) => (
            <div
              key={project.name}
              className="group rounded-2xl border border-black/5 bg-white/70 p-5 transition-colors hover:border-black/15 hover:bg-white/90 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/25 dark:hover:bg-white/10"
            >
              <ProjectCarousel images={project.images} title={project.name} />
              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-base font-semibold text-slate-900 dark:text-white">
                    {project.name}
                  </p>
                  {project.href ? (
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-white"
                    >
                      查看详情 →
                    </a>
                  ) : null}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-100/80">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.stack.map((item) => (
                    <Tag key={item}>{item}</Tag>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
