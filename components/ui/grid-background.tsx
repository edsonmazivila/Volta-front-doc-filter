import React from "react";
import Image from "next/image";

export const GridBackground = () => {
    return (
        <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
            <div
                className="absolute top-18 left-0 w-full h-[60vh] will-change-transform"
                style={{
                    maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
                    WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
                }}
            >
                <Image
                    src="/top-grid.png"
                    alt=""
                    fill
                    className="object-contain object-top"
                    priority
                />
            </div>

            {/* Bottom Grid */}
            <div
                className="absolute bottom-60 left-0 w-full h-[40vh]"
                style={{
                    maskImage: 'linear-gradient(to top, black 0%, transparent 100%), radial-gradient(circle at center bottom, black 0%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%), radial-gradient(circle at center bottom, black 0%, transparent 100%)',
                    maskComposite: 'intersect',
                    WebkitMaskComposite: 'source-in'
                }}
            >
                <Image
                    src="/bottom-grid.png"
                    alt=""
                    fill
                    className="object-cover object-top"
                    priority
                />
            </div>

            {/* Center Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-[60vw] h-[50vh] opacity-40 pointer-events-none mix-blend-screen bg-blue-500/20 blur-[100px] rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[900px] opacity-100 pointer-events-none">
                <Image
                    src="/glow.png"
                    alt=""
                    fill
                    priority
                />
            </div>

            {/* Center vignetting to ensure text readability */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,10,10,0.8)_100%)] pointer-events-none" />
        </div>
    );
};
