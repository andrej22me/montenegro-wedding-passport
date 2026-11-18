import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Postmark from "@/components/Postmark";
import Stamp from "@/components/Stamp";
import { Arrow } from "@/components/icons";
import { COUPLE, EVENTS, HERO } from "@/data/weddingData";

const GUIDE_LINKS = [
  { label: "Travel and stay", href: "/guide#travel" },
  { label: "What to wear", href: "/guide#wear" },
  { label: "Questions", href: "/guide#questions" },
];

const shell = "mx-auto w-full max-w-[1200px] px-5 min-[900px]:px-12";

export default function HomePage() {
  const [first, second = ""] = COUPLE.names.split(" & ");

  return (
    <div className="flex min-h-dvh flex-col bg-paper text-ink">
      <Header />
      <main className="flex-1">
        <section className="relative min-[900px]:h-[min(88vh,820px)]">
          <div className="absolute inset-y-0 right-0 left-[calc(max(0px,(100%-min(100%,1200px))/2)+48px+(min(100%,1200px)-96px)*5/12)] hidden overflow-hidden min-[900px]:block">
            <Image src={HERO.image} alt={HERO.alt} fill priority sizes="58vw" className="object-cover" />
            <Postmark
              ring={HERO.postmarkRing}
              center={COUPLE.monogram}
              date={HERO.postmarkDate}
              className="absolute bottom-10 left-0 -translate-x-1/2 -rotate-12"
            />
          </div>
          <div className="relative h-[620px] overflow-hidden min-[900px]:hidden">
            <Image src={HERO.image} alt={HERO.alt} fill priority sizes="100vw" className="object-cover" />
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{ background: "linear-gradient(180deg, transparent 48%, color-mix(in srgb, var(--ink) 82%, transparent) 100%)" }}
            />
            <div className="absolute right-5 bottom-7 left-5 flex flex-col text-paper">
              <DateLine />
              <Names first={first} second={second} ampClass="text-accent-light" />
            </div>
          </div>
          <div className={`${shell} relative hidden h-full items-center min-[900px]:flex`}>
            <div className="w-[calc(5/12*100%)] py-16 pr-8">
              <DateLine />
              <Names first={first} second={second} ampClass="text-accent" desktop />
              <Invite className="mt-8 max-w-[30ch] text-[22px]" />
            </div>
          </div>
        </section>

        <section className="relative px-5 pt-7 min-[900px]:hidden">
          <Postmark
            ring={HERO.postmarkRing}
            center={COUPLE.monogram}
            date={HERO.postmarkDate}
            className="absolute top-[-64px] right-[14px] -rotate-12"
          />
          <Invite className="max-w-[300px] text-[21px]" />
        </section>

        <div className={shell}>
          <section aria-label="The weekend" className="flex flex-col gap-4 pt-12 min-[900px]:gap-6 min-[900px]:pt-24">
            <div className="flex items-baseline justify-between">
              <h2 className="m-0 font-display text-[30px] font-normal tracking-[-0.01em]">The weekend</h2>
              <Link href="/weekend" className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-medium no-underline">
                Open map
                <Arrow size={16} />
              </Link>
            </div>
            <div className="strip -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-pl-5 scroll-pr-5 px-5 pt-1 pb-2 min-[900px]:mx-0 min-[900px]:grid min-[900px]:grid-cols-6 min-[900px]:gap-6 min-[900px]:overflow-visible min-[900px]:px-0">
              {EVENTS.map((event) => (
                <Link
                  key={event.slug}
                  href={`/weekend?stop=${event.n}`}
                  className="flex w-[130px] shrink-0 snap-start flex-col text-ink no-underline min-[900px]:w-auto"
                >
                  <span className="min-[900px]:hidden">
                    <Stamp src={event.image} alt="" width={130} height={162} padding={8} shadow="card" />
                  </span>
                  <span className="hidden min-[900px]:block">
                    <Stamp src={event.image} alt="" width={160} height={200} padding={8} fluid shadow="card" sizes="(min-width: 1200px) 160px, 14vw" />
                  </span>
                  <span className="mt-2 text-xs font-semibold text-accent min-[900px]:mt-2.5">
                    {String(event.n).padStart(2, "0")} · {event.day.slice(0, 3)}
                  </span>
                  <span className="mt-1 font-display text-lg leading-[1.15] min-[900px]:text-xl">{event.title}</span>
                </Link>
              ))}
            </div>
          </section>

          <div className="mt-12 border-t border-ink min-[900px]:mt-24 min-[900px]:grid min-[900px]:grid-cols-[1fr_1fr_minmax(0,360px)] min-[900px]:items-center min-[900px]:gap-8 min-[900px]:border-b min-[900px]:border-b-[var(--rule)]">
            <dl className="grid grid-cols-2 border-b border-b-[var(--rule)] min-[900px]:col-span-2 min-[900px]:border-b-0">
              <div className="flex flex-col gap-1 border-r border-[var(--rule)] py-4 pr-3 min-[900px]:border-r-0 min-[900px]:py-6">
                <dt className="text-[13px] font-medium text-ink-2">Wedding</dt>
                <dd className="m-0 font-display text-xl leading-[1.25]">
                  {COUPLE.wedding.when}
                  <br />
                  {COUPLE.wedding.where}
                </dd>
              </div>
              <div className="flex flex-col gap-1 py-4 pl-4 min-[900px]:py-6 min-[900px]:pl-0">
                <dt className="text-[13px] font-medium text-ink-2">Reply by</dt>
                <dd className="m-0 font-display text-xl leading-[1.25]">{COUPLE.replyBy}</dd>
              </div>
            </dl>
            <Link
              href="/rsvp"
              className="mt-6 flex h-14 w-full items-center justify-between rounded-[2px] bg-ink px-5 text-[17px] font-medium text-paper no-underline hover:text-paper min-[900px]:mt-0 min-[900px]:max-w-[360px] min-[900px]:justify-self-end"
            >
              Reply to the invitation
              <Arrow />
            </Link>
          </div>

          <nav aria-label="Guide" className="mt-12 flex flex-col min-[900px]:mt-24 min-[900px]:grid min-[900px]:grid-cols-3 min-[900px]:gap-6">
            {GUIDE_LINKS.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  "flex min-h-[60px] items-center justify-between border-t border-[var(--rule)] font-display text-[22px] no-underline",
                  index === 0 ? "border-t-ink" : "",
                  index === GUIDE_LINKS.length - 1 ? "border-b border-b-[var(--rule)]" : "",
                  "min-[900px]:min-h-0 min-[900px]:items-start min-[900px]:border-t-ink min-[900px]:border-b-0 min-[900px]:p-6 min-[900px]:text-[26px]",
                ].join(" ")}
              >
                {link.label}
                <Arrow size={18} strokeWidth={1.5} />
              </Link>
            ))}
          </nav>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function DateLine() {
  return (
    <p className="m-0 mb-5 flex gap-2 text-sm font-medium tracking-[0.02em]">
      {COUPLE.place} <span aria-hidden="true">·</span> {COUPLE.dates}
    </p>
  );
}

function Names({ first, second, ampClass, desktop = false }: { first: string; second: string; ampClass: string; desktop?: boolean }) {
  return (
    <h1
      aria-label={COUPLE.names}
      className={[
        "m-0 font-display leading-[0.92] font-light tracking-[-0.025em]",
        desktop ? "text-[clamp(72px,8vw,132px)]" : "text-[74px]",
      ].join(" ")}
    >
      <span aria-hidden="true">
        {first}
        <br />
        <span className={`italic ${ampClass}`}>&</span> {second}
      </span>
    </h1>
  );
}

function Invite({ className = "" }: { className?: string }) {
  return <p className={`m-0 font-display leading-[1.38] text-pretty ${className}`}>{COUPLE.invite}</p>;
}
