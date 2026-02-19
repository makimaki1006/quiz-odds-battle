import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { useGame } from "../../hooks/useGameState";

/**
 * 正解発表時に紙吹雪エフェクトを発火するコンポーネント
 * phase === "revealing" のとき左右から金色パーティクルを発射
 */
export default function ConfettiEffect() {
  const { state } = useGame();
  const hasFiredRef = useRef(false);

  useEffect(() => {
    if (state.phase === "revealing" && !hasFiredRef.current) {
      hasFiredRef.current = true;

      // 金色系のカラーパレット
      const colors = ["#e2b714", "#f5d442", "#ffd700", "#ffeb3b", "#00b894"];

      // 左側から発射
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { x: 0.1, y: 0.6 },
        colors,
        angle: 60,
        startVelocity: 45,
      });

      // 右側から発射
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { x: 0.9, y: 0.6 },
        colors,
        angle: 120,
        startVelocity: 45,
      });

      // 0.5秒後に追加発射 (中央)
      setTimeout(() => {
        confetti({
          particleCount: 60,
          spread: 100,
          origin: { x: 0.5, y: 0.5 },
          colors,
          startVelocity: 35,
        });
      }, 500);
    }

    // フェーズが変わったら発火フラグをリセット
    if (state.phase !== "revealing") {
      hasFiredRef.current = false;
    }
  }, [state.phase]);

  // DOM要素は不要 (canvas-confetti が独自canvasを使用)
  return null;
}
