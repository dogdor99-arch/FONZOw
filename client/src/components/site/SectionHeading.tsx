/**
 * Editorial section heading with an index numeral, so a long homepage reads as
 * numbered chapters rather than an undifferentiated stack of blocks.
 */

import { ReactNode } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  action,
}: {
  index?: string;
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <div className="flex items-baseline gap-4">
          {index && <span className="section-index">{index}</span>}
          <p className="eyebrow">{eyebrow}</p>
        </div>
        <h2 className="mt-4 text-3xl leading-[1.12] sm:text-[2.6rem]">{title}</h2>
        {description && (
          <p className="mt-4 text-[15px] leading-[1.85] text-muted-foreground">{description}</p>
        )}
      </div>

      {action && (
        <Link
          href={action.href}
          className="link-underline inline-flex shrink-0 items-center gap-2 text-[11px] tracking-[0.18em] text-brand uppercase">
          {action.label}
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.7} />
        </Link>
      )}
    </div>
  );
}
