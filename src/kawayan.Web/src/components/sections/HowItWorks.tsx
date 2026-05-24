import { Link } from "react-router-dom";
import { useCompany } from "@/contexts/CompanyContext";

const steps = [
  {
    number: "01",
    title: "Tell Us What You Need",
    description:
      "Reach out via our inquiry form or message us directly. Share your project details - size, quantity, and intended use.",
  },
  {
    number: "02",
    title: "We Prepare Your Order",
    description:
      "We source, treat, and cut your bamboo to spec. Quality-checked before it leaves our hands.",
  },
  {
    number: "03",
    title: "Delivered to You",
    description:
      "We arrange delivery or pickup. Fast turnaround, with support every step of the way.",
  },
];

export function HowItWorks() {
  const company = useCompany();
  const companyName = company?.nameMain?.trim() || "kaw.a.yan";

  return (
    <section className="bg-[#f5f0eb] py-16 lg:py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-10 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            How We Work With You
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            From your first inquiry to final delivery - here's what to expect
            when you order with {companyName}.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-stretch">
          <div className="grid gap-4">
            {steps.map((step) => (
              <article
                key={step.number}
                className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-white/90 p-5 sm:p-6 shadow-sm"
              >
                <span className="absolute -right-1 top-2 text-5xl font-bold tracking-tight text-emerald-900/10 sm:text-6xl">
                  {step.number}
                </span>
                <div className="relative pr-16">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 mb-2">
                    Step {step.number}
                  </p>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {step.description}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <aside className="relative overflow-hidden rounded-2xl border border-emerald-900/10 bg-[#21412f] p-6 sm:p-8 text-white shadow-sm">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(187,247,208,0.12),transparent_34%)]" />
            <div className="relative flex h-full flex-col justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-emerald-100">
                  Quick chat
                </div>
                <div className="space-y-3">
                  <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-emerald-600 px-4 py-3 text-sm leading-relaxed text-white shadow-sm">
                    I need bamboo for my project.
                  </div>
                  <div className="ml-auto max-w-[90%] rounded-2xl rounded-br-md bg-white/12 px-4 py-3 text-sm leading-relaxed text-emerald-50 ring-1 ring-white/10">
                    Great! Let's get you a free quote - just tell us your specs.
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-emerald-100/90">
                  Fast responses, clear specs, and a team that helps you get the
                  right bamboo for the job.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-emerald-900 shadow-sm ring-1 ring-white/20 hover:bg-emerald-50 active:bg-emerald-100"
                >
                  Inquire Now
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
