import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { getApiErrorMessage } from "../../utils/errorHandler";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Droplets,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Package,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

/* =========================================================
   BLOOD PARTICLE PHYSICS
   ---------------------------------------------------------
   SLOW ZERO-GRAVITY MOVEMENT

   - No gravity
   - No air resistance
   - Full-area movement
   - Slow smooth movement
   - Elastic wall bouncing
   - Elastic particle collision
   - Particle repulsion
   - Minimum velocity prevents stopping
========================================================= */

/*
 * x/y are percentages of the particle area.
 *
 * This is important because the particle container can have
 * different sizes on desktop, tablet and mobile.
 */
const BLOOD_PARTICLES = [
  { x: 7, y: 12, vx: 0.030, vy: 0.018, r: 6 },
  { x: 24, y: 27, vx: -0.024, vy: 0.020, r: 5 },
  { x: 43, y: 9, vx: 0.022, vy: 0.030, r: 7 },
  { x: 61, y: 31, vx: -0.020, vy: 0.021, r: 5 },
  { x: 79, y: 14, vx: 0.026, vy: 0.024, r: 6 },
  { x: 92, y: 38, vx: -0.023, vy: 0.019, r: 5 },

  { x: 14, y: 51, vx: 0.021, vy: -0.020, r: 5 },
  { x: 34, y: 68, vx: -0.025, vy: -0.017, r: 6 },
  { x: 55, y: 57, vx: 0.020, vy: -0.021, r: 5 },
  { x: 72, y: 73, vx: -0.021, vy: -0.019, r: 6 },
  { x: 88, y: 62, vx: 0.023, vy: -0.020, r: 5 },
  { x: 48, y: 89, vx: -0.019, vy: -0.018, r: 5 },
];

/* =========================================================
   BLOOD PARTICLE FIELD
========================================================= */

