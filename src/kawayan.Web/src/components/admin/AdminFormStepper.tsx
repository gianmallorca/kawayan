import { Check } from 'lucide-react';

export type AdminFormStep = { label: string };

export function AdminFormStepper({
  steps,
  currentIndex,
}: {
  steps: AdminFormStep[];
  currentIndex: number;
}) {
  const total = steps.length;
  const progress = ((currentIndex + 1) / total) * 100;

  return (
    <div className="mb-8" aria-label="Form progress">
      <p className="text-sm font-medium text-gray-700 md:hidden">
        Step {currentIndex + 1} of {total}
        <span className="text-gray-400 font-normal"> — {steps[currentIndex]?.label}</span>
      </p>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2 md:hidden">
        <div
          className="h-full bg-brand rounded-full transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={currentIndex + 1}
          aria-valuemin={1}
          aria-valuemax={total}
        />
      </div>

      <ol className="hidden md:flex items-center w-full gap-0">
        {steps.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <li key={step.label} className={`flex items-center ${i < steps.length - 1 ? 'flex-1' : ''}`}>
              <div className="flex flex-col items-center gap-1.5 min-w-[4.5rem]">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    done
                      ? 'bg-brand text-white'
                      : active
                        ? 'bg-white text-brand ring-2 ring-[var(--color-primary)]'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                  aria-current={active ? 'step' : undefined}
                >
                  {done ? <Check className="w-4 h-4" strokeWidth={2.5} /> : i + 1}
                </span>
                <span
                  className={`text-xs font-medium text-center max-w-[5.5rem] leading-tight ${
                    active ? 'text-brand' : done ? 'text-gray-700' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 mb-5 transition-colors ${i < currentIndex ? 'bg-brand' : 'bg-gray-200'}`}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
