import React from "react";
import Image from "next/image";
import { Spotlight } from "@/components/ui/spotlight";
import { Button } from "@/components/ui";
import Link from "next/link";
import { Marquee } from "@/components/ui/marquee";

const Hero = () => {
  return (
    <div className="relative min-h-screen flex flex-col w-full overflow-hidden bg-transparent ">
      {/* Left beam */}
      <Spotlight
        className="-top-32 -left-80 md:h-[50%] md:block hidden"
        fill="white"
      />
      {/* Bottom moon image */}
      <div className="z-10 mx-auto w-full max-w-7xl p-4 mt-24">
        <h1 className="tracking-wide leading-tight bg-opacity-50 bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-center text-4xl font-bold text-transparent md:text-7xl">
          All‑in‑one HR & <br />
          Payroll Platform
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-center text-base md:text-lg font-normal text-neutral-300">
          Streamline employee management, time & attendance, documents, and
          payroll in a secure system with bank approvals and actionable
          reporting.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button
            variant="primaryGradient"
            className="px-8 py-4 text-lg font-semibold"
            asChild
          >
            <Link href="/signup">Get Started Free</Link>
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center w-full">
        <Image
          src="/moon.png"
          alt="Moon"
          width={1920}
          height={1080}
          priority
          className="absolute bottom-0 left-1/2 -translate-x-1/2 opacity-90 w-full h-auto md:block hidden max-w-7xl"
        />
        <h1 className="absolute bottom-36 text-white text-2xl font-bold text-center mb-4">
          Trusted by Companies of All Sizes
        </h1>
        <div className="absolute bottom-12 overflow-hidden max-w-4xl">
          <Marquee>
            <Image
              src="/ts.png"
              alt="ts"
              width={60}
              height={50}
              className="w-16 h-16"
            />
            <Image
              src="/nextjs.webp"
              alt="nextjs"
              width={60}
              height={50}
              className="w-16 h-16"
            />
            <Image
              src="/figma.png"
              alt="figma"
              width={60}
              height={50}
              className="w-16 h-16"
            />
          </Marquee>
          <div className="from-[#030009] absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r"></div>
          <div className="from-[#030009] absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l"></div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
