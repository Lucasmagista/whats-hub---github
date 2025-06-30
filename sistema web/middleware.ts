import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Verificar se o usuário tem permissão para acessar o dashboard
    const token = req.nextauth.token
    
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
      // Verificar se o usuário está ativo
      if (token?.isActive === false) {
        return Response.redirect(new URL('/login?error=account-inactive', req.url))
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Permitir acesso ao dashboard apenas se houver token válido
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return !!token
        }
        return true
      }
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*"]
}
