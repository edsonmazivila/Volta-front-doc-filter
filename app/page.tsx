
import Hero from "../components/hero";
import HomeHeader from "../components/home-header";
import { Features } from "@/components/features";


export default function Home() {
  return (
    <main className="bg-[#030009]">
      <HomeHeader />
      <Hero />
      <div className="max-w-4xl mx-auto min-h-screen flex flex-col items-center justify-center">
        <Features />
      </div>
      {/* Temporarily hiding footer for future reuse */}
      {/*
      <Footer/>
      */}
    </main>
  );
}
