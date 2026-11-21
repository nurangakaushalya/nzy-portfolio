import React from 'react';

/**
 * Shared Ambient Background Gradient Meshes:
 * Reusable ambient lighting used across every public page (Work, Services, Categories, About, Contact).
 * Positioned fixed across the full viewport so it covers short pages and remains visible through the bottom of long pages.
 */
export const AmbientBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* Glow Orb 1: Upper right warm vibrant orange glow */}
      <div className="absolute -top-32 -right-24 h-[550px] w-[550px] sm:h-[750px] sm:w-[750px] rounded-full bg-gradient-to-br from-[#FF6A00]/18 via-[#FF4500]/9 to-transparent blur-[110px] transform-gpu" />

      {/* Glow Orb 2: Mid left deep ember & amber glow */}
      <div className="absolute top-[35%] -left-36 h-[600px] w-[600px] sm:h-[800px] sm:w-[800px] rounded-full bg-gradient-to-tr from-[#FF5500]/13 via-[#B83000]/8 to-transparent blur-[130px] transform-gpu" />

      {/* Glow Orb 3: Lower right rich crimson / dusk aura */}
      <div className="absolute top-[68%] -right-28 h-[550px] w-[550px] sm:h-[720px] sm:w-[720px] rounded-full bg-gradient-to-bl from-[#FF7A1A]/14 via-[#7A1540]/8 to-transparent blur-[125px] transform-gpu" />

      {/* Glow Orb 4: Bottom left warm deep amber glow */}
      <div className="absolute -bottom-28 left-[12%] h-[550px] w-[550px] sm:h-[750px] sm:w-[750px] rounded-full bg-gradient-to-t from-[#FF6A00]/14 via-[#E64A00]/7 to-transparent blur-[120px] transform-gpu" />

      {/* Subtle decorative radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,40,10,0.14),rgba(0,0,0,0))]" />
    </div>
  );
};
