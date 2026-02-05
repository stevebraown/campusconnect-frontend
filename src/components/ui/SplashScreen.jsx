// Full-screen splash screen for app loading states
import Logo from './Logo';

function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xl">
      <div className="flex flex-col items-center gap-4">
        <Logo
          size="xl"
          showText={false}
          linkToHome={false}
          className="opacity-90"
        />
        <p className="text-xs uppercase tracking-[0.3em] text-white/70">CampusConnect</p>
      </div>
    </div>
  );
}

export default SplashScreen;
