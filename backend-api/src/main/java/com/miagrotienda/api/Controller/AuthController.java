package com.miagrotienda.api.Controller;

import com.miagrotienda.api.DTO.AuthResponseDTO;
import com.miagrotienda.api.DTO.LoginRequestDTO;
import com.miagrotienda.api.DTO.RegisterRequestDTO;
import com.miagrotienda.api.Service.AuthService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponseDTO register(@RequestBody RegisterRequestDTO req) {
        return authService.register(req);
    }

    @PostMapping("/login")
    public AuthResponseDTO login(@RequestBody LoginRequestDTO req) {
        return authService.login(req);
    }
}
