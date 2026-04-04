import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, Zap, RefreshCw, ArrowRight, BarChart3, Users, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="landing-wrapper animate-fade-in" style={{ background: 'var(--bg-base)', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* ─── Navbar ──────────────────────────────────────────────────────────── */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.5rem 2rem',
        maxWidth: 1200,
        margin: '0 auto',
        position: 'relative',
        zIndex: 10
      }}>
        <div className="sidebar-logo" style={{ padding: 0, border: 'none' }}>
          <div className="logo-icon">📊</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 0 }}>FinanceOS</h2>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {user ? (
            <Link to="/dashboard" className="btn btn-primary btn-sm">Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm" style={{ border: 'none' }}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm" style={{ borderRadius: 'var(--radius-full)' }}>Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {/* ─── Hero Section ────────────────────────────────────────────────────── */}
      <header className="landing-hero" style={{
        padding: '6rem 2rem 4rem',
        maxWidth: 1200,
        margin: '0 auto',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Abstract Glow Background */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '60vw',
          height: '60vw',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="badge" style={{ marginBottom: '1.5rem', background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.5rem 1rem' }}>
            ✨ Version 2.0 Now Live
          </div>
          <h1 className="landing-title" style={{
            fontSize: 'max(3.5rem, 6vw)',
            lineHeight: 1.1,
            fontWeight: 800,
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #fff 40%, var(--primary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em'
          }}>
            Finance Management <br />
            Redefined for Teams.
          </h1>
          <p className="landing-hero-subtitle" style={{
            fontSize: '1.25rem',
            color: 'var(--text-secondary)',
            maxWidth: 600,
            margin: '0 auto 2.5rem',
            lineHeight: 1.6
          }}>
            Real-time analytics, optimistic concurrency, and a secure trash bin.
            Experience the most robust finance dashboard designed for speed and clarity.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={handleCTA} style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
              Create Account <ArrowRight size={20} />
            </button>
            <Link to="/login" className="btn btn-ghost btn-lg" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
              Member Login
            </Link>
          </div>
        </div>

        {/* Mock Preview Card */}
        <div className="animate-slide-up" style={{ marginTop: '5rem', padding: '0 1rem' }}>
          <div className="card-glass" style={{
            maxWidth: 1000,
            margin: '0 auto',
            height: 480,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            background: 'linear-gradient(180deg, rgba(13,13,31,0.6) 0%, rgba(6,6,19,0.9) 100%)',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 -20px 40px rgba(0,0,0,0.4)'
          }}>
             {/* Mock Dashboard Content (Skeleton UI) */}
             <div className="landing-mock-dashboard" style={{ padding: '2rem', display: 'flex', gap: '2rem', height: '100%', opacity: 0.7 }}>
                {/* Mock Sidebar */}
                <div className="hidden-mobile" style={{ width: 200, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ height: 32, width: '80%', background: 'rgba(99, 102, 241, 0.2)', borderRadius: 8, marginBottom: '1rem' }} />
                  <div style={{ height: 20, width: '100%', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 6 }} />
                  <div style={{ height: 20, width: '90%', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 6 }} />
                  <div style={{ height: 20, width: '95%', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 6 }} />
                  <div style={{ height: 20, width: '85%', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 6 }} />
                </div>
                {/* Mock Main Content */}
                <div className="landing-mock-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ height: 28, width: 250, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 6 }} />
                    <div className="hidden-mobile" style={{ height: 36, width: 120, background: 'rgba(99, 102, 241, 0.2)', borderRadius: 18 }} />
                  </div>
                  {/* KPI Cards */}
                  <div className="landing-mock-kpis" style={{ display: 'flex', gap: '1.5rem' }}>
                    {[1, 2, 3].map(i => (
                      <div key={i} style={{ flex: 1, height: 110, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: 12, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ height: 16, width: '40%', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 4 }} />
                        <div style={{ height: 32, width: '70%', background: 'rgba(255, 255, 255, 0.1)', borderRadius: 6 }} />
                      </div>
                    ))}
                  </div>
                  {/* Chart/Table Area */}
                  <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ height: 20, width: 150, background: 'rgba(255, 255, 255, 0.05)', borderRadius: 4 }} />
                    <div style={{ height: 2, width: '100%', background: 'rgba(255, 255, 255, 0.02)' }} />
                    <div style={{ flex: 1, background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.1) 0%, transparent 100%)', borderRadius: 8 }} />
                  </div>
                </div>
             </div>
             {/* Gradient Shine */}
             <div style={{
               position: 'absolute',
               inset: 0,
               background: 'linear-gradient(45deg, transparent 40%, rgba(99, 102, 241, 0.04) 50%, transparent 60%)',
               animation: 'pulse 8s infinite linear',
               pointerEvents: 'none'
             }} />
          </div>
        </div>
      </header>

      {/* ─── Features Section ────────────────────────────────────────────────── */}
      <section style={{
        padding: '5rem 2rem',
        maxWidth: 1200,
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>Why FinanceOS?</h2>
          <p style={{ color: 'var(--text-muted)' }}>Enterprise-grade features in a sleek, intuitive interface.</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem'
        }}>
          {features.map((f, i) => (
            <div key={i} className="card-glass" style={{
              padding: '2.5rem',
              transition: 'transform 0.3s ease',
              cursor: 'default'
            }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
               onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div className="kpi-icon-wrap" style={{ width: 56, height: 56, borderRadius: '1rem', background: f.color + '1a', color: f.color, marginBottom: '1.5rem' }}>
                <f.icon size={26} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Stats Section ───────────────────────────────────────────────────── */}
      <section style={{
        padding: '5rem 2rem',
        background: 'rgba(99, 102, 241, 0.02)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div className="landing-stats" style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: '3rem',
          textAlign: 'center'
        }}>
          <div>
            <h4 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>$1.2B</h4>
            <p style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Volume Tracked</p>
          </div>
          <div>
            <h4 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '0.25rem' }}>99.9%</h4>
            <p style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Uptime SLA</p>
          </div>
          <div>
            <h4 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--success)', marginBottom: '0.25rem' }}>15k+</h4>
            <p style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Active Users</p>
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────────────── */}
      <footer style={{
        padding: '4rem 2rem',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.875rem'
      }}>
        <p>© {new Date().getFullYear()} Zorvyn FinanceOS. Built with Passion for Google DeepMind.</p>
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
          <a href="#" style={{ color: 'inherit' }}>Terms</a>
          <a href="#" style={{ color: 'inherit' }}>Privacy</a>
          <a href="#" style={{ color: 'inherit' }}>Security</a>
        </div>
      </footer>
    </div>
  );
};

const features = [
  {
    title: 'Real-time Analytics',
    desc: 'Instant visual insights into your cash flow, categories, and trends without manual refresh.',
    icon: BarChart3,
    color: '#6366f1'
  },
  {
    title: 'Optimistic Concurrency',
    desc: 'Worry-free multi-admin editing. Our versioning prevents data conflicts and overrides.',
    icon: Zap,
    color: '#0ea5e9'
  },
  {
    title: 'Secure Trash Bin',
    desc: 'Accidental deletion? No problem. Recover your records instantly from the managed trash bin.',
    icon: RefreshCw,
    color: '#f59e0b'
  },
  {
    title: 'Role-Based Access',
    desc: 'Granular control for Admins, Analysts, and Viewers. Keep sensitive data safe and organized.',
    icon: Lock,
    color: '#10b981'
  }
];

export default LandingPage;