function BloodParticleField() {
  const containerRef = useRef(null);
  const particleRefs = useRef([]);
  const animationRef = useRef(null);

  /*
   * The original x/y values are percentages.
   *
   * We convert them into real pixels once the container
   * dimensions are known.
   */
  const particlesRef = useRef(
    BLOOD_PARTICLES.map((particle) => ({
      ...particle,
      xPercent: particle.x,
      yPercent: particle.y,
      x: 0,
      y: 0,
      initialized: false,
    }))
  );

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    let width = 0;
    let height = 0;

    /* =======================================================
       CONTAINER SIZE
    ======================================================= */

    const updateSize = () => {
      width = container.clientWidth;
      height = container.clientHeight;

      /*
       * Convert percentage positions into actual pixels.
       *
       * This fixes the original problem where values such as
       * x: 80 were interpreted as 80px instead of 80%.
       */
      particlesRef.current.forEach((particle) => {
        if (!particle.initialized) {
          particle.x =
            (particle.xPercent / 100) * width;

          particle.y =
            (particle.yPercent / 100) * height;

          particle.initialized = true;
        } else {
          /*
           * Keep particles inside the new container when the
           * screen is resized.
           */
          particle.x = Math.min(
            Math.max(particle.x, particle.r),
            Math.max(particle.r, width - particle.r)
          );

          particle.y = Math.min(
            Math.max(particle.y, particle.r),
            Math.max(particle.r, height - particle.r)
          );
        }
      });
    };

    updateSize();

    const resizeObserver = new ResizeObserver(
      updateSize
    );

    resizeObserver.observe(container);

    /* =======================================================
       SLOW PARTICLE PHYSICS
    ======================================================= */

    /*
     * Velocity is measured in pixels per millisecond.
     *
     * These values are intentionally much smaller than the
     * previous version so the droplets move slowly.
     */
    const minimumSpeed = 0.020;
    const maximumSpeed = 0.052;

    const wallBounce = 1;
    const collisionBounce = 0.82;

    /* =======================================================
       KEEP PARTICLES MOVING
    ======================================================= */

    const maintainVelocity = (particle) => {
      let speed = Math.sqrt(
        particle.vx * particle.vx +
          particle.vy * particle.vy
      );

      /*
       * If a particle becomes too slow, gently restore its
       * velocity without making it suddenly fast.
       */
      if (speed < minimumSpeed) {
        if (speed === 0) {
          const angle =
            Math.random() * Math.PI * 2;

          particle.vx =
            Math.cos(angle) * minimumSpeed;

          particle.vy =
            Math.sin(angle) * minimumSpeed;
        } else {
          const multiplier =
            minimumSpeed / speed;

          particle.vx *= multiplier;
          particle.vy *= multiplier;
        }
      }

      speed = Math.sqrt(
        particle.vx * particle.vx +
          particle.vy * particle.vy
      );

      /*
       * Prevent collisions from making droplets too fast.
       */
      if (speed > maximumSpeed) {
        const multiplier =
          maximumSpeed / speed;

        particle.vx *= multiplier;
        particle.vy *= multiplier;
      }
    };

    /* =======================================================
       ANIMATION LOOP
    ======================================================= */

    let previousTime = performance.now();

    const animate = (currentTime) => {
      const particles = particlesRef.current;

      /*
       * Limit elapsed time so a browser lag/frame drop does
       * not cause particles to jump across the screen.
       */
      const elapsed = Math.min(
        currentTime - previousTime,
        32
      );

      previousTime = currentTime;

      if (width > 0 && height > 0) {
        /* ===================================================
           MOVE PARTICLES
        =================================================== */

        particles.forEach((particle) => {
          maintainVelocity(particle);

          particle.x +=
            particle.vx * elapsed;

          particle.y +=
            particle.vy * elapsed;

          /* ================================================
             LEFT WALL
          ================================================ */

          if (
            particle.x - particle.r <
            0
          ) {
            particle.x = particle.r;

            particle.vx =
              Math.abs(particle.vx) *
              wallBounce;
          }

          /* ================================================
             RIGHT WALL
          ================================================ */

          if (
            particle.x + particle.r >
            width
          ) {
            particle.x =
              width - particle.r;

            particle.vx =
              -Math.abs(particle.vx) *
              wallBounce;
          }

          /* ================================================
             TOP WALL
          ================================================ */

          if (
            particle.y - particle.r <
            0
          ) {
            particle.y = particle.r;

            particle.vy =
              Math.abs(particle.vy) *
              wallBounce;
          }

          /* ================================================
             BOTTOM WALL
          ================================================ */

          if (
            particle.y + particle.r >
            height
          ) {
            particle.y =
              height - particle.r;

            particle.vy =
              -Math.abs(particle.vy) *
              wallBounce;
          }
        });

        /* ===================================================
           PARTICLE COLLISIONS
        =================================================== */

        for (
          let i = 0;
          i < particles.length;
          i++
        ) {
          for (
            let j = i + 1;
            j < particles.length;
            j++
          ) {
            const a = particles[i];
            const b = particles[j];

            const dx = b.x - a.x;
            const dy = b.y - a.y;

            let distance = Math.sqrt(
              dx * dx + dy * dy
            );

            let normalX;
            let normalY;

            /*
             * Prevent division by zero if two particles happen
             * to occupy exactly the same position.
             */
            if (distance < 0.001) {
              const angle =
                Math.random() *
                Math.PI *
                2;

              normalX = Math.cos(angle);
              normalY = Math.sin(angle);

              distance = 0.001;
            } else {
              normalX = dx / distance;
              normalY = dy / distance;
            }

            /*
             * Extra spacing makes the repulsion visually
             * clearer.
             */
            const minimumDistance =
              a.r + b.r + 3;

            if (
              distance <
              minimumDistance
            ) {
              /* =============================================
                 SEPARATE PARTICLES
              ============================================= */

              const overlap =
                minimumDistance -
                distance;

              const correction =
                overlap * 0.5;

              a.x -=
                normalX * correction;

              a.y -=
                normalY * correction;

              b.x +=
                normalX * correction;

              b.y +=
                normalY * correction;

              /* =============================================
                 ELASTIC COLLISION
              ============================================= */

              const relativeVelocityX =
                b.vx - a.vx;

              const relativeVelocityY =
                b.vy - a.vy;

              const velocityAlongNormal =
                relativeVelocityX *
                  normalX +
                relativeVelocityY *
                  normalY;

              /*
               * Only collide when particles are moving
               * toward one another.
               */
              if (
                velocityAlongNormal < 0
              ) {
                const impulse =
                  -(
                    1 +
                    collisionBounce
                  ) *
                  velocityAlongNormal /
                  2;

                a.vx -=
                  impulse * normalX;

                a.vy -=
                  impulse * normalY;

                b.vx +=
                  impulse * normalX;

                b.vy +=
                  impulse * normalY;
              }

              /* =============================================
                 SOFT REPULSION
              ============================================= */

              const repulsionStrength =
                0.006;

              a.vx -=
                normalX *
                repulsionStrength;

              a.vy -=
                normalY *
                repulsionStrength;

              b.vx +=
                normalX *
                repulsionStrength;

              b.vy +=
                normalY *
                repulsionStrength;

              maintainVelocity(a);
              maintainVelocity(b);
            }
          }
        }

        /* ===================================================
           KEEP PARTICLES INSIDE AFTER COLLISIONS
        =================================================== */

        particles.forEach((particle) => {
          const radius = particle.r;

          if (
            particle.x - radius <
            0
          ) {
            particle.x = radius;
          }

          if (
            particle.x + radius >
            width
          ) {
            particle.x =
              width - radius;
          }

          if (
            particle.y - radius <
            0
          ) {
            particle.y = radius;
          }

          if (
            particle.y + radius >
            height
          ) {
            particle.y =
              height - radius;
          }
        });

        /* ===================================================
           RENDER
        =================================================== */

        particles.forEach(
          (particle, index) => {
            const element =
              particleRefs.current[index];

            if (!element) {
              return;
            }

            element.style.transform = `
              translate3d(
                ${particle.x}px,
                ${particle.y}px,
                0
              )
              translate(-50%, -50%)
            `;
          }
        );
      }

      animationRef.current =
        requestAnimationFrame(
          animate
        );
    };

    animationRef.current =
      requestAnimationFrame(
        animate
      );

    /* =======================================================
       CLEANUP
    ======================================================= */

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(
          animationRef.current
        );
      }

      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-y-0 right-0 z-0 w-full overflow-hidden lg:w-[58%]"
      aria-hidden="true"
    >
      {/* ===================================================
          SOFT ATMOSPHERIC GLOW
      =================================================== */}

      <div className="absolute right-[8%] top-[8%] h-52 w-52 rounded-full bg-red-200/20 blur-3xl" />

      <div className="absolute bottom-[5%] right-[25%] h-48 w-48 rounded-full bg-rose-200/20 blur-3xl" />

      {/* ===================================================
          SLOW ZERO-G BLOOD DROPS
      =================================================== */}

      {BLOOD_PARTICLES.map(
        (particle, index) => (
          <span
            key={index}
            ref={(element) => {
              particleRefs.current[index] =
                element;
            }}
            className="absolute left-0 top-0 block"
            style={{
              width: `${particle.r * 2}px`,
              height: `${particle.r * 2.35}px`,
              transform:
                "translate3d(0, 0, 0) translate(-50%, -50%)",
              willChange: "transform",
            }}
          >
            {/* =============================================
                BLOOD DROP BODY
            ============================================= */}

            <span
              className="absolute inset-0 block bg-linear-to-br from-red-400 via-red-500 to-rose-600 shadow-[0_4px_14px_rgba(239,68,68,0.28)]"
              style={{
                borderRadius:
                  "55% 55% 60% 60% / 48% 48% 72% 72%",

                clipPath:
                  "polygon(50% 0%, 66% 22%, 84% 47%, 91% 65%, 84% 82%, 68% 94%, 50% 100%, 32% 94%, 16% 82%, 9% 65%, 16% 47%, 34% 22%)",
              }}
            >
              {/* ===========================================
                  BLOOD DROP HIGHLIGHT
              =========================================== */}

              <span
                className="absolute rounded-full bg-white/55"
                style={{
                  width: "28%",
                  height: "20%",
                  left: "27%",
                  top: "20%",
                  transform:
                    "rotate(-18deg)",
                }}
              />

              {/* ===========================================
                  SOFT INNER SHINE
              =========================================== */}

              <span
                className="absolute rounded-full bg-red-300/25 blur-[1px]"
                style={{
                  width: "45%",
                  height: "30%",
                  left: "30%",
                  top: "48%",
                }}
              />
            </span>
          </span>
        )
      )}

      {/* ===================================================
          SMALL DECORATIVE BLOOD DROPS
      =================================================== */}

      <span
        className="absolute right-[12%] top-[17%] block h-3 w-2.5 rotate-[-8deg] bg-red-400/35"
        style={{
          borderRadius:
            "55% 55% 65% 65% / 45% 45% 75% 75%",

          clipPath:
            "polygon(50% 0%, 70% 25%, 90% 55%, 85% 78%, 65% 95%, 50% 100%, 35% 95%, 15% 78%, 10% 55%, 30% 25%)",
        }}
      />

      <span
        className="absolute bottom-[18%] right-[38%] block h-2.5 w-2 rotate-12 bg-rose-400/35"
        style={{
          borderRadius:
            "55% 55% 65% 65% / 45% 45% 75% 75%",

          clipPath:
            "polygon(50% 0%, 70% 25%, 90% 55%, 85% 78%, 65% 95%, 50% 100%, 35% 95%, 15% 78%, 10% 55%, 30% 25%)",
        }}
      />

      <span
        className="absolute right-[48%] top-[35%] block h-2 w-1.5 rotate-[-15deg] bg-red-400/30"
        style={{
          borderRadius:
            "55% 55% 65% 65% / 45% 45% 75% 75%",

          clipPath:
            "polygon(50% 0%, 70% 25%, 90% 55%, 85% 78%, 65% 95%, 50% 100%, 35% 95%, 15% 78%, 10% 55%, 30% 25%)",
        }}
      />
    </div>
  );
}

