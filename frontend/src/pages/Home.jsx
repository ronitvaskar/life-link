import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Droplets,
  Heart,
  HeartHandshake,
  HeartPulse,
  Hospital,
  LockKeyhole,
  Menu,
  Network,
  Quote,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

/*
|--------------------------------------------------------------------------
| Life Link — Enterprise Landing Page
|--------------------------------------------------------------------------
|
| Premium healthcare technology landing page.
|
| Existing application routes preserved:
|
|   /              Home
|   /login         Sign in
|   /register      Registration
|
| Existing public images preserved:
|
|   /image/blood-donation-hero.png
|   /image/blood-donation-2.png
|   /image/blood-donation-3.png
|   /image/blood-donation-4.png
|   /image/blood-donation-5.png
|
|--------------------------------------------------------------------------
*/

function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState("inventory");
  const [scrolled, setScrolled] = useState(false);

  const heroWords = [
    "coordinated blood care.",
    "smarter blood matching.",
    "connected blood networks.",
    "faster blood fulfillment.",
  ];

  const [heroWordIndex, setHeroWordIndex] = useState(0);
  const [heroText, setHeroText] = useState("");
  const [heroDeleting, setHeroDeleting] = useState(false);

  useEffect(() => {
    const currentWord = heroWords[heroWordIndex];
    const typingSpeed = heroDeleting ? 45 : 75;

    const timer = setTimeout(() => {
      if (!heroDeleting) {
        const nextText = currentWord.substring(
          0,
          heroText.length + 1
        );

        setHeroText(nextText);

        if (nextText === currentWord) {
          setTimeout(() => {
            setHeroDeleting(true);
          }, 2200);
        }
      } else {
        const nextText = currentWord.substring(
          0,
          heroText.length - 1
        );

        setHeroText(nextText);

        if (nextText === "") {
          setHeroDeleting(false);

          setHeroWordIndex(
            (current) =>
              (current + 1) % heroWords.length
          );
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [heroText, heroDeleting, heroWordIndex]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen
      ? "hidden"
      : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const scrollToSection = (id) => {
    closeMobileMenu();

    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-950">
      {/* ============================================================
          NAVIGATION
      ============================================================ */}

      <header
        className={[
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-2xl"
            : "bg-transparent",
        ].join(" ")}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">

          {/* Brand */}

          <Link
            to="/"
            onClick={closeMobileMenu}
            className="group flex items-center gap-3"
          >
            <div
              className={[
                "relative flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg transition-all duration-300",
                scrolled
                  ? "bg-red-600 shadow-red-600/20"
                  : "border border-white/20 bg-white/10 shadow-black/10 backdrop-blur-xl",
              ].join(" ")}
            >
              <Droplets
                className={[
                  "h-6 w-6 fill-current transition-colors",
                  scrolled
                    ? "text-white"
                    : "text-white",
                ].join(" ")}
              />

              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
            </div>

            <div>
              <div
                className={[
                  "text-xl font-black tracking-tight transition-colors",
                  scrolled
                    ? "text-slate-950"
                    : "text-white",
                ].join(" ")}
              >
                Life <span className="text-red-600">Link</span>
              </div>

              <div
                className={[
                  "text-[9px] font-bold uppercase tracking-[0.2em] transition-colors",
                  scrolled
                    ? "text-slate-500"
                    : "text-slate-300",
                ].join(" ")}
              >
                Connected blood care
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}

          <nav className="hidden items-center gap-8 lg:flex">
            <NavButton
              text="Platform"
              dark={!scrolled}
              onClick={() => scrollToSection("platform")}
            />

            <NavButton
              text="Solutions"
              dark={!scrolled}
              onClick={() => scrollToSection("solutions")}
            />

            <NavButton
              text="How it works"
              dark={!scrolled}
              onClick={() => scrollToSection("workflow")}
            />

            <NavButton
              text="Security"
              dark={!scrolled}
              onClick={() => scrollToSection("security")}
            />
          </nav>

          {/* Desktop Actions */}

          <div className="hidden items-center gap-2 sm:flex">
            <Link
              to="/login"
              className={[
                "rounded-xl px-4 py-2.5 text-sm font-bold transition",
                scrolled
                  ? "text-slate-700 hover:bg-slate-100 hover:text-red-600"
                  : "text-white hover:bg-white/10",
              ].join(" ")}
            >
              Sign in
            </Link>

            <Link
              to="/register"
              className="group flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition duration-300 hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-xl"
            >
              Get started

              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Mobile Menu Button */}

          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen((value) => !value)
            }
            aria-label="Toggle navigation"
            aria-expanded={mobileMenuOpen}
            className={[
              "rounded-xl p-2.5 transition lg:hidden",
              scrolled || mobileMenuOpen
                ? "text-slate-800 hover:bg-slate-100"
                : "text-white hover:bg-white/10",
            ].join(" ")}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}

        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white shadow-2xl lg:hidden">
            <div className="mx-auto max-w-7xl px-5 py-5 sm:px-6">

              <div className="space-y-1">
                <MobileNavButton
                  text="Platform"
                  onClick={() =>
                    scrollToSection("platform")
                  }
                />

                <MobileNavButton
                  text="Solutions"
                  onClick={() =>
                    scrollToSection("solutions")
                  }
                />

                <MobileNavButton
                  text="How it works"
                  onClick={() =>
                    scrollToSection("workflow")
                  }
                />

                <MobileNavButton
                  text="Security"
                  onClick={() =>
                    scrollToSection("security")
                  }
                />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-200 pt-5">
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-bold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  Sign in
                </Link>

                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="rounded-xl bg-red-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-red-700"
                >
                  Get started
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>

        {/* ============================================================
            PREMIUM HERO
        ============================================================ */}

        <section className="relative min-h-screen overflow-hidden bg-[#050817] text-white">

          <img
            src="/image/blood-donation-hero.png"
            alt=""
            aria-hidden="true"
            className="
              absolute inset-0
              h-full w-full
              object-cover object-center
              opacity-[0.18]
            "
          />

          <div className="absolute inset-0 bg-[#020617]" />

          <div
            className="
              absolute inset-0
              bg-cover bg-center
              opacity-[0.20]
              mix-blend-screen
            "
            style={{
              backgroundImage:
                "url('/image/blood-donation-hero.png')",
            }}
          />

          <div
            className="
              absolute inset-0
              bg-linear-to-r
              from-[#020617]
              via-[#020617]/95
              to-[#020617]/65
            "
          />

          <div
            className="
              absolute inset-0
              bg-linear-to-br
              from-[#220513]/70
              via-transparent
              to-transparent
            "
          />

          <div
            className="
              absolute
              -left-45
              top-70
              h-155
              w-155
              rounded-full
              bg-red-900/20
              blur-[140px]
            "
          />

          <div
            className="
              absolute
              right-[5%]
              top-[18%]
              h-140
              w-140
              rounded-full
              bg-blue-950/30
              blur-[150px]
            "
          />

          <div
            className="
              absolute
              left-[18%]
              top-[35%]
              h-105
              w-105
              rounded-full
              bg-red-950/20
              blur-[130px]
            "
          />

          <div
            className="
              absolute inset-0
              bg-linear-to-t
              from-[#020617]
              via-transparent
              to-[#020617]/40
            "
          />

          <div className="absolute inset-0 opacity-[0.045]">
            <div
              className="h-full w-full"
              style={{
                backgroundImage: `
                  linear-gradient(
                    rgba(255,255,255,0.65) 1px,
                    transparent 1px
                  ),
                  linear-gradient(
                    90deg,
                    rgba(255,255,255,0.65) 1px,
                    transparent 1px
                  )
                `,
                backgroundSize: "64px 64px",
                maskImage:
                  "linear-gradient(to bottom, black 0%, black 70%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, black 0%, black 70%, transparent 100%)",
              }}
            />
          </div>

          <div
            className="
              pointer-events-none
              absolute inset-0
              bg-[radial-gradient(circle_at_50%_35%,transparent_0%,rgba(2,6,23,0.12)_45%,rgba(2,6,23,0.72)_100%)]
            "
          />

          <div className="pointer-events-none absolute inset-0 opacity-[0.075]">
            <div
              className="h-full w-full"
              style={{
                backgroundImage: `
                  linear-gradient(
                    rgba(255,255,255,0.16) 1px,
                    transparent 1px
                  ),
                  linear-gradient(
                    90deg,
                    rgba(255,255,255,0.16) 1px,
                    transparent 1px
                  )
                `,
                backgroundSize: "72px 72px",
              }}
            />
          </div>

          <div className="pointer-events-none absolute -left-48 top-1/4 h-150 w-150 rounded-full bg-red-600/15 blur-[140px]" />

          <div className="pointer-events-none absolute left-1/3 top-0 h-125 w-125 rounded-full bg-blue-600/10 blur-[160px]" />

          <div className="pointer-events-none absolute right-37.5 top-1/3 h-162.5 w-162.5 rounded-full bg-red-500/10 blur-[160px]" />

          {/* HERO CONTENT */}

          <div className="relative z-10 mx-auto flex min-h-screen max-w-362.5 items-center px-5 pb-20 pt-32 sm:px-6 lg:px-10">

            <div className="grid w-full items-center gap-16 lg:grid-cols-[0.95fr_1.05fr]">

              {/* LEFT — HERO COPY */}

              <div className="max-w-180">

                <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5.5 px-5 py-3 shadow-2xl backdrop-blur-xl">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                    <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.7)]" />
                  </span>

                  <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-200 sm:text-xs">
                    Connected blood care infrastructure
                  </span>
                </div>

                <h1 className="text-4xl font-black leading-[0.98] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl xl:text-[64px]">
                  <span className="block">
                    The platform
                  </span>

                  <span className="block">
                    for
                  </span>

                  <span className="block min-h-[1em] text-[#ff2638]">
                    {heroText}

                    <span
                      className="
                        ml-1
                        inline-block
                        h-[0.8em]
                        w-1.25
                        translate-y-[0.08em]
                        bg-[#ff2638]
                        animate-pulse
                      "
                    />
                  </span>
                </h1>

                {/* UPDATED: unified USER architecture */}

                <p className="mt-9 max-w-170 text-base font-medium leading-8 text-slate-300 sm:text-lg lg:text-[19px]">
                  Life Link brings users, blood banks, and
                  administrators together through one secure
                  platform for blood requests, smart matching,
                  donations, inventory, and fulfillment.
                </p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/register"
                    className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-[#ff0718] px-7 py-4 text-sm font-extrabold text-white shadow-[0_18px_50px_rgba(255,7,24,0.28)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#ff1d2d] hover:shadow-[0_22px_60px_rgba(255,7,24,0.38)]"
                  >
                    Create your account

                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      scrollToSection("platform")
                    }
                    className="group inline-flex items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/5.5 px-7 py-4 text-sm font-extrabold text-white backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/10"
                  >
                    Explore the platform

                    <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-1" />
                  </button>
                </div>

                <div className="mt-10 flex flex-wrap gap-x-7 gap-y-4">
                  <HeroTrust text="Role-based access" />
                  <HeroTrust text="Smart compatibility matching" />
                  <HeroTrust text="Inventory control" />
                </div>
              </div>

              {/* RIGHT — PRODUCT PREVIEW */}

              <div className="relative hidden min-h-162.5 lg:block">

                <div className="absolute right-0 top-20 h-125 w-162.5 rounded-full bg-red-600/10 blur-[110px]" />

                <div className="relative z-10 flex justify-end">
                  <ProductPreview />
                </div>

                <div className="absolute left-1.25 top-33.75 z-20 w-43.75 rounded-[22px] border border-white/10 bg-[#111827]/95 p-3 shadow-[0_25px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-500/10">
                      <HeartPulse className="h-5 w-5 text-red-400" />
                    </div>

                    <div>
                      <p className="text-[10px] font-medium text-slate-500">
                        Network
                      </p>

                      <p className="mt-1 text-sm font-extrabold text-white">
                        Connected
                      </p>
                    </div>

                  </div>
                </div>

                <div className="absolute bottom-13.75 right-2 z-20 w-43.75 rounded-[22px] border border-white/10 bg-[#111827]/95 p-3 shadow-[0_25px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/10">
                      <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    </div>

                    <div>
                      <p className="text-[10px] font-medium text-slate-500">
                        Access model
                      </p>

                      <p className="mt-1 text-sm font-extrabold text-white">
                        Role based
                      </p>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MOBILE PRODUCT PREVIEW */}

          <div className="relative z-10 px-5 pb-20 lg:hidden">
            <div className="mx-auto max-w-xl">

              <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#171522]/90 shadow-[0_30px_90px_rgba(0,0,0,0.5)] backdrop-blur-2xl">

                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">

                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  </div>

                  <span className="text-[9px] font-semibold text-slate-500">
                    lifelink / dashboard
                  </span>

                  <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                    <span className="text-[8px] font-bold text-emerald-400">
                      ACTIVE
                    </span>
                  </div>
                </div>

                <div className="p-5">

                  <div className="mb-5 flex items-center justify-between">

                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-red-400">
                        Network
                      </p>

                      <h3 className="mt-1 text-xl font-extrabold text-white">
                        Operations overview
                      </h3>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600">
                      <Activity className="h-5 w-5 text-white" />
                    </div>

                  </div>

                  <div className="grid grid-cols-3 gap-2">

                    <div className="rounded-xl border border-white/10 bg-white/4.5 p-3">
                      <p className="text-[8px] font-bold uppercase text-slate-500">
                        Inventory
                      </p>

                      <p className="mt-1 text-xl font-black text-white">
                        30
                      </p>

                      <p className="text-[8px] text-slate-500">
                        units
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/4.5 p-3">
                      <p className="text-[8px] font-bold uppercase text-slate-500">
                        Groups
                      </p>

                      <p className="mt-1 text-xl font-black text-white">
                        8
                      </p>

                      <p className="text-[8px] text-slate-500">
                        supported
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/4.5 p-3">
                      <p className="text-[8px] font-bold uppercase text-slate-500">
                        Requests
                      </p>

                      <p className="mt-1 text-xl font-black text-white">
                        4
                      </p>

                      <p className="text-[8px] text-slate-500">
                        active
                      </p>
                    </div>

                  </div>

                  <div className="mt-3 rounded-xl border border-white/10 bg-white/4.5 p-4">

                    <div className="mb-5 flex items-center justify-between">

                      <div>
                        <h4 className="text-xs font-extrabold text-white">
                          Inventory overview
                        </h4>

                        <p className="mt-1 text-[9px] text-slate-500">
                          Current blood availability
                        </p>
                      </div>

                      <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[8px] font-bold text-emerald-400">
                        HEALTHY
                      </span>
                    </div>

                    <InventoryBar
                      bloodGroup="O+"
                      units="5 units"
                      percentage="72%"
                    />

                    <InventoryBar
                      bloodGroup="A+"
                      units="5 units"
                      percentage="68%"
                    />

                    <InventoryBar
                      bloodGroup="B+"
                      units="6 units"
                      percentage="84%"
                    />

                    <InventoryBar
                      bloodGroup="AB+"
                      units="4 units"
                      percentage="55%"
                      last
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">

                    <div className="rounded-xl border border-white/10 bg-white/4.5 p-3">

                      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
                        <Droplets className="h-4 w-4 text-red-400" />
                      </div>

                      <p className="text-[8px] text-slate-500">
                        Blood requests
                      </p>

                      <p className="mt-1 text-xs font-bold text-white">
                        Coordinated
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/4.5 p-3">

                      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/10">
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      </div>

                      <p className="text-[8px] text-slate-500">
                        Access
                      </p>

                      <p className="mt-1 text-xs font-bold text-white">
                        Controlled
                      </p>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-slate-500 md:flex">

            <span className="text-[9px] font-bold uppercase tracking-[0.25em]">
              Explore
            </span>

            <div className="flex h-9 w-6 justify-center rounded-full border border-white/20 p-1.5">
              <span className="h-1.5 w-1 rounded-full bg-white/60" />
            </div>

          </div>
        </section>

        {/* ============================================================
            TRUST / CAPABILITY BAR
        ============================================================ */}

        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl divide-y divide-slate-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">

            <Capability
              icon={ShieldCheck}
              title="Controlled access"
              text="Role-based permissions across the platform."
            />

            <Capability
              icon={Activity}
              title="Operational visibility"
              text="Monitor requests, donations and inventory."
            />

            <Capability
              icon={Network}
              title="Connected workflows"
              text="Coordinate every participant in one system."
            />

            <Capability
              icon={BadgeCheck}
              title="Auditable activity"
              text="Important system actions remain traceable."
            />

          </div>
        </section>

        {/* ============================================================
            PLATFORM INTRODUCTION
        ============================================================ */}

        <section
          id="platform"
          className="scroll-mt-20 bg-white px-5 py-24 sm:px-6 lg:px-8 lg:py-32"
        >
          <div className="mx-auto max-w-7xl">

            <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">

              <div className="max-w-3xl">

                <SectionEyebrow text="The Life Link platform" />

                <h2 className="mt-4 text-4xl font-black tracking-[-0.035em] text-slate-950 sm:text-5xl lg:text-6xl">
                  One system for every critical blood-care workflow.
                </h2>

              </div>

              <div className="max-w-md">
                <p className="text-base leading-8 text-slate-600">
                  From donation availability to blood request
                  fulfillment, Life Link keeps the entire
                  operational journey connected and organized.
                </p>
              </div>

            </div>

            <div className="mt-16 overflow-hidden rounded- border border-slate-200 bg-slate-50 shadow-2xl shadow-slate-200/60">

              <div className="grid lg:grid-cols-[280px_1fr]">

                <div className="border-b border-slate-200 bg-white p-4 lg:border-b-0 lg:border-r lg:p-5">

                  <p className="px-4 pb-3 pt-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Platform capabilities
                  </p>

                  <div className="space-y-1">

                    <FeatureSelector
                      active={
                        activeFeature === "inventory"
                      }
                      icon={Droplets}
                      title="Blood inventory"
                      description="Stock visibility"
                      onClick={() =>
                        setActiveFeature("inventory")
                      }
                    />

                    <FeatureSelector
                      active={
                        activeFeature === "matching"
                      }
                      icon={Zap}
                      title="Smart matching"
                      description="Compatibility workflows"
                      onClick={() =>
                        setActiveFeature("matching")
                      }
                    />

                    <FeatureSelector
                      active={
                        activeFeature === "requests"
                      }
                      icon={Hospital}
                      title="Blood requests"
                      description="Request lifecycle"
                      onClick={() =>
                        setActiveFeature("requests")
                      }
                    />

                    <FeatureSelector
                      active={
                        activeFeature === "donations"
                      }
                      icon={Heart}
                      title="Donations"
                      description="Donation lifecycle"
                      onClick={() =>
                        setActiveFeature("donations")
                      }
                    />

                  </div>
                </div>

                <div className="min-h-130 p-5 sm:p-8 lg:p-10">

                  {activeFeature === "inventory" && (
                    <InventoryFeature />
                  )}

                  {activeFeature === "matching" && (
                    <MatchingFeature />
                  )}

                  {activeFeature === "requests" && (
                    <RequestsFeature />
                  )}

                  {activeFeature === "donations" && (
                    <DonationsFeature />
                  )}

                </div>

              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            SOLUTIONS
        ============================================================ */}

        <section
          id="solutions"
          className="scroll-mt-20 bg-slate-50 px-5 py-24 sm:px-6 lg:px-8 lg:py-32"
        >
          <div className="mx-auto max-w-7xl">

            <div className="mx-auto max-w-3xl text-center">

              <SectionEyebrow text="Built around people" />

              <h2 className="mt-4 text-4xl font-black tracking-[-0.035em] text-slate-950 sm:text-5xl">
                Every participant gets the tools they need.
              </h2>

              <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
                Life Link connects distinct responsibilities
                without losing sight of the complete blood-care
                workflow.
              </p>

            </div>

            {/* USER, BLOOD BANK, ADMIN */}

            <div className="mt-16 grid gap-5 lg:grid-cols-3">

              <SolutionCard
                icon={UserRound}
                number="01"
                title="For users"
                description="One account supports both sides of blood care, allowing users to request blood and participate in donation workflows."
                features={[
                  "User profile management",
                  "Donation availability controls",
                  "Blood request creation and tracking",
                  "Compatible matching and donation history",
                ]}
              />

              <SolutionCard
                icon={Building2}
                number="02"
                title="For blood banks"
                description="Manage operational blood inventory, incoming donations, requests, and fulfillment from one workspace."
                features={[
                  "Inventory management",
                  "Request management",
                  "Donation operations",
                  "Fulfillment controls",
                ]}
              />

              <SolutionCard
                icon={ShieldCheck}
                number="03"
                title="For administrators"
                description="Maintain platform oversight through user management, settings, reports, and auditable activity."
                features={[
                  "User administration",
                  "System settings",
                  "Operational reports",
                  "Audit logs",
                ]}
              />

            </div>
          </div>
        </section>

        {/* ============================================================
            FEATURE / IMAGE STORY
        ============================================================ */}

        <section className="bg-white px-5 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-7xl">

            <div className="grid items-center gap-16 lg:grid-cols-2">

              <div className="relative">

                <div className="absolute -inset-6 rounded-[40px] bg-red-100/60 blur-3xl" />

                <div className="relative overflow-hidden rounded-4xl border border-slate-200 bg-slate-100 shadow-2xl">

                  <img
                    src="/image/blood-donation-2.png"
                    alt="Blood donation healthcare environment"
                    loading="lazy"
                    className="h-135 w-full object-cover transition duration-700 hover:scale-105"
                  />

                  <div className="absolute inset-x-5 bottom-5">

                    <div className="rounded-2xl border border-white/15 bg-slate-950/80 p-5 shadow-2xl backdrop-blur-xl">

                      <div className="flex items-start gap-4">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-600">
                          <Heart className="h-5 w-5 fill-white text-white" />
                        </div>

                        <div>

                          <p className="text-sm font-black text-white">
                            Technology serving a human mission
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-300">
                            Every workflow exists to make blood
                            coordination more organized and accessible.
                          </p>

                        </div>

                      </div>
                    </div>
                  </div>

                </div>
              </div>

              <div>

                <SectionEyebrow text="Designed for coordination" />

                <h2 className="mt-4 text-4xl font-black tracking-[-0.035em] text-slate-950 sm:text-5xl">
                  The right information, connected at the right moment.
                </h2>

                <p className="mt-6 text-base leading-8 text-slate-600">
                  Blood management involves multiple participants,
                  decisions, and operational steps. Life Link brings
                  those workflows together instead of leaving them
                  disconnected.
                </p>

                <div className="mt-9 space-y-6">

                  <BenefitRow
                    icon={Network}
                    title="Connect the ecosystem"
                    text="Users, blood banks, and administrators operate within one coordinated system."
                  />

                  <BenefitRow
                    icon={Zap}
                    title="Reduce workflow friction"
                    text="Structured requests, matching, responses, donations, and fulfillment make complex processes easier to manage."
                  />

                  <BenefitRow
                    icon={Activity}
                    title="Maintain operational visibility"
                    text="Inventory and request information can be monitored through dedicated role-based dashboards."
                  />

                  <BenefitRow
                    icon={LockKeyhole}
                    title="Keep access controlled"
                    text="Each role receives access to the workflows and information relevant to its responsibilities."
                  />

                </div>

                <Link
                  to="/register"
                  className="group mt-10 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-black text-white transition duration-300 hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  Enter the Life Link network

                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            WORKFLOW
        ============================================================ */}

        <section
          id="workflow"
          className="scroll-mt-20 relative overflow-hidden bg-slate-950 px-5 py-24 text-white sm:px-6 lg:px-8 lg:py-32"
        >

          <div className="absolute -left-40 top-0 h-125 w-125 rounded-full bg-red-600/10 blur-3xl" />

          <div className="absolute -right-40 bottom-0 h-125 w-125 rounded-full bg-red-600/8 blur-3xl" />

          <div className="absolute inset-0 opacity-[0.025]">

            <div
              className="h-full w-full"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
                backgroundSize: "64px 64px",
              }}
            />

          </div>

          <div className="relative mx-auto max-w-7xl">

            <div className="max-w-3xl">

              <SectionEyebrow
                light
                text="A connected workflow"
              />

              <h2 className="mt-4 text-4xl font-black tracking-[-0.035em] sm:text-5xl lg:text-6xl">
                From account creation to coordinated care.
              </h2>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
                Life Link organizes the major stages of the
                blood donation and request lifecycle into a
                single connected experience.
              </p>

            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

              <WorkflowCard
                number="01"
                icon={Users}
                title="Connect"
                text="Users create accounts and establish the information required for their blood-care activities."
              />

              <WorkflowCard
                number="02"
                icon={Activity}
                title="Match"
                text="Compatible users can be surfaced for active blood requests."
              />

              <WorkflowCard
                number="03"
                icon={Droplets}
                title="Manage"
                text="Donations and inventory are tracked through structured operational workflows."
              />

              <WorkflowCard
                number="04"
                icon={Heart}
                title="Fulfill"
                text="Blood requests move through fulfillment while inventory remains controlled."
              />

            </div>

            <div className="mt-16 hidden lg:block">

              <div className="flex items-center">

                <div className="h-px flex-1 bg-linear-to-r from-red-600/0 via-red-600/50 to-red-600" />

                <div className="mx-4 flex h-8 w-8 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
                  <ChevronRight className="h-4 w-4 text-red-400" />
                </div>

                <div className="h-px flex-1 bg-linear-to-r from-red-600 via-red-600/50 to-red-600/0" />

              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            SECURITY
        ============================================================ */}

        <section
          id="security"
          className="scroll-mt-20 bg-slate-50 px-5 py-24 sm:px-6 lg:px-8 lg:py-32"
        >
          <div className="mx-auto max-w-7xl">

            <div className="grid items-center gap-16 lg:grid-cols-[.9fr_1.1fr]">

              <div>

                <SectionEyebrow text="Security & governance" />

                <h2 className="mt-4 text-4xl font-black tracking-[-0.035em] text-slate-950 sm:text-5xl">
                  Built around controlled access and accountable workflows.
                </h2>

                <p className="mt-6 text-base leading-8 text-slate-600">
                  Life Link is structured so each participant
                  can work within the responsibilities of their
                  role while important administrative activity
                  remains visible through system controls and
                  audit records.
                </p>

                <div className="mt-8">

                  <Link
                    to="/register"
                    className="group inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-red-600/20 transition hover:-translate-y-0.5 hover:bg-red-700"
                  >
                    Get started

                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>

                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">

                <SecurityCard
                  icon={ShieldCheck}
                  title="Role-based authorization"
                  text="Access is organized around user, blood bank, and administrator responsibilities."
                />

                <SecurityCard
                  icon={LockKeyhole}
                  title="Authenticated access"
                  text="Protected application workflows require authenticated user access."
                />

                <SecurityCard
                  icon={BadgeCheck}
                  title="Audit visibility"
                  text="Important administrative and operational activities can be recorded for traceability."
                />

                <SecurityCard
                  icon={Activity}
                  title="Controlled operations"
                  text="Inventory and fulfillment workflows are designed around structured state changes."
                />

              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            PHOTO GALLERY
        ============================================================ */}

        <section className="bg-white px-5 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-7xl">

            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">

              <div className="max-w-3xl">

                <SectionEyebrow text="The human side" />

                <h2 className="mt-4 text-4xl font-black tracking-[-0.035em] text-slate-950 sm:text-5xl">
                  Behind every workflow is a person who needs care.
                </h2>

              </div>

              <p className="max-w-md text-base leading-7 text-slate-600">
                Life Link keeps technology in the background
                so the people and organizations doing the
                important work can stay at the center.
              </p>

            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-12">

              <GalleryCard
                src="/image/blood-donation-3.png"
                alt="Blood donation community"
                className="lg:col-span-4"
                label="Community"
              />

              <GalleryCard
                src="/image/blood-donation-4.png"
                alt="Blood donation experience"
                className="lg:col-span-4"
                label="Donation experience"
              />

              <GalleryCard
                src="/image/blood-donation-5.png"
                alt="Blood donation procedure"
                className="lg:col-span-4"
                label="Care in action"
              />

            </div>
          </div>
        </section>

        {/* ============================================================
            OPERATIONS SECTION
        ============================================================ */}

        <section className="bg-slate-50 px-5 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-7xl">

            <div className="grid items-center gap-16 lg:grid-cols-2">

              <div>

                <SectionEyebrow text="Operational intelligence" />

                <h2 className="mt-4 text-4xl font-black tracking-[-0.035em] text-slate-950 sm:text-5xl">
                  Designed to turn scattered information into one operational picture.
                </h2>

                <p className="mt-6 text-base leading-8 text-slate-600">
                  Life Link gives each operational role a focused
                  dashboard while keeping the underlying workflows
                  connected.
                </p>

                <div className="mt-9 space-y-4">

                  <ChecklistItem text="Blood group compatibility workflows" />

                  <ChecklistItem text="Request and fulfillment tracking" />

                  <ChecklistItem text="Donation lifecycle management" />

                  <ChecklistItem text="Inventory visibility and controls" />

                  <ChecklistItem text="Notifications and operational updates" />

                  <ChecklistItem text="Administrative reporting and audit activity" />

                </div>
              </div>

              <div className="relative">
                <OperationsDashboard />
              </div>

            </div>
          </div>
        </section>

              {/* ============================================================
            DIFFERENTIATOR STRIP
        ============================================================ */}

        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-3">
              <Differentiator
                icon={Sparkles}
                title="One connected platform"
                text="Replace fragmented workflows with a centralized blood-care system."
              />

              <Differentiator
                icon={Zap}
                title="Built for action"
                text="Move from requests and matching to donation and fulfillment through structured workflows."
              />

              <Differentiator
                icon={HeartHandshake}
                title="Human-centered by design"
                text="Technology supports the people responsible for giving, requesting, and coordinating blood care."
              />
            </div>
          </div>
        </section>

        {/* ============================================================
            QUOTE / HUMAN IMPACT
        ============================================================ */}

        <section className="bg-white px-5 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-5xl">
            <div className="relative overflow-hidden rounded-[36px] bg-slate-950 px-7 py-14 text-center shadow-2xl sm:px-12 lg:px-20 lg:py-20">
              <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-red-600/15 blur-3xl" />

              <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-red-600/10 blur-3xl" />

              <Quote className="relative mx-auto h-10 w-10 text-red-500" />

              <blockquote className="relative mx-auto mt-7 max-w-3xl text-2xl font-bold leading-relaxed tracking-tight text-white sm:text-3xl lg:text-4xl">
                “A better-connected blood network gives every participant a
                clearer path from need to action.”
              </blockquote>

              <p className="relative mt-7 text-sm font-semibold text-slate-400">
                The Life Link platform vision
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================
            FINAL CTA
        ============================================================ */}

        <section className="relative overflow-hidden bg-red-600 px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

          <div className="absolute -bottom-40 -right-20 h-125 w-125 rounded-full bg-red-950/20 blur-3xl" />

          <div className="relative mx-auto max-w-7xl">
            <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
              <div className="max-w-3xl">
                <div className="flex items-center gap-2 text-red-100">
                  <Clock3 className="h-5 w-5" />

                  <span className="text-xs font-black uppercase tracking-[0.2em]">
                    Every moment matters
                  </span>
                </div>

                <h2 className="mt-5 text-4xl font-black tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl">
                  Build a more connected blood-care network.
                </h2>

                <p className="mt-5 max-w-2xl text-base leading-8 text-red-100 sm:text-lg">
                  Join Life Link and bring users, blood banks, and
                  administrators into one coordinated platform.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link
                  to="/register"
                  className="group flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-4 text-sm font-black text-red-600 shadow-2xl transition duration-300 hover:-translate-y-1 hover:bg-red-50"
                >
                  Create your account
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-7 py-4 text-sm font-black text-white backdrop-blur-xl transition hover:bg-white/15"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ============================================================
          FOOTER
      ============================================================ */}

      <footer className="bg-slate-950 px-5 py-16 text-slate-400 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12">

            {/* Brand */}

            <div className="lg:col-span-5">
              <Link to="/" className="inline-flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-600">
                  <Droplets className="h-6 w-6 fill-white text-white" />
                </div>

                <div>
                  <div className="text-xl font-black text-white">
                    Life<span className="text-red-500">Link</span>
                  </div>

                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    Connected blood care
                  </p>
                </div>
              </Link>

              <p className="mt-6 max-w-lg text-sm leading-7 text-slate-400">
                A centralized Blood Donation & Blood Request Management System
                connecting users, blood banks, and administrators through one
                coordinated platform.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                <FooterPill icon={ShieldCheck} text="Controlled access" />

                <FooterPill icon={Activity} text="Operational visibility" />

                <FooterPill icon={Heart} text="Human-centered" />
              </div>
            </div>

            {/* Platform */}

            <FooterColumn
              title="Platform"
              links={[
                {
                  label: "Platform",
                  action: () => scrollToSection("platform"),
                },
                {
                  label: "Solutions",
                  action: () => scrollToSection("solutions"),
                },
                {
                  label: "How it works",
                  action: () => scrollToSection("workflow"),
                },
                {
                  label: "Security",
                  action: () => scrollToSection("security"),
                },
              ]}
            />

            {/* Solutions */}

            <FooterColumn
              title="Solutions"
              links={[
                {
                  label: "For users",
                  action: () => scrollToSection("solutions"),
                },
                {
                  label: "For blood banks",
                  action: () => scrollToSection("solutions"),
                },
                {
                  label: "For administrators",
                  action: () => scrollToSection("solutions"),
                },
              ]}
            />

            {/* Account */}

            <div className="lg:col-span-2">
              <h3 className="text-sm font-black text-white">Account</h3>

              <div className="mt-5 space-y-3">
                <Link
                  to="/register"
                  className="block text-sm transition hover:text-white"
                >
                  Create account
                </Link>

                <Link
                  to="/login"
                  className="block text-sm transition hover:text-white"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-14 flex flex-col gap-4 border-t border-slate-800 pt-7 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} Life Link. All rights reserved.
            </p>

            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <span>
                Blood Donation & Blood Request Management System
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ========================================================================
   NAVIGATION COMPONENTS
