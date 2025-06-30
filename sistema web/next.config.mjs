import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Configuração corrigida para componentes externos
  serverExternalPackages: ['@prisma/client'],
  
  // Configuração para prevenir erros de chunk
  assetPrefix: '',
  trailingSlash: false,
  
  // Configurações avançadas para resolver ChunkLoadError
  webpack: (config, { dev, isServer }) => {
    // Desabilitar cache durante desenvolvimento
    if (dev) {
      config.cache = false
    }
    
    if (!isServer) {
      // Otimização de chunks mais robusta
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        maxAsyncRequests: 25,
        cacheGroups: {
          default: {
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
            enforce: true,
          },
          // Separar componentes React grandes
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            priority: 20,
            chunks: 'all',
          },
          // Separar bibliotecas UI
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
            name: 'ui-libs',
            priority: 15,
            chunks: 'all',
          },
        },
      }
      
      // Configurações de output mais robustas
      config.output.chunkLoadTimeout = 60000 // 60 segundos
      config.output.crossOriginLoading = 'anonymous'
      
      // Resolver problemas de importações dinâmicas
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    // Melhorar resolução de módulos usando path.resolve
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    }
    
    return config
  },
  // Configurações experimentais
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    // Melhorar recarregamento durante desenvolvimento
    ...(process.env.NODE_ENV === 'development' && {
      turbo: {
        resolveAlias: {
          '@': path.resolve(__dirname),
        },
      },
    }),
  },
  // Headers para melhorar cache
  headers: async () => {
    const headers = []
    
    // Headers para cache de assets estáticos em produção
    headers.push({
      source: '/_next/static/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    })
    
    // Headers para desabilitar cache em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      headers.push({
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      })
    }
    
    return headers
  },
}

export default nextConfig
