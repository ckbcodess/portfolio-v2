"use client";

import { motion } from "motion/react";

/**
 * Signature component using a refined expo ease-out curve 
 * for a more "impeccable" and smooth writing experience.
 */
export function Signature({ className }: { className?: string }) {
  // Expo curve recommended by the /animate workflow for decisive, premium motion
  const easeExpo = [0.16, 1, 0.3, 1];

  const pathVariants = {
    hidden: { 
      pathLength: 0, 
      opacity: 0 
    },
    visible: (custom: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { 
          delay: custom, 
          duration: 0.5, 
          ease: easeExpo 
        },
        opacity: { 
          delay: custom, 
          duration: 0.2, 
          ease: [0, 0, 1, 1] as const
        }
      },
    }),
  } satisfies import("motion/react").Variants;

  return (
    <motion.div 
      className={`relative cursor-default ${className}`}
    >
      <motion.svg
        width="64"
        height="62"
        viewBox="0 0 64 62"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {/* Ransford (Main Body) */}
        <motion.path
          d="M5.18338 14.2263C9.1583 36.0089 13.1332 57.7914 13.7897 60.6256C14.4461 63.4599 11.6637 46.6857 8.99811 40.5884C6.33251 34.4912 3.86806 39.579 2.39975 43.4721C0.93144 47.3651 0.533947 49.909 0.368926 52.412C0.203904 54.915 0.283399 57.2999 3.14654 54.5536C6.00969 51.8073 11.6541 43.8575 17.6225 36.8604C23.5909 29.8634 29.7122 24.06 34.5749 19.9574C39.4375 15.8548 42.856 13.6289 46.0877 11.8064C49.3194 9.98399 52.2609 8.63252 55.0481 7.53882C57.8354 6.44511 60.3793 5.65013 63.0003 4.83105"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeLinecap="round"
          variants={pathVariants}
          custom={0.2}
          className="drop-shadow-[0_0_8px_rgba(255,255,255,0.1)] dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.05)]"
        />
        {/* "K" Part 1 */}
        <motion.path
          d="M20.1194 1.45801C16.6215 16.1652 13.1236 30.8724 12.8718 37.5743C12.6201 44.2763 15.7205 42.5273 17.755 41.2686C19.7894 40.0099 20.6639 39.2944 24.1751 39.522C27.6862 39.7497 33.8076 40.9422 40.1145 42.1708"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeLinecap="round"
          variants={pathVariants}
          custom={0.5}
        />
        {/* "K" Part 2 */}
        <motion.path
          d="M24.4549 2.18088C26.6013 7.18927 28.7478 12.1977 27.7071 12.7108C26.6664 13.2239 22.3735 9.09 20.5594 6.96041C18.7454 4.83082 19.5404 4.83082 21.4207 4.39358C26.2877 3.26177 31.3399 0.193417 33.2792 0.322299C35.3947 0.462894 30.7666 8.71901 31.3664 10.8016C31.9663 12.8842 35.6232 10.5788 38.8188 8.11916C42.0144 5.65953 44.6378 3.11558 45.9495 2.24231C47.2612 1.36903 47.1817 2.24351 44.3584 8.93462C41.535 15.6257 35.9701 28.107 32.9046 35.2919C29.8391 42.4769 29.4416 43.9874 29.2368 44.9642C29.032 45.9411 29.032 46.3386 29.032 46.7481"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeLinecap="round"
          variants={pathVariants}
          custom={0.7}
        />
      </motion.svg>
    </motion.div>
  );
}
