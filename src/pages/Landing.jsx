import { Link } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import MagneticCard from '../components/ui/MagneticCard';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import { Globe, Bot, MessageCircle, Rocket } from '../components/ui/icons';

function Landing() {
  const features = [
    { icon: Globe, title: 'GPS Presence', desc: 'Discover students nearby and connect based on location proximity.' },
    { icon: Bot, title: 'AI Matching', desc: 'Get personalized recommendations based on interests and compatibility.' },
    { icon: MessageCircle, title: 'Live Chat', desc: 'Real-time messaging with instant notifications and presence indicators.' },
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-16 pt-10 text-white">
      <div className="grid items-center gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.28em] text-white/60">CampusConnect</p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Connect. Discover.
            <span className="text-[var(--accent)]"> Grow.</span>
          </h1>
          <p className="text-lg text-white/70">
            Connect with students on campus through AI-powered matching, location-based discovery, and real-time chat.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/signup">
              <Button variant="primary" icon={<Icon icon={Rocket} size={18} decorative />}>
                Get Started
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-white/60">
            <span className="rounded-full border border-white/10 px-3 py-1">Realtime chat</span>
            <span className="rounded-full border border-white/10 px-3 py-1">AI matching</span>
            <span className="rounded-full border border-white/10 px-3 py-1">GPS presence</span>
          </div>
        </div>

        <GlassCard className="relative overflow-hidden p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 via-indigo-500/10 to-cyan-400/12" />
          <div className="relative space-y-4">
            <p className="text-sm uppercase tracking-[0.22em] text-white/60">Live glimpse</p>
            <div className="grid gap-4">
              {features.map((f) => (
                <MagneticCard key={f.title} className="glass-border rounded-2xl bg-white/5 p-4 shadow-glass">
                  <div className="flex items-start gap-3">
                    <Icon icon={f.icon} size={24} className="text-[var(--accent)] flex-shrink-0" decorative />
                    <div>
                      <p className="text-base font-semibold">{f.title}</p>
                      <p className="text-sm text-white/70">{f.desc}</p>
                    </div>
                  </div>
                </MagneticCard>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {features.map((f) => (
          <MagneticCard key={f.title} className="glass-border rounded-2xl bg-white/5 p-5 shadow-glass">
            <div className="flex items-center gap-3 text-lg font-semibold">
              <Icon icon={f.icon} size={24} className="text-[var(--accent)]" decorative />
              <span>{f.title}</span>
            </div>
            <p className="mt-2 text-sm text-white/70">{f.desc}</p>
          </MagneticCard>
        ))}
      </div>
    </div>
  );
}

export default Landing;
