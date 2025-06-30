
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				whatsapp: {
					green: 'hsl(var(--whatsapp-green))',
					'dark-green': 'hsl(var(--whatsapp-dark-green))',
					background: 'hsl(var(--whatsapp-background))',
					'chat-bg': 'hsl(var(--whatsapp-chat-bg))',
					text: 'hsl(var(--whatsapp-text))',
					accent: 'hsl(var(--whatsapp-accent))',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'bounce-in': {
					'0%': {
						transform: 'scale(0.3)',
						opacity: '0'
					},
					'50%': {
						transform: 'scale(1.05)'
					},
					'70%': {
						transform: 'scale(0.9)'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'loading-dots': {
					'0%, 80%, 100%': {
						transform: 'scale(0)',
						opacity: '0.5'
					},
					'40%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'skeleton-shimmer': {
					'0%': {
						backgroundPosition: '-200% 0'
					},
					'100%': {
						backgroundPosition: '200% 0'
					}
				},
				'progress-stripes': {
					'0%': {
						backgroundPosition: '0 0'
					},
					'100%': {
						backgroundPosition: '1rem 0'
					}
				},
				'gradient': {
					'0%, 100%': {
						backgroundPosition: '0% 50%'
					},
					'50%': {
						backgroundPosition: '100% 50%'
					}
				},
				'gradient-text': {
					'0%, 100%': {
						backgroundPosition: '0% 50%'
					},
					'50%': {
						backgroundPosition: '100% 50%'
					}
				},
				'mesh-gradient': {
					'0%, 100%': {
						transform: 'rotate(0deg) scale(1)'
					},
					'33%': {
						transform: 'rotate(30deg) scale(1.1)'
					},
					'66%': {
						transform: 'rotate(-15deg) scale(0.9)'
					}
				},
				'neon-pulse': {
					'0%, 100%': {
						boxShadow: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor'
					},
					'50%': {
						boxShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor'
					}
				},
				'aurora-1': {
					'0%, 100%': {
						transform: 'translateX(-100%) translateY(-100%) rotate(0deg)'
					},
					'50%': {
						transform: 'translateX(100%) translateY(100%) rotate(180deg)'
					}
				},
				'aurora-2': {
					'0%, 100%': {
						transform: 'translateX(100%) translateY(-50%) rotate(0deg)'
					},
					'50%': {
						transform: 'translateX(-100%) translateY(50%) rotate(180deg)'
					}
				},
				'aurora-3': {
					'0%, 100%': {
						transform: 'translateX(-50%) translateY(100%) rotate(0deg)'
					},
					'50%': {
						transform: 'translateX(50%) translateY(-100%) rotate(180deg)'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0px)'
					},
					'50%': {
						transform: 'translateY(-20px)'
					}
				},
				'ripple': {
					'0%': {
						transform: 'scale(0)',
						opacity: '1'
					},
					'100%': {
						transform: 'scale(4)',
						opacity: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'bounce-in': 'bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'loading-dots': 'loading-dots 1.4s infinite ease-in-out',
				'skeleton-shimmer': 'skeleton-shimmer 2s ease-in-out infinite',
				'progress-stripes': 'progress-stripes 1s linear infinite',
				'gradient': 'gradient 6s ease infinite',
				'gradient-slow': 'gradient 8s ease infinite',
				'gradient-fast': 'gradient 4s ease infinite',
				'gradient-text': 'gradient-text 6s ease infinite',
				'mesh-gradient': 'mesh-gradient 20s ease-in-out infinite',
				'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
				'aurora-1': 'aurora-1 20s linear infinite',
				'aurora-2': 'aurora-2 25s linear infinite reverse',
				'aurora-3': 'aurora-3 30s linear infinite',
				'float': 'float 6s ease-in-out infinite',
				'float-delayed': 'float 6s ease-in-out infinite 2s',
				'float-slow': 'float 8s ease-in-out infinite',
				'ripple': 'ripple 0.6s linear'
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
