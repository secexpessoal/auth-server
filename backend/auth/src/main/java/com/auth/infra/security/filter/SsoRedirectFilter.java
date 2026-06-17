package com.auth.infra.security.filter;

import com.auth.application.service.CookieService;
import com.auth.application.service.RedirectService;
import com.auth.infra.exception.custom.BadRequestException;
import com.auth.infra.security.service.JwtGeneratorService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

/**
 * Filtro responsável por interceptar acessos ao frontend (SPA) quando há um redirecionamento SSO pendente.
 * Garante que o usuário seja levado ao sistema de destino via redirecionamento 302 real,
 * evitando que o SPA seja carregado desnecessariamente.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SsoRedirectFilter extends OncePerRequestFilter {

    private final CookieService cookieService;
    private final RedirectService redirectService;
    private final JwtGeneratorService jwtGeneratorService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String requestPath = request.getRequestURI();

        // Só interceptamos rotas de navegação do frontend (não interceptamos API ou assets estáticos como JS/CSS)
        if (!isFrontendNavigation(requestPath)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Caso 1: Redirecionamento SSO pendente (Prioridade máxima)
        // Mas não redireciona se estiver em /profile-setup ou /reset-password (fluxo de auth obrigatório)
        Optional<String> ssoRedirect = findSsoRedirectCookie(request);
        if (ssoRedirect.isPresent() && !requestPath.startsWith("/profile-setup") && !requestPath.startsWith("/reset-password")) {
            performRedirect(response, ssoRedirect.get(), cookieService.buildSsoRedirectLogoutCookie());
            return;
        }

        // Caso 2: Verificação de sessão para rotas protegidas do frontend
        Optional<String> accessToken = findCookie(request, "access_token");
        boolean hasAccessToken = accessToken.isPresent() && jwtGeneratorService.isTokenValid(accessToken.get());
        boolean hasAnySession = hasAccessToken || findCookie(request, "refresh_token").isPresent();

        // Se é uma rota protegida e não tem NENHUMA sessão (nem access nem refresh), manda pro login
        if (isProtectedRoute(requestPath) && !hasAnySession) {
            response.setStatus(HttpServletResponse.SC_FOUND);
            response.setHeader(HttpHeaders.LOCATION, "/login");
            return;
        }

        // Caso 3: Se já está autenticado e tenta acessar login ou a raiz, redirecionamos.
        // Só redirecionamos se tivermos um access_token válido para saber para onde mandar.
        if ((requestPath.equals("/login") || requestPath.equals("/")) && hasAccessToken) {
            try {
                List<String> roles = jwtGeneratorService.extractRoles(accessToken.get());
                String redirectTarget = determineRedirectTarget(request, roles);

                if (requestPath.equals("/login")) {
                    String externalRedirectUri = request.getParameter("redirectUri");
                    StringBuilder target = new StringBuilder("/");
                    if (externalRedirectUri != null && !externalRedirectUri.isBlank()) {
                        target.append("?redirectUri=").append(externalRedirectUri);
                    }
                    redirectTarget = target.toString();
                }

                log.info("[SsoRedirectFilter] path={}, redirectTarget={}, hasAccessToken={}", requestPath, redirectTarget, hasAccessToken);

                if (!redirectTarget.equals(requestPath)) {
                    response.setStatus(HttpServletResponse.SC_FOUND);
                    response.setHeader(HttpHeaders.LOCATION, redirectTarget);
                    return;
                }
            } catch (Exception exception) {
                log.warn("Erro ao processar redirecionamento automático: {}", exception.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }

    private void performRedirect(HttpServletResponse response, String redirectUri, ResponseCookie logoutCookie) {
        response.addHeader(HttpHeaders.SET_COOKIE, logoutCookie.toString());
        response.setStatus(HttpServletResponse.SC_FOUND);
        response.setHeader(HttpHeaders.LOCATION, redirectUri);
    }

    private String determineRedirectTarget(HttpServletRequest request, List<String> roles) {
        String externalRedirectUri = request.getParameter("redirectUri");
        String internalPath = request.getParameter("redirect");
        boolean isAdmin = roles != null && roles.contains("ROLE_ADMIN");

        if (isAdmin) {
            return (internalPath != null && !internalPath.isBlank()) ? internalPath : "/dashboard";
        }

        if (internalPath != null && !internalPath.isBlank() && !internalPath.contains("dashboard")) {
            return internalPath;
        }

        return "/";
    }

    private boolean isFrontendNavigation(String path) {
        return path.equals("/") || path.equals("/dashboard") || path.equals("/login") || path.startsWith("/reset-password") || path.startsWith("/profile-setup");
    }

    private boolean isProtectedRoute(String path) {
        return path.equals("/dashboard") || path.startsWith("/reset-password") || path.startsWith("/profile-setup");
    }

    private Optional<String> findCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) {
            return Optional.empty();
        }
        return Arrays.stream(request.getCookies())
                .filter(cookie -> name.equals(cookie.getName()))
                .map(Cookie::getValue)
                .filter(value -> value != null && !value.isBlank())
                .findFirst();
    }

    private Optional<String> findSsoRedirectCookie(HttpServletRequest request) {
        return findCookie(request, "sso_redirect");
    }
}
