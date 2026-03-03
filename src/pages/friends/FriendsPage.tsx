import { Link2, Mail, MessageSquare, User } from "lucide-react";
import { friendsConfig } from "../../config/friends";
import { Card } from "../../components/ui/Card";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { Tag } from "../../components/ui/Tag";

const FriendCard = ({
  name,
  description,
  href,
  avatar,
  tags,
}: {
  name: string;
  description: string;
  href: string;
  avatar?: string;
  tags?: string[];
}) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group relative flex flex-col gap-3 rounded-2xl border border-black/5 bg-white/80 p-4 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-black/10 hover:bg-white hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10 dark:focus-visible:ring-slate-500/60"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm dark:border-white/10 dark:bg-white/10">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-6 w-6 text-slate-400 dark:text-slate-500" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-slate-900 dark:text-white">
            {name}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
            {description}
          </p>
        </div>
      </div>
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      )}
      <div className="pointer-events-none absolute bottom-3 right-3 inline-flex translate-y-1 items-center gap-1 rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100 dark:bg-slate-800 dark:text-slate-100">
        访问
        <Link2 className="h-3 w-3" />
      </div>
    </a>
  );
};

const EmptyState = () => {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 bg-white/50 p-12 text-center dark:border-white/10 dark:bg-white/5">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
        <Link2 className="h-8 w-8 text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="mt-6 text-lg font-semibold text-slate-900 dark:text-white">
        暂无友链
      </h3>
      <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-300">
        目前还没有添加任何友链，如果你想申请友链，请查看下方的申请指南。
      </p>
    </div>
  );
};

export const FriendsPage = () => {
  const { title, description, applyGuide, friends } = friendsConfig;
  const hasFriends = friends.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-16 pt-10 sm:gap-8 sm:px-6">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          {title}
        </h1>
        <p className="text-base text-slate-600 sm:text-lg dark:text-slate-300">
          {description}
        </p>
      </div>

      {hasFriends ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {friends.map((friend) => (
            <FriendCard key={friend.id} {...friend} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}

      {applyGuide && (
        <Card>
          <SectionHeader
            title={applyGuide.title}
            description="欢迎与我交换友链，让我们一起成长。"
          />
          <div className="mt-6 space-y-4">
            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                申请要求
              </h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {applyGuide.requirements.map((req, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent-color)]" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-black/5 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-white/5">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-slate-500 dark:text-slate-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  联系方式
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {applyGuide.contact.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {applyGuide.contact.email && (
                    <a
                      href={`mailto:${applyGuide.contact.email}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-black/20 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-white/10"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      邮件联系
                    </a>
                  )}
                  {applyGuide.contact.github && (
                    <a
                      href={applyGuide.contact.github}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-black/20 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-white/10"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      GitHub Issue
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
