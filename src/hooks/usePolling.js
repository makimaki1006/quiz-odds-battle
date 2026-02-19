import { useEffect, useRef } from "react";

/**
 * 指定間隔でコールバックを実行するポーリングhook
 * @param {Function} callback - ポーリング時に実行する関数
 * @param {number} interval - ミリ秒 (default: 5000)
 * @param {boolean} enabled - ポーリング有効/無効
 */
export function usePolling(callback, interval = 5000, enabled = true) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    // 初回即実行
    savedCallback.current();

    const id = setInterval(() => savedCallback.current(), interval);
    return () => clearInterval(id);
  }, [interval, enabled]);
}
