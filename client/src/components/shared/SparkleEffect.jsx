import { useEffect, useRef, useCallback } from 'react'

const rand = (min, max) => Math.random() * (max - min) + min

function createSparkle() {
  return {
    id: Math.random(),
    x: rand(0, 100),
    y: rand(0, 100),
    size: rand(4, 10),
    duration: rand(600, 1200),
    delay: rand(0, 400),
  }
}

export default function SparkleEffect({ count = 8, className = '' }) {
  const containerRef = useRef(null)
  const liveRef = useRef(0)

  const addSparkle = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    // `count` caps how many sparkles are alive at once. It was accepted and
    // then never read, so Hero's count={4} did nothing and the interval
    // spawned without any bound at all.
    if (liveRef.current >= count) return

    /* Read CSS variable so sparkle colour matches current theme */
    const fill = getComputedStyle(document.documentElement)
      .getPropertyValue('--sparkle-fill').trim() || '#ffffff'

    const sparkle = createSparkle()
    const el = document.createElement('span')
    el.style.cssText = `
      position: absolute;
      left: ${sparkle.x}%;
      top: ${sparkle.y}%;
      width: ${sparkle.size}px;
      height: ${sparkle.size}px;
      pointer-events: none;
      z-index: 1;
      animation: sparkle-in ${sparkle.duration}ms ease-in-out ${sparkle.delay}ms forwards;
    `
    el.innerHTML = `<svg width="${sparkle.size}" height="${sparkle.size}" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L13.5 9.5L21 12L13.5 14.5L12 22L10.5 14.5L3 12L10.5 9.5L12 2Z" fill="${fill}" opacity="0.8"/>
    </svg>`

    container.appendChild(el)
    liveRef.current += 1
    setTimeout(() => {
      el.remove()
      liveRef.current -= 1
    }, sparkle.duration + sparkle.delay + 100)
  }, [count])

  useEffect(() => {
    const interval = setInterval(addSparkle, 300)
    return () => clearInterval(interval)
  }, [addSparkle])

  return (
    <span
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    />
  )
}
