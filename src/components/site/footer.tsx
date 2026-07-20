import {
  christiePartner,
  dala7sPartner,
  driftwoodPartner,
  embu7sPartner,
  kabeberiPartner,
  kruWhitePartner,
  prinslooPartner,
  tisiniLogo,
} from '#/assets'
import {
  FacebookSocialIcon,
  InstagramSocialIcon,
  TikTokSocialIcon,
  XSocialIcon,
  YouTubeSocialIcon,
} from './social-icons'
import { SiteLogo } from './logo'

const PARTNERS = [
  { name: 'Kenya Rugby Union', logo: kruWhitePartner },
  { name: 'Driftwood 7s', logo: driftwoodPartner },
  { name: 'Prinsloo 7s', logo: prinslooPartner },
  { name: 'Christie 7s', logo: christiePartner },
  { name: 'Kabeberi Memorial Sevens', logo: kabeberiPartner },
  { name: 'Dala Sevens', logo: dala7sPartner },
  { name: 'Embu Sevens', logo: embu7sPartner },
] as const

const SOCIAL_LINKS = [
  {
    label: 'Follow us on X',
    href: 'https://x.com/SportPesa',
    icon: XSocialIcon,
  },
  {
    label: 'Follow us on Facebook',
    href: 'https://www.facebook.com/SportPesaOfficial',
    icon: FacebookSocialIcon,
  },
  {
    label: 'Follow us on Instagram',
    href: 'https://www.instagram.com/SportPesa',
    icon: InstagramSocialIcon,
  },
  {
    label: 'Follow us on TikTok',
    href: 'https://www.tiktok.com/@sportpesa',
    icon: TikTokSocialIcon,
  },
  {
    label: 'Follow us on YouTube',
    href: 'https://www.youtube.com/@sportpesa',
    icon: YouTubeSocialIcon,
  },
] as const

const FOOTER_LINKS = [
  { label: 'Privacy', href: '#' },
  { label: 'Terms', href: '#' },
  { label: 'Contact', href: '#' },
] as const

export default function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t-2 bg-card">
      <div className="sp-shell-wide border-b border-border py-5">
        <div className="flex flex-col items-center gap-4">
          <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            In partnership with
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-4 sm:gap-x-6">
            {PARTNERS.map((partner) => (
              <img
                key={partner.name}
                src={partner.logo}
                alt={partner.name}
                className="h-9 w-auto max-w-[7.5rem] object-contain sm:h-10 sm:max-w-[8.5rem]"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="sp-shell-wide py-8">
        <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-3">
          <div className="flex justify-center md:justify-start">
            <SiteLogo sportpesaClassName="h-10 sm:h-11" />
          </div>

          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm"
          >
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-medium text-muted-foreground transition-colors hover:text-secondary"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <nav
            aria-label="Social media"
            className="flex items-center justify-center gap-2 md:justify-end"
          >
            {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex size-10 items-center justify-center rounded-full border border-primary/40 text-primary transition-colors hover:border-secondary hover:bg-secondary/10 hover:text-secondary"
              >
                <Icon className="size-5" />
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-sm sm:flex-row">
          <p className="text-muted-foreground">
            © {year} SportPesa National 7s Circuit. All rights reserved.
          </p>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Powered by
            </span>
            <span className="inline-flex rounded-sm bg-white px-2 py-1">
              <img
                src={tisiniLogo}
                alt="Tisini"
                className="h-5 w-auto object-contain"
              />
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
