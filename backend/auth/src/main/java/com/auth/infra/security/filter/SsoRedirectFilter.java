package com.auth.infra.security.filter;

import com.auth.application.service.CookieService;
import com.auth.application.service.RedirectService;
import com.auth.infra.exception.custom.BadRequestException;
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
        Optional<String> ssoRedirect = findSsoRedirectCookie(request);
        if (ssoRedirect.isPresent()) {
            performRedirect(response, ssoRedirect.get(), cookieService.buildSsoRedirectLogoutCookie());
            return;
        }

        // Caso 2: Verificação de sessão para rotas protegidas do frontend
        boolean isAuthenticated = hasValidSession(request);

        if (isProtectedRoute(requestPath) && !isAuthenticated) {
            response.setStatus(HttpServletResponse.SC_FOUND);
            response.setHeader(HttpHeaders.LOCATION, "/login");
            return;
        }

    // Caso 3: Se já está autenticado e tenta acessar login ou a raiz, redirecionamos.
        if ((requestPath.equals("/login") || requestPath.equals("/")) && isAuthenticated) {
            try {
                String redirectTarget = determineRedirectTarget(request);
                response.setStatus(HttpServletResponse.SC_FOUND);
                response.setHeader(HttpHeaders.LOCATION, redirectTarget);
            } catch (BadRequestException badRequestException) {
                log.warn("Tentativa de redirecionamento para URL não permitida: {}", request.getParameter("redirectUri"));
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, badRequestException.getMessage());
            }
            return;
        }

        filterChain.doFilter(request, response);
    }

    private void performRedirect(HttpServletResponse response, String redirectUri, ResponseCookie logoutCookie) {
        response.addHeader(HttpHeaders.SET_COOKIE, logoutCookie.toString());
        response.setStatus(HttpServletResponse.SC_FOUND);
        response.setHeader(HttpHeaders.LOCATION, redirectUri);
    }

    private String determineRedirectTarget(HttpServletRequest request) {
        String externalRedirectUri = request.getParameter("redirectUri");
        if (externalRedirectUri != null && !externalRedirectUri.isBlank()) {
            return redirectService.validateRedirectUri(externalRedirectUri);
        }

        return Optional.ofNullable(request.getParameter("redirect"))
                .filter(internalPath -> !internalPath.isBlank())
                .orElse("/dashboard");
    }

    private boolean isFrontendNavigation(String path) {
        // Intercepta raiz, dashboard e outras rotas que carregariam o index.html
        return path.equals("/") || path.equals("/dashboard") || path.equals("/login") || path.startsWith("/reset-password");
    }

    private boolean isProtectedRoute(String path) {
        return path.equals("/dashboard") || path.startsWith("/reset-password");
    }

    /**
     * Verifica se existe um cookie de acesso ou de refresh válido.
     * Se houver pelo menos um deles, permitimos que o SPA carregue para tentar o refresh ou usar o token atual.
     */
    private boolean hasValidSession(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return false;
        }
        return Arrays.stream(request.getCookies())
                .anyMatch(cookie -> ("access_token".equals(cookie.getName()) || "refresh_token".equals(cookie.getName()))
                        && cookie.getValue() != null && !cookie.getValue().isBlank());
    }

    private Optional<String> findSsoRedirectCookie(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return Optional.empty();
        }
        return Arrays.stream(request.getCookies())
                .filter(cookie -> "sso_redirect".equals(cookie.getName()))
                .map(Cookie::getValue)
                .filter(value -> value != null && !value.isBlank())
                .findFirst();
    }
}