======================================================================== */

function NavButton({ text, dark, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "text-sm font-bold transition",
        dark
          ? "text-slate-200 hover:text-white"
          : "text-slate-600 hover:text-red-600",
      ].join(" ")}
    >
      {text}
    </button>
  );
}

function MobileNavButton({ text, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left text-sm font-bold text-slate-700 transition hover:bg-red-50 hover:text-red-600"
    >
      {text}

      <ChevronRight className="h-4 w-4" />
    </button>
  );
}

/* ========================================================================
   HERO
======================================================================== */

function HeroTrust({ text }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
      <CheckCircle2 className="h-4 w-4 text-red-400" />
      {text}
    </div>
  );
}

function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-xl">

      {/* Glow */}

      <div className="absolute -inset-8 rounded-[40px] bg-red-600/10 blur-3xl" />

      {/* Main dashboard */}

      <div className="relative rounded-4xl border border-white/15 bg-white/8 p-4 shadow-2xl backdrop-blur-2xl sm:p-5">

        {/* Browser header */}

        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            </div>

            <span className="ml-3 text-[10px] font-semibold text-slate-500">
              lifelink / dashboard
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

            <span className="text-[9px] font-bold text-emerald-300">
              SYSTEM ACTIVE
            </span>
          </div>
        </div>

        {/* Dashboard header */}

        <div className="mt-6 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-300">
              Life Link Network
            </p>

            <h3 className="mt-2 text-2xl font-black text-white">
              Operations overview
            </h3>
          </div>

          <div className="hidden h-11 w-11 items-center justify-center rounded-2xl bg-red-600 shadow-lg shadow-red-950/40 sm:flex">
            <Activity className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Stats */}

        <div className="mt-6 grid grid-cols-3 gap-2.5">
          <DashboardMiniStat
            label="Inventory"
            value="30"
            detail="units"
          />

          <DashboardMiniStat
            label="Blood groups"
            value="8"
            detail="supported"
          />

          <DashboardMiniStat
            label="Requests"
            value="4"
            detail="active"
          />
        </div>

        {/* Inventory */}

        <div className="mt-3 rounded-2xl border border-white/10 bg-white/4 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">
                Inventory overview
              </p>

              <p className="mt-1 text-[10px] text-slate-500">
                Current blood availability
              </p>
            </div>

            <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[9px] font-bold text-emerald-300">
              HEALTHY
            </span>
          </div>

          <div className="mt-5 space-y-3">
            <PreviewInventoryRow
              bloodGroup="O+"
              units="5"
              width="72%"
            />

            <PreviewInventoryRow
              bloodGroup="A+"
              units="5"
              width="68%"
            />

            <PreviewInventoryRow
              bloodGroup="B+"
              units="6"
              width="84%"
            />

            <PreviewInventoryRow
              bloodGroup="AB+"
              units="4"
              width="55%"
            />
          </div>
        </div>

        {/* Activity */}

        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl border border-white/10 bg-white/4 p-3.5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/10">
                <Droplets className="h-4 w-4 text-red-400" />
              </div>

              <div>
                <p className="text-[9px] text-slate-500">
                  Blood requests
                </p>

                <p className="mt-0.5 text-sm font-black text-white">
                  Coordinated
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/4 p-3.5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10">
                <BadgeCheck className="h-4 w-4 text-emerald-400" />
              </div>

              <div>
                <p className="text-[9px] text-slate-500">
                  Access
                </p>

                <p className="mt-0.5 text-sm font-black text-white">
                  Controlled
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating card */}

      <div className="absolute -left-8 top-20 hidden rounded-2xl border border-white/15 bg-slate-900/80 p-3 shadow-2xl backdrop-blur-xl xl:block">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10">
            <HeartHandshake className="h-4 w-4 text-red-400" />
          </div>

          <div>
            <p className="text-[9px] text-slate-500">
              Network
            </p>

            <p className="text-xs font-bold text-white">
              Connected
            </p>
          </div>
        </div>
      </div>

      {/* Floating secure card */}

      <div className="absolute -right-6 bottom-16 hidden rounded-2xl border border-white/15 bg-slate-900/80 p-3 shadow-2xl backdrop-blur-xl xl:block">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>

          <div>
            <p className="text-[9px] text-slate-500">
              Access model
            </p>

            <p className="text-xs font-bold text-white">
              Role based
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardMiniStat({ label, value, detail }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/4 p-3.5">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <div className="mt-2 flex items-end gap-1.5">
        <span className="text-xl font-black text-white">
          {value}
        </span>

        <span className="pb-0.5 text-[9px] text-slate-500">
          {detail}
        </span>
      </div>
    </div>
  );
}

