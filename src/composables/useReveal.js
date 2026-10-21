/**
 * Composable de revelação em scroll usando Motion.
 * Usa IntersectionObserver + animate() do pacote `motion`.
 */
import { animate, stagger } from 'motion'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const EASE_OUT = [0.22, 1, 0.36, 1]

export function useReveal(options = {}) {
  const {
    selector = '[data-reveal]',
    y = 26,
    duration = 0.7,
    delay = 0.08,
    once = true,
    threshold = 0.16,
  } = options

  const root = ref(null)
  let observer = null

  onMounted(() => {
    const scope = root.value
    if (!scope) return

    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const targets = Array.from(scope.querySelectorAll(selector))
    const items = targets.length ? targets : [scope]

    if (prefersReduced) {
      items.forEach((el) => {
        el.style.opacity = '1'
        el.style.transform = 'none'
      })
      return
    }

    items.forEach((el) => {
      el.style.opacity = '0'
      el.style.transform = `translateY(${y}px)`
    })

    observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).map((e) => e.target)
        if (!visible.length) return

        animate(
          visible,
          { opacity: [0, 1], y: [y, 0] },
          { duration, delay: stagger(delay), ease: EASE_OUT },
        )

        if (once) visible.forEach((el) => observer?.unobserve(el))
      },
      { threshold, rootMargin: '0px 0px -8% 0px' },
    )

    items.forEach((el) => observer.observe(el))
  })

  onBeforeUnmount(() => observer?.disconnect())

  return { root }
}
