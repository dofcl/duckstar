import { defineConfig } from 'unocss'

export default defineConfig({
  shortcuts: {
    'animate-pop-in': 'animate-[pop-in_0.3s_ease]',
  },
  theme: {
    animation: {
      'pop-in': 'pop-in 0.3s ease',
    },
    keyframes: {
      'pop-in': {
        '0%': { transform: 'scale(0)' },
        '50%': { transform: 'scale(1.2)' },
        '100%': { transform: 'scale(1)' },
      },
    },
  },
})