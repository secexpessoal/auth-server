package com.auth.infra.security.filter;

import com.auth.application.service.CookieService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
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
@Component
@RequiredArgsConstructor
public class SsoRedirectFilter extends OncePerRequestFilter {

    private final CookieService cookieService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Só interceptamos rotas de navegação do frontend (não interceptamos API ou assets estáticos como JS/CSS)
        if (isFrontendNavigation(path)) {
            findSsoRedirectCookie(request).ifPresent(redirectUri -> {
                // Invalida o cookie para não entrar em loop infinito
                ResponseCookie logoutCookie = cookieService.buildSsoRedirectLogoutCookie();
                response.addHeader(HttpHeaders.SET_COOKIE, logoutCookie.toString());

                // Executa o redirecionamento real via servidor
                response.setStatus(HttpServletResponse.SC_FOUND);
                response.setHeader(HttpHeaders.LOCATION, redirectUri);
            });

            // Se redirecionamos, encerramos a cadeia aqui
            if (response.getStatus() == HttpServletResponse.SC_FOUND) {
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isFrontendNavigation(String path) {
        // Intercepta raiz, dashboard e outras rotas que carregariam o index.html
        return path.equals("/") || path.equals("/dashboard") || path.startsWith("/reset-password");
    }

    private Optional<String> findSsoRedirectCookie(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return Optional.empty();
        }
        return Arrays.stream(request.getCookies())
                .filter(c -> "sso_redirect".equals(c.getName()))
                .map(Cookie::getValue)
                .filter(v -> v != null && !v.isBlank())
                .findFirst();
    }
}