function PreviewInventoryRow({ bloodGroup, units, width }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[10px]">
        <span className="font-bold text-slate-300">
          {bloodGroup}
        </span>

        <span className="font-bold text-slate-500">
          {units} units
        </span>
      </div>

      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-red-500 transition-all duration-700"
          style={{ width }}
        />
      </div>
    </div>
  );
}

/* ========================================================================
   CAPABILITY
======================================================================== */

function Capability({ icon: Icon, title, text }) {
  return (
    <div className="group px-6 py-8 sm:px-8 lg:px-7">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 transition group-hover:bg-red-600 group-hover:text-white">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <h3 className="text-sm font-black text-slate-950">
            {title}
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================
   SECTION HELPERS
======================================================================== */

function SectionEyebrow({ text, light = false }) {
  return (
    <div
      className={[
        "flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em]",
        light ? "text-red-400" : "text-red-600",
      ].join(" ")}
    >
      <span className="h-px w-7 bg-current" />

      {text}
    </div>
  );
}

/* ========================================================================
   PLATFORM FEATURES
======================================================================== */

function FeatureSelector({
  active,
  icon: Icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all duration-300",
        active
          ? "bg-slate-950 text-white shadow-lg"
          : "text-slate-600 hover:bg-slate-50",
      ].join(" ")}
    >
      <div
        className={[
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition",
          active
            ? "bg-red-600 text-white"
            : "bg-slate-100 text-slate-500 group-hover:bg-red-50 group-hover:text-red-600",
        ].join(" ")}
      >
        <Icon className="h-4.5 w-4.5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-black">
          {title}
        </p>

        <p
          className={[
            "mt-0.5 truncate text-[10px]",
            active ? "text-slate-400" : "text-slate-400",
          ].join(" ")}
        >
          {description}
        </p>
      </div>

      <ChevronRight
        className={[
          "h-4 w-4 shrink-0 transition-transform",
          active ? "text-red-400" : "text-slate-300",
        ].join(" ")}
      />
    </button>
  );
}

