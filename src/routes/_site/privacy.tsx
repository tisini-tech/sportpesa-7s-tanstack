import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_site/privacy')({
  head: () => ({
    title: 'SportPesa 7s | Privacy',
    meta: [
      {
        name: 'description',
        content:
          'Privacy policy for the SportPesa National 7s Circuit website.',
      },
    ],
  }),
  component: PrivacyPage,
})

function PrivacyPage() {
  return (
    <div>
      <section className="border-b border-border bg-card">
        <div className="sp-content-shell border-b border-border/60 bg-muted/15 px-4 py-4 sm:px-6 sm:py-5">
          <h1 className="text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Privacy
          </h1>
          <p className="mt-1 text-sm text-foreground/90">
            How we collect and use your information.
          </p>
        </div>
      </section>

      <section className="sp-content-shell max-w-3xl space-y-6 py-8 text-sm leading-relaxed text-muted-foreground">
        <p>
          SportPesa National 7s Circuit (“we”, “us”) operates this website so
          fans can follow the circuit, play quizzes, vote, and manage an
          account.
        </p>

        <div className="space-y-2">
          <h2 className="font-heading text-base font-bold tracking-tight text-foreground uppercase">
            What we collect
          </h2>
          <p>
            When you register we collect details you provide such as name,
            username, email, phone number, and password. We also store quiz and
            voting activity tied to your account.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="font-heading text-base font-bold tracking-tight text-foreground uppercase">
            How we use it
          </h2>
          <p>
            We use your information to create and secure your account, run
            quizzes and votes, and improve the site. If you opt in to SportPesa
            promotional SMS or email, that consent is shared so SportPesa can
            send marketing messages. Those messages may include gambling
            promotions for adults 18+ only.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="font-heading text-base font-bold tracking-tight text-foreground uppercase">
            Marketing opt-in
          </h2>
          <p>
            SMS and email marketing from SportPesa are optional. You can decline
            at registration. Gambling is addictive — play responsibly. 18+.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="font-heading text-base font-bold tracking-tight text-foreground uppercase">
            Contact
          </h2>
          <p>
            For privacy questions about this site, contact us via the details
            published by SportPesa / Tisini for the National 7s Circuit.
          </p>
        </div>

        <p className="text-xs">
          Policy version 1.0 ·{' '}
          <Link
            to="/register"
            className="font-semibold text-secondary underline-offset-4 hover:underline"
          >
            Back to register
          </Link>
        </p>
      </section>
    </div>
  )
}
