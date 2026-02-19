import { useEffect, useRef, useState } from "react";
import { getOddsRank } from "../../utils/odds";

/**
 * 個別のオッズカード
 * オッズランクに応じた色分け + 正解/不正解の表示を行う
 *
 * @param {Object} props
 * @param {Object} props.choice - { id, text }
 * @param {number} props.odds - オッズ値
 * @param {string|null} props.revealedAnswer - 正解の choiceId (null = 未発表)
 * @param {boolean} props.isRevealed - 正解発表済みか
 */
export default function OddsCard({ choice, odds, revealedAnswer, isRevealed }) {
  const [isShimmering, setIsShimmering] = useState(false);
  const prevOddsRef = useRef(odds);

  // オッズ変動時にシマーアニメーションを発火
  useEffect(() => {
    if (prevOddsRef.current !== odds && odds !== undefined) {
      setIsShimmering(true);
      const timer = setTimeout(() => setIsShimmering(false), 1500);
      prevOddsRef.current = odds;
      return () => clearTimeout(timer);
    }
  }, [odds]);

  const rank = odds !== undefined ? getOddsRank(odds) : "normal";
  const isCorrect = isRevealed && choice.id === revealedAnswer;
  const isIncorrect = isRevealed && choice.id !== revealedAnswer;

  // ランク別のバッジテキスト
  const rankLabel = {
    favorite: "人気",
    normal: "通常",
    longshot: "大穴",
  };

  // CSSクラスの構築
  const classes = [
    "odds-card",
    `odds-card--${rank}`,
    isShimmering ? "odds-card--shimmer" : "",
    isCorrect ? "odds-card--correct" : "",
    isIncorrect ? "odds-card--incorrect" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      role="region"
      aria-label={`選択肢${choice.id}: ${choice.text}、オッズ ${odds ?? "-"}倍`}
    >
      <div className="odds-card__header">
        <span className="odds-card__choice-id">{choice.id}</span>
        {odds !== undefined && (
          <span className="odds-card__rank-badge">{rankLabel[rank]}</span>
        )}
      </div>

      <p className="odds-card__text">{choice.text}</p>

      <div className="odds-card__odds">
        {odds !== undefined ? odds.toFixed(1) : "-.-"}
        <span className="odds-card__odds-suffix">倍</span>
      </div>
    </div>
  );
}