/* =========================================================
   MAIN DASHBOARD
========================================================= */

function BloodBankDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =========================================================
     FETCH DASHBOARD
  ========================================================= */

  const fetchDashboard = async (
    isRefresh = false
  ) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await api.get(
        "/inventory/dashboard",
        {
          params: {
            _t: Date.now(),
          },

          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        }
      );

      setDashboard(response.data);
    } catch (err) {
      console.error(
        "Failed to load blood bank dashboard:",
        err
      );

      setError(
        getApiErrorMessage(
          err,
          "Failed to load blood bank dashboard."
        )
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    fetchDashboard(false);
  }, []);

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  /* =========================================================
     INVENTORY
  ========================================================= */

  const inventory =
    dashboard?.inventory || [];

  const totalUnits = useMemo(() => {
    return inventory.reduce(
      (total, item) =>
        total +
        Number(
          item.units_available || 0
        ),
      0
    );
  }, [inventory]);

  const lowStockCount = useMemo(() => {
    return inventory.filter(
      (item) =>
        Number(
          item.units_available || 0
        ) <= 5
    ).length;
  }, [inventory]);

  const healthyStockCount = useMemo(() => {
    return inventory.filter(
      (item) =>
        Number(
          item.units_available || 0
        ) > 5
    ).length;
  }, [inventory]);

  const outOfStockCount = useMemo(() => {
    return inventory.filter(
      (item) =>
        Number(
          item.units_available || 0
        ) === 0
    ).length;
  }, [inventory]);

  /* =========================================================
     STOCK STATUS
  ========================================================= */

  const getStockStatus = (units) => {
    const value = Number(
      units || 0
    );

    if (value === 0) {
      return {
        label: "Out of Stock",
        className:
          "border-red-200 bg-red-50 text-red-600",
        icon: AlertTriangle,
      };
    }

    if (value <= 5) {
      return {
        label: "Low Stock",
        className:
          "border-amber-200 bg-amber-50 text-amber-600",
        icon: AlertTriangle,
      };
    }

    return {
      label: "Available",
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-600",
      icon: CheckCircle2,
    };
  };

  /* =========================================================
     QUICK ACTIONS
  ========================================================= */

  const quickActions = [
    {
      title: "Blood Requests",
      description:
        "Review incoming blood requirements and manage fulfillment.",
      icon: Droplets,
      route: "/blood-bank/requests",
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
      hoverBorder:
        "hover:border-red-200",
      actionColor: "text-red-600",
    },

    {
      title: "Donations",
      description:
        "View user donations and manage donation completion.",
      icon: HeartPulse,
      route: "/blood-bank/donations",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      hoverBorder:
        "hover:border-blue-200",
      actionColor: "text-blue-600",
    },

    {
      title: "Blood Bank Profile",
      description:
        "View and maintain your blood bank information.",
      icon: Building2,
      route: "/blood-bank/profile",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      hoverBorder:
        "hover:border-purple-200",
      actionColor: "text-purple-600",
    },

    {
      title: "Notifications",
      description:
        "Stay informed about important system updates and alerts.",
      icon: Bell,
      route: "/blood-bank/notifications",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      hoverBorder:
        "hover:border-amber-200",
      actionColor: "text-amber-600",
    },
  ];

  /* =========================================================
     LOADING SCREEN
  ========================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7fafc]">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/20">
                <Droplets className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-lg font-extrabold tracking-tight text-slate-800">
                  Life Link
                </h1>

                <p className="text-xs font-medium text-slate-500">
                  Blood Bank Dashboard
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 sm:flex">
              <ShieldCheck className="h-4 w-4 text-blue-600" />

              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Blood Bank
              </span>
            </div>
          </div>
        </header>

        <div className="flex min-h-[75vh] items-center justify-center px-5">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-100 bg-red-50">
              <LoaderIcon />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-800">
              Loading blood bank dashboard
            </h2>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Retrieving your latest inventory and operational information.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN DASHBOARD
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#f7fafc] text-slate-800">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 lg:px-8">

          {/* BRAND */}

          <button
            type="button"
            onClick={() =>
              navigate(
                "/blood-bank/dashboard"
              )
            }
            className="flex min-w-0 items-center gap-3 text-left"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/20">
              <Droplets className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-extrabold tracking-tight text-slate-800 sm:text-xl">
                Life Link
              </h1>

              <p className="truncate text-xs font-medium text-slate-500 sm:text-sm">
                Blood Bank Dashboard
              </p>
            </div>
          </button>

          {/* HEADER ACTIONS */}

          <div className="flex items-center gap-2 sm:gap-3">

            <div className="hidden items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 md:flex">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Building2 className="h-4 w-4" />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-700">
                  Blood Bank
                </p>

                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  Operational access
                </p>
              </div>
            </div>

            {/* REFRESH */}

            <button
              type="button"
              onClick={() =>
                fetchDashboard(true)
              }
              disabled={refreshing}
              aria-label="Refresh dashboard"
              title="Refresh dashboard"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              <span className="hidden sm:inline">
                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}
              </span>
            </button>

            {/* LOGOUT */}

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-500 px-3 text-sm font-bold text-white shadow-sm shadow-red-500/20 transition hover:bg-red-600 hover:shadow-md sm:px-4"
            >
              <LogOut className="h-4 w-4" />

              <span className="hidden sm:inline">
                Logout
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-5 py-7 lg:px-8 lg:py-9">

        {/* ===================================================
            HERO
        =================================================== */}

        <section className="relative mb-8 overflow-hidden rounded-3xl border border-red-100 bg-linear-to-br from-white via-red-50/70 to-rose-50 p-6 shadow-sm sm:p-8">

          {/* DECORATIVE BACKGROUND */}

          <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-red-100/50" />

          <div className="absolute -bottom-20 right-28 h-56 w-56 rounded-full bg-blue-100/30" />

          {/* SLOW BLOOD PARTICLES */}

          <BloodParticleField />

          {/* HERO CONTENT */}

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">

            <div className="max-w-3xl">

              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-red-500 shadow-sm ring-1 ring-red-100">
                  <LayoutDashboard className="h-4 w-4" />
                </span>

                <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-red-500">
                  Blood Bank Operations
                </span>
              </div>

              <h2 className="text-3xl font-black tracking-tight text-slate-800 sm:text-4xl">
                Welcome,{" "}
                {user?.name ||
                  "Blood Bank"}!
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                Manage your blood inventory, respond to blood requests, coordinate donations, and keep your blood bank operations running smoothly.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/blood-bank/requests"
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-red-500/20 transition hover:bg-red-600"
                >
                  Review Requests

                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/blood-bank/inventory"
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                >
                  View Inventory

                  <ChevronRight className="h-4 w-4" />
                </button>

              </div>
            </div>

            {/* ROLE CARD */}

            <div className="relative rounded-2xl border border-white bg-white/90 p-5 shadow-sm backdrop-blur">

              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <ShieldCheck className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Account Role
                  </p>

                  <p className="mt-1 text-base font-extrabold text-slate-800">
                    {user?.role ||
                      "BLOOD_BANK"}
                  </p>
                </div>

              </div>

              <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2">

                <span className="h-2 w-2 rounded-full bg-emerald-500" />

                <span className="text-xs font-bold text-emerald-700">
                  Active operational account
                </span>

              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (
          <div className="mb-7 flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-500">
                <AlertTriangle className="h-5 w-5" />
              </div>

              <div>

                <p className="font-bold text-red-800">
                  Unable to load dashboard
                </p>

                <p className="mt-1 text-sm leading-6 text-red-600">
                  {error}
                </p>

              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                fetchDashboard(true)
              }
              disabled={refreshing}
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              Try Again
            </button>
          </div>
        )}

        {/* ===================================================
            METRICS
        =================================================== */}

        <section className="mb-8">

          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <h3 className="text-xl font-extrabold text-slate-800">
                Inventory Overview
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                A quick view of your current blood stock.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Clock3 className="h-3.5 w-3.5" />

              Live inventory data
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <MetricCard
              label="Total Inventory"
              value={totalUnits}
              description="Blood units available"
              icon={Package}
              iconClass="bg-red-50 text-red-500"
              loading={loading}
            />

            <MetricCard
              label="Blood Groups"
              value={inventory.length}
              description="Inventory categories"
              icon={Droplets}
              iconClass="bg-blue-50 text-blue-600"
              loading={loading}
            />

            <MetricCard
              label="Low Stock"
              value={lowStockCount}
              description="Groups needing attention"
              icon={AlertTriangle}
              iconClass="bg-amber-50 text-amber-600"
              loading={loading}
            />

            <MetricCard
              label="Healthy Stock"
              value={healthyStockCount}
              description="Groups above threshold"
              icon={CheckCircle2}
              iconClass="bg-emerald-50 text-emerald-600"
              loading={loading}
            />

          </div>
        </section>

        {/* ===================================================
            INVENTORY
        =================================================== */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

            <div className="flex items-start gap-3">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <Activity className="h-5 w-5" />
              </div>

              <div>

                <div className="flex items-center gap-2">

                  <h3 className="text-xl font-extrabold text-slate-800">
                    Blood Inventory
                  </h3>

                  {!loading && (
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
                      {inventory.length} groups
                    </span>
                  )}

                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Current stock levels across all blood groups.
                </p>

              </div>
            </div>

            <div className="flex gap-2">

              <button
                type="button"
                onClick={() =>
                  fetchDashboard(true)
                }
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
              >

                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing
                      ? "animate-spin"
                      : ""
                  }`}
                />

                <span className="hidden sm:inline">
                  Refresh
                </span>

              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/blood-bank/inventory"
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-red-500/20 transition hover:bg-red-600"
              >

                Manage Inventory

                <ArrowRight className="h-4 w-4" />

              </button>

            </div>
          </div>

          <div className="p-5 sm:p-6">

            {inventory.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                  <Package className="h-7 w-7 text-slate-400" />
                </div>

                <h4 className="mt-5 text-lg font-bold text-slate-700">
                  No inventory records found
                </h4>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Your blood inventory does not contain any records yet. Add or manage inventory to see blood group availability here.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/blood-bank/inventory"
                    )
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-600"
                >
                  Open Inventory

                  <ArrowRight className="h-4 w-4" />
                </button>

              </div>
            ) : (
              <>

                {/* INVENTORY SUMMARY */}

                <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500">
                        <Package className="h-4 w-4" />
                      </div>

                      <div>

                        <p className="text-xs font-semibold text-slate-400">
                          Total Units
                        </p>

                        <p className="text-lg font-extrabold text-slate-800">
                          {totalUnits}
                        </p>

                      </div>

                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>

                      <div>

                        <p className="text-xs font-semibold text-slate-400">
                          Healthy Groups
                        </p>

                        <p className="text-lg font-extrabold text-slate-800">
                          {healthyStockCount}
                        </p>

                      </div>

                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                        <AlertTriangle className="h-4 w-4" />
                      </div>

                      <div>

                        <p className="text-xs font-semibold text-slate-400">
                          Needs Attention
                        </p>

                        <p className="text-lg font-extrabold text-slate-800">
                          {lowStockCount}
                        </p>

                      </div>

                    </div>
                  </div>

                </div>

                {/* BLOOD GROUP GRID */}

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">

                  {inventory.map((item) => {

                    const units = Number(
                      item.units_available ||
                        0
                    );

                    const stockStatus =
                      getStockStatus(
                        units
                      );

                    const StatusIcon =
                      stockStatus.icon;

                    return (
                      <div
                        key={
                          item.blood_group
                        }
                        className={`group rounded-2xl border p-4 text-center transition duration-300 hover:-translate-y-1 hover:shadow-md ${
                          units === 0
                            ? "border-red-200 bg-red-50/40"
                            : units <= 5
                            ? "border-amber-200 bg-amber-50/30"
                            : "border-slate-200 bg-white hover:border-emerald-200"
                        }`}
                      >

                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 ring-4 ring-red-50">

                          <span className="text-sm font-black text-red-600">
                            {
                              item.blood_group
                            }
                          </span>

                        </div>

                        <p className="mt-4 text-2xl font-black text-slate-800">
                          {units}
                        </p>

                        <p className="text-xs font-medium text-slate-400">
                          units
                        </p>

                        <div
                          className={`mx-auto mt-3 flex w-fit items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-bold ${stockStatus.className}`}
                        >

                          <StatusIcon className="h-3 w-3" />

                          {
                            stockStatus.label
                          }

                        </div>

                      </div>
                    );
                  })}

                </div>
              </>
            )}
          </div>
        </section>

        {/* ===================================================
            QUICK ACTIONS
        =================================================== */}

        <section className="mt-9">

          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <LayoutDashboard className="h-5 w-5" />
                </div>

                <h3 className="text-xl font-extrabold text-slate-800">
                  Quick Access
                </h3>

              </div>

              <p className="mt-2 text-sm text-slate-500">
                Access the main blood bank management areas.
              </p>

            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {quickActions.map(
              (action) => {

                const Icon =
                  action.icon;

                return (
                  <button
                    key={
                      action.title
                    }
                    type="button"
                    onClick={() =>
                      navigate(
                        action.route
                      )
                    }
                    className={`group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${action.hoverBorder}`}
                  >

                    <div className="flex items-start justify-between">

                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.iconBg}`}
                      >

                        <Icon
                          className={`h-6 w-6 ${action.iconColor}`}
                        />

                      </div>

                      <ArrowUpRight
                        className={`h-5 w-5 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${action.iconColor}`}
                      />

                    </div>

                    <h4 className="mt-6 text-lg font-extrabold text-slate-800">
                      {action.title}
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {
                        action.description
                      }
                    </p>

                    <div
                      className={`mt-5 flex items-center gap-1 text-sm font-bold ${action.actionColor}`}
                    >
                      Open section

                      <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </div>

                  </button>
                );
              }
            )}

          </div>
        </section>

        {/* ===================================================
            OPERATIONAL SUMMARY
        =================================================== */}

        <section className="mt-9 rounded-3xl border border-blue-100 bg-linear-to-br from-blue-50 via-white to-red-50 p-6 shadow-sm sm:p-8">

          <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">

            <div>

              <div className="flex items-center gap-2">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm ring-1 ring-blue-100">
                  <Building2 className="h-5 w-5" />
                </div>

                <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-400">
                  Operational Summary
                </span>

              </div>

              <h3 className="mt-5 text-2xl font-black tracking-tight text-slate-800">
                Your blood bank currently holds{" "}
                {totalUnits}{" "}
                {totalUnits === 1
                  ? "unit"
                  : "units"}{" "}
                of blood.
              </h3>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">

                There are{" "}

                <span className="font-bold text-emerald-600">
                  {healthyStockCount} healthy stock groups
                </span>{" "}

                and{" "}

                <span className="font-bold text-amber-600">
                  {lowStockCount} groups requiring attention
                </span>.

                {outOfStockCount >
                  0 && (
                  <>
                    {" "}

                    <span className="font-bold text-red-500">
                      {outOfStockCount}{" "}
                      {outOfStockCount ===
                      1
                        ? "group is"
                        : "groups are"}{" "}
                      currently out of stock.
                    </span>
                  </>
                )}

              </p>
            </div>

            <div className="flex flex-wrap gap-3 lg:flex-nowrap">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/blood-bank/donations"
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              >
                Donations

                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/blood-bank/requests"
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-red-500/20 transition hover:bg-red-600"
              >
                Manage Requests

                <ArrowRight className="h-4 w-4" />
              </button>

            </div>
          </div>
        </section>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <footer className="mt-10 border-t border-slate-200 py-7">

          <div className="flex flex-col gap-3 text-center text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:text-left">

            <div className="flex items-center justify-center gap-2 sm:justify-start">

              <Droplets className="h-4 w-4 text-red-500" />

              <span className="font-bold text-slate-500">
                Life Link
              </span>

              <span>•</span>

              <span>
                Blood Bank Dashboard
              </span>

            </div>

            <div className="flex items-center justify-center gap-2">

              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

              <span>
                Blood bank operations center
              </span>

            </div>

          </div>
        </footer>

      </main>
    </div>
  );
}

/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  iconClass,
  loading,
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">

      <div className="flex items-start justify-between">

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />

      </div>

      <div className="mt-6">

        <p className="text-sm font-semibold text-slate-500">
          {label}
        </p>

        <div className="mt-1">

          {loading ? (
            <span className="inline-block h-9 w-16 animate-pulse rounded-lg bg-slate-100" />
          ) : (
            <p className="text-3xl font-black tracking-tight text-slate-800">
              {value}
            </p>
          )}

        </div>

        <p className="mt-1 text-xs font-medium text-slate-400">
          {description}
        </p>

      </div>
    </div>
  );
}

/* =========================================================
   LOADING ICON
========================================================= */

function LoaderIcon() {
  return (
    <RefreshCw className="h-8 w-8 animate-spin text-red-500" />
  );
}

export default BloodBankDashboard;