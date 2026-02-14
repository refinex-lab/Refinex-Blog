import * as RadixTabs from "@radix-ui/react-tabs";
import { Children, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";

type TabProps = {
  title: string;
  value?: string;
  children: ReactNode;
};

export const Tab = (_props: TabProps) => {
  // Marker component: rendered by <Tabs>.
  void _props;
  return null;
};

const isTabElement = (node: unknown): node is ReactElement<TabProps> => {
  return isValidElement(node) && node.type === Tab;
};

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");

export const Tabs = ({
  children,
  defaultValue,
}: {
  children: ReactNode;
  defaultValue?: string;
}) => {
  const tabs = Children.toArray(children).filter(isTabElement);
  if (tabs.length === 0) return null;

  const items = tabs.map((tab, index) => {
    const title = tab.props.title;
    const value = tab.props.value ?? (slugify(title) || `tab-${index}`);
    return {
      title,
      value,
      content: tab.props.children,
    };
  });

  const initial = defaultValue ?? items[0]?.value;

  return (
    <div className="my-5">
      <RadixTabs.Root defaultValue={initial}>
        <RadixTabs.List className="inline-flex max-w-full flex-wrap gap-1 rounded-xl border border-black/10 bg-white/70 p-1 text-sm dark:border-white/10 dark:bg-zinc-950/40">
          {items.map((item) => (
            <RadixTabs.Trigger
              key={item.value}
              value={item.value}
              className="inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm font-medium text-zinc-600 transition data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm dark:text-zinc-300 dark:data-[state=active]:bg-zinc-950 dark:data-[state=active]:text-zinc-50"
            >
              {item.title}
            </RadixTabs.Trigger>
          ))}
        </RadixTabs.List>

        {items.map((item) => (
          <RadixTabs.Content
            key={item.value}
            value={item.value}
            className="mt-3 outline-none"
          >
            {item.content}
          </RadixTabs.Content>
        ))}
      </RadixTabs.Root>
    </div>
  );
};
