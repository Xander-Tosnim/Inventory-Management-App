"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { TextPlugin } from "gsap/all";
import Link from "next/link";

gsap.registerPlugin(TextPlugin);

export default function HeroHome() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const timeline = gsap.timeline({
        defaults: {
          duration: 0.8,
          ease: "power3.out",
        },
      });

      gsap.to(container.current, {
        "--bg-start": "#c084fc",
        "--bg-end": "#f3e8ff",
        duration: 2,
        ease: "ease.inOut",
        repeat: -1,
        yoyo: true,
      });

      gsap.from(".hero-word", {
        y: -40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
      });

      gsap.to(".typing-text", {
        text: "Manage Your Inventory Smarter!",
        duration: 4,
        ease: "none",
      });

      timeline
        .from(".hero-heading", {
          x: 100,
          opacity: 0,
        })
        .from(
          ".hero-description",
          {
            x: -100,
            opacity: 0,
          },
          "-=0.4",
        )
        .from(
          ".hero-button",
          {
            y: 30,
            opacity: 0,
            duration: 0.7,
            stagger: 0.15,
          },
          "-=0.2",
        );
    },
    { scope: container },
  );

  return (
    <div
      ref={container}
      style={
        {
          "--bg-start": "#f3e8ff",
          "--bg-end": "#c084fc",
          backgroundImage:
            "linear-gradient(to bottom right, var(--bg-start), var(--bg-end))",
        } as React.CSSProperties
      }
      className="min-h-screen flex items-center justify-center"
    >
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="hero-heading text-5xl font-bold text-gray-900 mb-6 flex justify-center gap-3">
            {["Inventory", "App"].map((word) => (
              <span key={word} className="hero-word inline-block">
                {word}
              </span>
            ))}
          </h1>

          <p className="typing-text text-gray-100 text-xl"></p>

          <p className="hero-description text-2xl font-thin text-gray-600 m-8 max-w-2xl mx-auto">
            Streamline your inventory tracking with our powerful, easy-to-use
            management system. Track products, monitor stock levels, and gain
            valuable insights.
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/sign-in"
              className="hero-button bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Sign In
            </Link>

            <Link
              href="#"
              className="hero-button bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold border-2 border-purple-600 hover:bg-purple-50 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