function FeatureHeader({ eyebrow, title, description }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-600">
        {eyebrow}
      </p>

      <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
        {title}
      </h3>

      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
        {description}
      </p>
    </div>
  );
}

function InventoryFeature() {
  return (
    <div>
      <FeatureHeader
        eyebrow="Inventory control"
        title="Know what is available."
        description="A clear inventory view helps blood banks monitor stock across supported blood groups and identify operational needs."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Total units"
          value="30"
          detail="Current inventory"
        />

        <MetricCard
          label="Blood groups"
          value="8"
          detail="Supported groups"
        />

        <MetricCard
          label="Visibility"
          value="Live"
          detail="Operational view"
        />
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-black text-slate-950">
              Blood group availability
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Example inventory view
            </p>
          </div>

          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-600">
            OPERATIONAL
          </span>
        </div>

        <div className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
          <InventoryBar group="O+" units="5" width="76%" />
          <InventoryBar group="O-" units="3" width="44%" />
          <InventoryBar group="A+" units="5" width="72%" />
          <InventoryBar group="A-" units="3" width="43%" />
          <InventoryBar group="B+" units="6" width="86%" />
          <InventoryBar group="B-" units="2" width="31%" />
          <InventoryBar group="AB+" units="4" width="57%" />
          <InventoryBar group="AB-" units="2" width="30%" />
        </div>
      </div>
    </div>
  );
}

