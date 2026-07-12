type FixtureSectionHeaderProps = {
  title: string
  subtitle?: string
}

export function FixtureSectionHeader({
  title,
  subtitle,
}: FixtureSectionHeaderProps) {
  return (
    <header className="border-b border-border/60 bg-muted/15 px-4 py-2.5">
      <h2 className="text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-0.5 text-xs text-muted-foreground/75">{subtitle}</p>
      ) : null}
    </header>
  )
}
