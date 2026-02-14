import { Children, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";

type StepProps = {
  title: string;
  children: ReactNode;
};

export const Step = (_props: StepProps) => {
  // Marker component: rendered by <Steps>.
  void _props;
  return null;
};

const isStepElement = (node: unknown): node is ReactElement<StepProps> => {
  return isValidElement(node) && node.type === Step;
};

export const Steps = ({ children }: { children: ReactNode }) => {
  const steps = Children.toArray(children).filter(isStepElement);
  if (steps.length === 0) return null;

  return (
    <div className="my-5 rounded-2xl border border-black/10 bg-white/70 px-4 py-4 dark:border-white/10 dark:bg-zinc-950/40">
      <ol className="m-0 list-none space-y-4 p-0">
        {steps.map((step, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-50 dark:text-zinc-900">
              {idx + 1}
            </div>
            <div className="min-w-0 flex-1">
              <p className="m-0 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {step.props.title}
              </p>
              <div className="mt-2 text-sm leading-7 text-zinc-700 dark:text-zinc-200">
                {step.props.children}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};
