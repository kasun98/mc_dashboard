'use client';

import { useEffect, useRef } from 'react';

export default function BackgroundEffect() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // State for smooth animation
        let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        let current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const handleMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        // Linear interpolation for smooth movement
        const lerp = (start, end, factor) => {
            return start + (end - start) * factor;
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Smoothly move current position towards mouse
            current.x = lerp(current.x, mouse.x, 0.08); // 0.08 factor for smooth lag
            current.y = lerp(current.y, mouse.y, 0.08);

            const gradientSize = 600; // Large size for "background color moving" feel

            // Create a large, soft radial gradient
            const gradient = ctx.createRadialGradient(
                current.x,
                current.y,
                0,
                current.x,
                current.y,
                gradientSize
            );

            // Shades of blue, very low opacity for subtlety
            gradient.addColorStop(0, 'rgba(14, 165, 233, 0.15)'); // Center: Cyan-ish, low intensity
            gradient.addColorStop(0.4, 'rgba(79, 70, 229, 0.1)'); // Mid: Indigo-ish
            gradient.addColorStop(1, 'rgba(79, 70, 229, 0)');     // Edge: Transparent

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            animationFrameId = requestAnimationFrame(animate);
        };

        // Init
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', handleMouseMove);
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0,
                filter: 'blur(60px)', // Extra CSS blur for extreme softness
            }}
        />
    );
}
