import '../client/metal-lazarus-client/src/Styles/animations.css';

export default function SplashPage() {
  return (
    <div className="relative h-screen w-full bg-gradient-to-br from-black to-gray-900 text-white overflow-hidden flex items-center justify-center">
      <div className="text-center z-10">
        <img src="/metal-lazarus-logo.png" alt="Metal Lazarus Logo" />
        <p className="text-lg italic mb-2">Welcome to your sanctuary from chaos.</p>
        <p className="text-sm text-gray-400">Aligning our rotations...</p>
      </div>

      {/* Orbital Animation */}
      <div className="absolute w-32 h-32 animate-spin-slow">
        <div className="w-4 h-4 bg-purple-400 rounded-full shadow-lg absolute top-0 left-1/2 transform -translate-x-1/2" />
      </div>

      {/* Fog Layer */}
      <div className="absolute inset-0 bg-[url('/metal-lazarus-splash-page.png')] bg-cover bg-center opacity-20 z-0" />
    </div>
  );
}
