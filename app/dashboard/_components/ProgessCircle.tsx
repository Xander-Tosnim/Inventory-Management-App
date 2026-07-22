'use client'

import { useState } from "react";

/**
 * ProgressCircle
 * A reusable circular progress indicator built with SVG stroke-dasharray.
 *
 * Why SVG instead of clip-path?
 * clip-path with a fixed polygon only ever shows a fixed shape (e.g. exactly half
 * the circle). To support any percentage 0-100 dynamically, SVG's stroke-dasharray
 * lets you "draw" exactly the right amount of the circle's outline.
 *
 * Props:
 * - percentage: number (0-100)
 * - label: string shown big in the center (defaults to "{percentage}%")
 * - sublabel: string shown small under the label
 * - size: diameter in px
 * - strokeWidth: thickness of the ring
 * - trackClassName: tailwind class for the background ring
 * - progressClassName: tailwind class for the active ring (stroke-* color)
 */
function ProgressCircle({
    percentage,
    label,
    sublabel,
    size = 192,
    strokeWidth = 8,
    trackClassName = "stroke-gray-200",
    progressClassName = "stroke-purple-600",
}: {
    percentage: number,
    label?: string,
    sublabel?: string,
    size?: number,
    strokeWidth?: number,
    trackClassName?: string,
    progressClassName?: string
}) {
    const clamped = Math.min(100, Math.max(0, percentage));
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (clamped / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                {/* background track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    className={`fill-none ${trackClassName}`}
                />
                {/* progress arc */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={`fill-none ${progressClassName} transition-[stroke-dashoffset] duration-700 ease-out`}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                        {label ?? `${clamped}%`}
                    </div>
                    {sublabel && <div className="text-sm text-gray-600">{sublabel}</div>}
                </div>
            </div>
        </div>
    );
}

// ---- Demo wrapper so you can see it working live ----
export default function ProgressCircleDemo() {
    const [inStockPercentage, setInStockPercentage] = useState(72);

    return (
        <div className="bg-gray-50 flex flex-col items-center">
            {/* This block mirrors your original card */}
            <div className="bg-white p-6 w-full">
                <div className="flex items-center justify-center">
                    <ProgressCircle percentage={inStockPercentage} sublabel="In Stock" />
                </div>
            </div>

            {/* Slider to prove it's dynamic, not a fixed shape */}
            <div className="w-full max-w-sm">
                <label className="block text-sm text-gray-600">
                    Drag to test any value: {inStockPercentage}%
                </label>
                <label className="text-sm tracking-tighter text-gray-400">(for feature purpose)</label>
                <input
                    type="range"
                    min={0}
                    max={100}
                    value={inStockPercentage}
                    onChange={(e) => setInStockPercentage(Number(e.target.value))}
                    className="w-full accent-purple-600"
                />
            </div>
        </div>
    );
}