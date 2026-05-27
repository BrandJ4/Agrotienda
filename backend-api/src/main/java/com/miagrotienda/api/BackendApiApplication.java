package com.miagrotienda.api;

import com.miagrotienda.api.Model.Rol;
import com.miagrotienda.api.Model.Usuario;
import com.miagrotienda.api.Repository.UsuarioRepository;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class BackendApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApiApplication.class, args);
	}

	@Bean
	CommandLineRunner seedAdmin(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			if (!usuarioRepository.existsByUsername("admin")) {
				Usuario admin = new Usuario();
				admin.setUsername("admin");
				admin.setPasswordHash(passwordEncoder.encode("admin123"));
				admin.setRol(Rol.ADMIN);
				usuarioRepository.save(admin);
			}
		};
	}
}
