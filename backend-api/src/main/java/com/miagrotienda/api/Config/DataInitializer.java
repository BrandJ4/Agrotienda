package com.miagrotienda.api.Config;

import com.miagrotienda.api.Model.Rol;
import com.miagrotienda.api.Model.Usuario;
import com.miagrotienda.api.Repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        String adminUsername = "admin";

        // Verificar si el usuario 'admin' ya existe en la base de datos
        if (!usuarioRepository.existsByUsername(adminUsername)) {
            Usuario admin = new Usuario();
            admin.setUsername(adminUsername);
            // Encriptamos la contraseña elegida para el administrador (ej: "admin123")
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setRol(Rol.ADMIN);

            usuarioRepository.save(admin);
            System.out.println("--> Cuenta de Administrador inicializada con éxito (Username: admin, Password: admin123)");
        } else {
            System.out.println("--> La cuenta de Administrador ya existe en el sistema.");
        }
    }
}