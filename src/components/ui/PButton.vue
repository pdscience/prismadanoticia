<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  to: { type: [String, Object], default: null },
  href: { type: String, default: null },
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'ghost', 'outline', 'gold'].includes(v),
  },
  size: { type: String, default: 'md', validator: (v) => ['sm', 'md', 'lg'].includes(v) },
  block: { type: Boolean, default: false },
  type: { type: String, default: 'button' },
})

const tag = computed(() => (props.to ? RouterLink : props.href ? 'a' : 'button'))

const sizes = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-sm',
  lg: 'h-14 px-8 text-base',
}

const variants = {
  primary:
    'text-white bg-linear-to-r from-electric via-electric to-prism shadow-[0_18px_40px_-18px_rgba(45,107,255,0.85)] hover:shadow-[0_22px_50px_-16px_rgba(139,92,246,0.9)] hover:-translate-y-0.5',
  gold:
    'text-midnight bg-linear-to-r from-insight to-insight-soft shadow-[0_18px_40px_-18px_rgba(255,194,75,0.8)] hover:-translate-y-0.5',
  outline:
    'text-ink border border-hairline-strong hover:border-electric-soft hover:bg-electric/10',
  ghost: 'text-ink-muted hover:text-ink hover:bg-surface',
}
</script>

<template>
  <component
    :is="tag"
    :to="to || undefined"
    :href="href || undefined"
    :type="tag === 'button' ? type : undefined"
    class="group relative inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 active:scale-[0.98]"
    :class="[sizes[size], variants[variant], block ? 'w-full' : '']"
  >
    <slot name="icon-left" />
    <span class="relative z-10"><slot /></span>
    <slot name="icon-right" />
  </component>
</template>
