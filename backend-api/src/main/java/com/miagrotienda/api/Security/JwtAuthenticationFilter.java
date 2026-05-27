package com.miagrotienda.api.Security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);
        try {
            String username = jwtService.extractUsername(token);
            String rol = jwtService.extractRol(token); // <-- Extraemos el rol directo del JWT

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Creamos la autoridad limpia basada exactamente en el texto del token (ej: "CLIENTE" o "ADMIN")
                java.util.List<org.springframework.security.core.GrantedAuthority> authorities = 
                        org.springframework.security.core.authority.AuthorityUtils.createAuthorityList(rol);

                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        username, // Pasamos el username principal
                        null,
                        authorities // Inyectamos la autoridad plana en el contexto
                );
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        } catch (Exception ignored) {
            // Si el token es inválido, no autentica y continuará el flujo seguro
        }

        filterChain.doFilter(request, response);
    }
}
