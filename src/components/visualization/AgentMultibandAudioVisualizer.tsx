import React, { useEffect, useState } from "react";

type VisualizerState = "listening" | "idle" | "speaking" | "thinking";
type AgentFaceVisualizerProps = {
  state: VisualizerState;
  barWidth: number;
  minBarHeight: number;
  maxBarHeight: number;
  accentColor: string;
  accentShade?: number;
  frequencies: Float32Array[];
  borderRadius: number;
  gap: number;
};

export const AgentFaceVisualizer: React.FC<AgentFaceVisualizerProps> = ({
  state,
  barWidth,
  minBarHeight,
  maxBarHeight,
  accentColor,
  accentShade,
  frequencies,
  borderRadius,
  gap,
}) => {
  const [thinkingIndex, setThinkingIndex] = useState(0);
  const [thinkingDirection, setThinkingDirection] = useState<"left" | "right">("right");
  const [isBlinking, setIsBlinking] = useState(false);
  const [pupilPosition, setPupilPosition] = useState({ x: 0, y: 0 });

  const numMouthBars = 3; 
  const eyeSize = maxBarHeight / 2;
  const pupilSize = eyeSize / 4;

  useEffect(() => {
    if (state !== "thinking") {
      setThinkingIndex(0);
      return;
    }
    const timeout = setTimeout(() => {
      if (thinkingDirection === "right") {
        if (thinkingIndex === numMouthBars - 1) {
          setThinkingDirection("left");
          setThinkingIndex((prev) => prev - 1);
        } else {
          setThinkingIndex((prev) => prev + 1);
        }
      } else {
        if (thinkingIndex === 0) {
          setThinkingDirection("right");
          setThinkingIndex((prev) => prev + 1);
        } else {
          setThinkingIndex((prev) => prev - 1);
        }
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [state, thinkingDirection, thinkingIndex, numMouthBars]);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000);

    return () => clearInterval(blinkInterval);
  }, []);

  useEffect(() => {
    if (state === "speaking") {
      setPupilPosition({ x: 5, y: 5 }); // Simulate looking slightly towards the user
    } else {
      const movePupil = setInterval(() => {
        const newPupilPosition = {
          x: Math.random() * 10 - 5,
          y: Math.random() * 10 - 5,
        };
        setPupilPosition(newPupilPosition);
      }, 2000);

      return () => clearInterval(movePupil);
    }
  }, [state]);

  const renderEyes = () => (
    <div className="flex justify-center space-x-12 mb-10">
      <div
        className={`relative bg-${accentColor}-${accentShade} rounded-lg ${isBlinking ? "opacity-0" : "opacity-100"} transition-opacity duration-150`}
        style={{ width: eyeSize, height: eyeSize }}
      >
        <div
          className="absolute bg-black rounded-full"
          style={{
            width: pupilSize,
            height: pupilSize,
            transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
          }}
        ></div>
      </div>
      <div
        className={`relative bg-${accentColor}-${accentShade} rounded-lg ${isBlinking ? "opacity-0" : "opacity-100"} transition-opacity duration-150`}
        style={{ width: eyeSize, height: eyeSize }}
      >
        <div
          className="absolute bg-black rounded-full"
          style={{
            width: pupilSize,
            height: pupilSize,
            transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
          }}
        ></div>
      </div>
    </div>
  );

  const renderMouth = () => {
    const smileYOffset = Array.from({ length: numMouthBars }, (_, index) => {
      const midPoint = Math.floor(numMouthBars / 2);
      return Math.abs(index - midPoint) * -8;
    });

    const smileCurve = Array.from({ length: numMouthBars }, (_, index) => {
      const midPoint = Math.floor(numMouthBars / 2);
      return 1 - Math.abs(index - midPoint) * 0.15;
    });

    return Array.from({ length: numMouthBars }, (_, index) => {
      const frequencyIndex = Math.floor((index / (numMouthBars - 1)) * (frequencies[0]?.length || 1));
      const frequency = frequencies.reduce((sum, band) => sum + (band[frequencyIndex] || 0), 0) / frequencies.length;
      const height = (minBarHeight + frequency * (maxBarHeight - minBarHeight)) * smileCurve[index];

      let color = `${accentColor}-${accentShade}`;
      if (state === "listening" || state === "idle") {
        color = index === Math.floor(numMouthBars / 2) ? `${accentColor}-${accentShade}` : "gray-950";
      } else if (state === "speaking") {
        color = `${accentColor}${accentShade ? "-" + accentShade : ""}`;
      } else if (state === "thinking") {
        color = index === thinkingIndex ? `${accentColor}-${accentShade}` : "gray-950";
      }

      return (
        <div
          className={`bg-${color}`}
          key={`mouth-${index}`}
          style={{
            height: `${height}px`,
            borderRadius: borderRadius + "px",
            width: barWidth + "px",
            transition: "background-color 0.35s ease-out, transform 0.25s ease-out, height 0.35s ease-out",
            transform: `translateY(${smileYOffset[index]}px) scale(${smileCurve[index]})`,
          }}
        ></div>
      );
    });
  };

  return (
    <div className="flex flex-col items-center">
      {renderEyes()}
      <div
        className="flex flex-row items-end justify-center"
        style={{ gap: gap + "px", marginTop: "30px" }}
      >
        {renderMouth()}
      </div>
    </div>
  );
};

export default AgentFaceVisualizer;