function MatchingFeature() {
  return (
    <div>
      <FeatureHeader
        eyebrow="Smart matching"
        title="Connect compatible users with blood requests."
        description="Life Link uses blood group compatibility workflows to surface relevant user opportunities for active blood requests."
      />

      <div className="mt-8 grid items-center gap-5 md:grid-cols-[1fr_auto_1fr]">
        <MatchPanel
          label="Blood request"
          bloodGroup="O+"
          title="Patient request"
          text="2 units required"
          icon={Hospital}
        />

        <div className="flex h-12 w-12 items-center justify-center justify-self-center rounded-full bg-red-50 text-red-600">
          <ArrowRight className="h-5 w-5" />
        </div>

        <MatchPanel
          label="Compatible user"
          bloodGroup="O+"
          title="Available user"
          text="Eligible match"
          icon={UserRound}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-black text-slate-950">
              Compatibility-aware workflow
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Relevant blood group relationships can be evaluated before
              user response.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RequestsFeature() {
  return (
    <div>
      <FeatureHeader
        eyebrow="Request management"
        title="Follow every request through its lifecycle."
        description="Users can create requests while blood banks and administrators can manage the operational path toward fulfillment."
      />

      <div className="mt-9">
        <RequestTimeline />
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Created"
          value="01"
          detail="Request initiated"
        />

        <MetricCard
          label="Matched"
          value="02"
          detail="Workflow progresses"
        />

        <MetricCard
          label="Fulfilled"
          value="03"
          detail="Inventory updated"
        />
      </div>
    </div>
  );
}

function DonationsFeature() {
  return (
    <div>
      <FeatureHeader
        eyebrow="Donation lifecycle"
        title="Keep donation operations organized."
        description="Donation records move through structured states while completed donations can contribute to blood bank inventory."
      />

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-black text-slate-950">
              Donation lifecycle
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Structured operational flow
            </p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <Droplets className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-7 grid gap-3 md:grid-cols-3">
          <LifecycleStep
            number="01"
            title="Scheduled"
            text="Donation is recorded."
          />

          <LifecycleStep
            number="02"
            title="Completed"
            text="Donation is completed."
          />

          <LifecycleStep
            number="03"
            title="Inventory"
            text="Units enter inventory."
          />
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <MiniInfo
          icon={Heart}
          title="Donation history"
          text="Maintain a structured record of user donation activity."
        />

        <MiniInfo
          icon={Activity}
          title="Inventory integration"
          text="Completed donations can update available stock."
        />
      </div>
    </div>
  );
}

/* ========================================================================
   PLATFORM SMALL COMPONENTS
======================================================================== */

function MetricCard({ label, value, detail }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-slate-500">
        {detail}
      </p>
    </div>
  );
}

function InventoryBar({ group, units, width }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-slate-700">
          {group}
        </span>

        <span className="text-xs font-bold text-slate-400">
          {units} units
        </span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-red-600"
          style={{ width }}
        />
      </div>
    </div>
  );
}

