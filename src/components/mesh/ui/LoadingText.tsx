import React, { useState, useEffect, useRef } from "react";

interface LoadingTextProps {
    text: string;
    speed?: number;
    wait?: number;
}

export default function LoadingText({ text, speed = 200, wait = 0 }: LoadingTextProps) {
    const [displayedText, setDisplayedText] = useState("");
    const [randomChar, setRandomChar] = useState("");

    useEffect(() => {
        const timeout = setTimeout(() => {
            let index = 0;
            setDisplayedText("");

            const randomInterval = setInterval(() => {
                if (index < text.length - 1) {
                    setRandomChar(String.fromCharCode(33 + Math.random() * 94));
                } else {
                    setRandomChar("");
                    clearInterval(randomInterval);
                }
            }, 100);

            const revealInterval = setInterval(() => {
                if (index < text.length) {
                    setDisplayedText(text.substring(0, index + 1));
                    index += 1;
                    console.log(text, index);
                } else {
                    clearInterval(revealInterval);
                }
            }, Math.random() * 200 + speed - 100);

            return () => {
                clearInterval(randomInterval);
                clearInterval(revealInterval);
            };

        }, wait);

        return () => clearTimeout(timeout); // Cleanup timeout on unmount
    }, [text, speed, wait]);

    return (
        <div>
            {displayedText}
            <span style={{ opacity: 0.8 }}>{randomChar}</span>
            {displayedText.length < text.length && <span style={{ opacity: 0.8 }}>_</span>}
        </div>
    );
};
