package com.miagrotienda.api.Service;

import com.miagrotienda.api.DTO.AuthResponseDTO;
import com.miagrotienda.api.DTO.LoginRequestDTO;
import com.miagrotienda.api.DTO.RegisterRequestDTO;
import com.miagrotienda.api.Exception.BadRequestException;
import com.miagrotienda.api.Exception.NotFoundException;
import com.miagrotienda.api.Model.Rol;
import com.miagrotienda.api.Model.Usuario;
import com.miagrotienda.api.Repository.UsuarioRepository;
import com.miagrotienda.api.Security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthResponseDTO register(RegisterRequestDTO req) {
        if (req.getUsername() == null || req.getUsername().isBlank()) {
            throw new BadRequestException("Username es obligatorio");
        }
        if (req.getPassword() == null || req.getPassword().isBlank()) {
            throw new BadRequestException("Password es obligatorio");
        }
        if (usuarioRepository.existsByUsername(req.getUsername())) {
            throw new BadRequestException("El usuario ya existe");
        }

        Usuario usuario = new Usuario();
        usuario.setUsername(req.getUsername());
        usuario.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        usuario.setRol(Rol.CLIENTE);
        usuarioRepository.save(usuario);

        return buildAuthResponse(usuario);
    }

    public AuthResponseDTO login(LoginRequestDTO req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword())
        );

        Usuario usuario = usuarioRepository.findByUsername(req.getUsername())
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        return buildAuthResponse(usuario);
    }

    private AuthResponseDTO buildAuthResponse(Usuario usuario) {
        AuthResponseDTO resp = new AuthResponseDTO();
        resp.setUsername(usuario.getUsername());
        resp.setRol(usuario.getRol().name());
        resp.setToken(jwtService.generateToken(usuario.getUsername(), usuario.getRol().name()));
        return resp;
    }
}