function MatchPanel({
  label,
  bloodGroup,
  title,
  text,
  icon: Icon,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
          {label}
        </span>

        <Icon className="h-4 w-4 text-slate-400" />
      </div>

      <div className="mt-5 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-lg font-black text-red-600">
          {bloodGroup}
        </div>

        <div>
          <p className="text-sm font-black text-slate-950">
            {title}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}

function RequestTimeline() {
  const steps = [
    {
      number: "01",
      title: "Request",
      text: "User creates a blood request.",
    },
    {
      number: "02",
      title: "Match",
      text: "Compatible users can be identified.",
    },
    {
      number: "03",
      title: "Response",
      text: "User response becomes part of the workflow.",
    },
    {
      number: "04",
      title: "Fulfill",
      text: "Blood bank manages fulfillment.",
    },
  ];

  return (
    <div className="relative">
      <div className="absolute left-5 top-5 hidden h-px w-[calc(100%-40px)] bg-slate-200 md:block" />

      <div className="relative grid gap-5 md:grid-cols-4">
        {steps.map((step) => (
          <div
            key={step.number}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-[10px] font-black text-white">
              {step.number}
            </div>

            <h4 className="mt-4 text-sm font-black text-slate-950">
              {step.title}
            </h4>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              {step.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LifecycleStep({ number, title, text }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-[10px] font-black text-white">
          {number}
        </div>

        <h4 className="text-sm font-black text-slate-950">
          {title}
        </h4>
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-500">
        {text}
      </p>
    </div>
  );
}

function MiniInfo({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <Icon className="h-4 w-4" />
        </div>

        <div>
          <h4 className="text-xs font-black text-slate-950">
            {title}
          </h4>

          <p className="mt-1 text-[11px] leading-5 text-slate-500">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================
   SOLUTIONS
======================================================================== */

function SolutionCard({
  icon: Icon,
  number,
  title,
  description,
  features,
}) {
  return (
    <div className="group rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-2xl hover:shadow-slate-200/60 sm:p-8">
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white transition duration-300 group-hover:bg-red-600">
          <Icon className="h-5 w-5" />
        </div>

        <span className="text-xs font-black tracking-[0.15em] text-slate-300">
          {number}
        </span>
      </div>

      <h3 className="mt-7 text-xl font-black tracking-tight text-slate-950">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-600">
        {description}
      </p>

      <div className="mt-7 grid gap-2">
        {features.map((feature) => (
          <div
            key={feature}
            className="flex items-center gap-2.5 text-xs font-semibold text-slate-600"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Check className="h-3 w-3" />
            </span>

            {feature}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ========================================================================
   BENEFITS
======================================================================== */

function BenefitRow({ icon: Icon, title, text }) {
  return (
    <div className="group flex gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 transition duration-300 group-hover:bg-red-600 group-hover:text-white">
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <h3 className="text-sm font-black text-slate-950">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-slate-600">
          {text}
        </p>
      </div>
    </div>
  );
}

/* ========================================================================
   WORKFLOW
======================================================================== */

function WorkflowCard({
  number,
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="group rounded-[26px] border border-white/10 bg-white/4.5 p-6 transition duration-300 hover:-translate-y-1 hover:border-red-500/20 hover:bg-white/[0.07]">
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 shadow-lg shadow-red-950/40">
          <Icon className="h-5 w-5 text-white" />
        </div>

        <span className="text-xs font-black tracking-[0.2em] text-red-400">
          {number}
        </span>
      </div>

      <h3 className="mt-7 text-lg font-black text-white">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-400">
        {text}
      </p>
    </div>
  );
}

/* ========================================================================
   SECURITY
======================================================================== */

function SecurityCard({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-xl">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white transition group-hover:bg-red-600">
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="mt-5 text-sm font-black text-slate-950">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-6 text-slate-500">
        {text}
      </p>
    </div>
  );
}

/* ========================================================================
   GALLERY
======================================================================== */

function GalleryCard({
  src,
  alt,
  label,
  className = "",
}) {
  return (
    <div
      className={[
        "group relative h-97.5 overflow-hidden rounded-[28px] bg-slate-200 shadow-lg",
        className,
      ].join(" ")}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent" />

      <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.15em] text-white/70">
            Life Link
          </p>

          <p className="mt-1 text-lg font-black text-white">
            {label}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-xl">
          <Heart className="h-4 w-4 fill-white text-white" />
        </div>
      </div>
    </div>
  );
}

/* ========================================================================
   OPERATIONS DASHBOARD
======================================================================== */

function OperationsDashboard() {
  return (
    <div className="relative">
      <div className="absolute -inset-5 rounded-[40px] bg-red-100/50 blur-3xl" />

      <div className="relative overflow-hidden rounded-4xl border border-slate-200 bg-white p-4 shadow-2xl sm:p-5">

        {/* Dashboard header */}

        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600">
              <Droplets className="h-5 w-5 fill-white text-white" />
            </div>

            <div>
              <p className="text-xs font-black text-slate-950">
                Life Link
              </p>

              <p className="text-[10px] text-slate-400">
                Operations dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

            <span className="text-[9px] font-black text-emerald-600">
              ACTIVE
            </span>
          </div>
        </div>

        {/* Stats */}

        <div className="mt-5 grid grid-cols-3 gap-2.5">
          <LightStat
            title="Inventory"
            value="30"
            detail="units"
          />

          <LightStat
            title="Requests"
            value="4"
            detail="active"
          />

          <LightStat
            title="Groups"
            value="8"
            detail="supported"
          />
        </div>

        {/* Request card */}

        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-slate-950">
                Request activity
              </p>

              <p className="mt-1 text-[10px] text-slate-400">
                Current operational overview
              </p>
            </div>

            <Hospital className="h-4 w-4 text-slate-400" />
          </div>

          <div className="mt-4 space-y-2.5">
            <OperationRow
              icon={Droplets}
              title="O+ blood request"
              status="In progress"
            />

            <OperationRow
              icon={Heart}
              title="Donation completed"
              status="Recorded"
            />

            <OperationRow
              icon={Activity}
              title="Inventory updated"
              status="Current"
            />
          </div>
        </div>

        {/* Bottom cards */}

        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
              Access
            </p>

            <p className="mt-2 text-sm font-black text-slate-950">
              Role based
            </p>

            <div className="mt-2 flex items-center gap-1.5 text-[9px] font-bold text-emerald-600">
              <CheckCircle2 className="h-3 w-3" />
              Controlled
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
              Workflow
            </p>

            <p className="mt-2 text-sm font-black text-slate-950">
              Connected
            </p>

            <div className="mt-2 flex items-center gap-1.5 text-[9px] font-bold text-red-600">
              <Network className="h-3 w-3" />
              Coordinated
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LightStat({ title, value, detail }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
      <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <div className="mt-2 flex items-end gap-1">
        <span className="text-xl font-black text-slate-950">
          {value}
        </span>

        <span className="pb-0.5 text-[9px] font-semibold text-slate-400">
          {detail}
        </span>
      </div>
    </div>
  );
}

function OperationRow({
  icon: Icon,
  title,
  status,
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
          <Icon className="h-3.5 w-3.5" />
        </div>

        <p className="truncate text-[10px] font-bold text-slate-700">
          {title}
        </p>
      </div>

      <span className="ml-3 shrink-0 text-[9px] font-bold text-slate-400">
        {status}
      </span>
    </div>
  );
}

/* ========================================================================
   DIFFERENTIATORS
======================================================================== */

function Differentiator({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <h3 className="text-sm font-black text-slate-950">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {text}
        </p>
      </div>
    </div>
  );
}

/* ========================================================================
   CHECKLIST
======================================================================== */

function ChecklistItem({ text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <Check className="h-3.5 w-3.5" />
      </div>

      <span className="text-sm font-semibold text-slate-700">
        {text}
      </span>
    </div>
  );
}

/* ========================================================================
   FOOTER
======================================================================== */

function FooterPill({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-2 text-[10px] font-bold text-slate-400">
      <Icon className="h-3.5 w-3.5 text-red-500" />
      {text}
    </div>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div className="lg:col-span-2">
      <h3 className="text-sm font-black text-white">
        {title}
      </h3>

      <div className="mt-5 space-y-3">
        {links.map((link) => (
          <button
            key={link.label}
            type="button"
            onClick={link.action}
            className="block text-left text-sm text-slate-400 transition hover:text-white"
          >
            {link.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Home;