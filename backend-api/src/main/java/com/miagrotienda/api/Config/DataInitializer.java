package com.miagrotienda.api.Config;

import com.miagrotienda.api.Model.Producto;
import com.miagrotienda.api.Model.Rol;
import com.miagrotienda.api.Model.Usuario;
import com.miagrotienda.api.Repository.ProductoRepository;
import com.miagrotienda.api.Repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UsuarioRepository usuarioRepository,
            ProductoRepository productoRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.usuarioRepository = usuarioRepository;
        this.productoRepository = productoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        inicializarAdmin();
        inicializarProductos();
    }

    private void inicializarAdmin() {
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

    private void inicializarProductos() {
        if (productoRepository.count() > 0) {
            System.out.println("--> El catálogo de productos ya tiene datos, no se vuelve a poblar.");
            return;
        }

        List<Producto> catalogo = List.of(
                producto("Fertilizante NPK 20-20-20 x 1kg", "Fertilizante balanceado para crecimiento general de cultivos.", 45.90, 80, "Fertilizantes", true, 15.0,
                        "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=400&q=60"),
                producto("Fertilizante Foliar Orgánico x 500ml", "Bioestimulante foliar a base de algas marinas.", 38.50, 60, "Fertilizantes", false, null,
                        "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=400&q=60"),
                producto("Urea Agrícola 46% x 25kg", "Fuente concentrada de nitrógeno para suelos.", 95.00, 40, "Fertilizantes", false, null,
                        "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=400&q=60"),

                producto("Semilla de Maíz Híbrido x 1kg", "Semilla certificada de alto rendimiento.", 32.00, 100, "Semillas", true, 10.0,
                        "https://images.unsplash.com/photo-1601472543089-7ecf80e7f9f9?auto=format&fit=crop&w=400&q=60"),
                producto("Semilla de Papa Yungay x 5kg", "Tubérculo-semilla seleccionado para siembra.", 60.00, 35, "Semillas", false, null,
                        "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=60"),
                producto("Semilla de Quinua Blanca x 1kg", "Semilla orgánica de quinua de altura.", 28.00, 50, "Semillas", false, null,
                        "https://images.unsplash.com/photo-1612257999691-7c9c7d0c0c8e?auto=format&fit=crop&w=400&q=60"),

                producto("Insecticida Agrícola x 1L", "Control de plagas de amplio espectro.", 55.00, 45, "Pesticidas", false, null,
                        "https://images.unsplash.com/photo-1620200423727-8127f75d7f53?auto=format&fit=crop&w=400&q=60"),
                producto("Fungicida Cúprico x 1kg", "Prevención de hongos en hojas y frutos.", 42.00, 30, "Pesticidas", true, 20.0,
                        "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=400&q=60"),
                producto("Herbicida Selectivo x 1L", "Control de malezas de hoja ancha.", 50.00, 25, "Pesticidas", false, null,
                        "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=400&q=60"),

                producto("Mochila Pulverizadora 16L", "Pulverizador manual de presión para fumigar.", 120.00, 20, "Herramientas", false, null,
                        "https://images.unsplash.com/photo-1592978839083-92f5f1a0bbac?auto=format&fit=crop&w=400&q=60"),
                producto("Pala Agrícola Reforzada", "Pala de mango largo para labores de campo.", 35.00, 40, "Herramientas", false, null,
                        "https://images.unsplash.com/photo-1617692855027-33b14f061079?auto=format&fit=crop&w=400&q=60"),
                producto("Machete Agrícola 18\"", "Hoja de acero al carbono, mango ergonómico.", 28.00, 35, "Herramientas", true, 12.0,
                        "https://images.unsplash.com/photo-1599598177991-ec67b5c75363?auto=format&fit=crop&w=400&q=60"),

                producto("Manguera de Riego 25m", "Manguera reforzada resistente a la intemperie.", 65.00, 30, "Riego", false, null,
                        "https://images.unsplash.com/photo-1620207418302-439d0c8a3ca5?auto=format&fit=crop&w=400&q=60"),
                producto("Kit de Riego por Goteo 50m", "Sistema completo de goteo para parcelas pequeñas.", 150.00, 15, "Riego", true, 18.0,
                        "https://images.unsplash.com/photo-1625246333128-bd2c9b69a30a?auto=format&fit=crop&w=400&q=60"),
                producto("Aspersor Giratorio de Jardín", "Aspersor de impacto 360° para riego uniforme.", 22.00, 50, "Riego", false, null,
                        "https://images.unsplash.com/photo-1599598254882-9c0c0b3c6e5a?auto=format&fit=crop&w=400&q=60"),

                producto("Sacos de Yute x 50kg (paq. 10u)", "Sacos resistentes para almacenar cosecha.", 40.00, 60, "Empaques", false, null,
                        "https://images.unsplash.com/photo-1604335399105-a0c585fc99c3?auto=format&fit=crop&w=400&q=60"),
                producto("Mallas Raschel para Cultivo", "Malla de sombra para protección de cultivos.", 75.00, 20, "Empaques", false, null,
                        "https://images.unsplash.com/photo-1625246334034-4f0c0a3b1a0e?auto=format&fit=crop&w=400&q=60"),
                producto("Cajas Cosecheras Plásticas (paq. 5u)", "Cajas apilables para transporte de cosecha.", 90.00, 25, "Empaques", true, 10.0,
                        "https://images.unsplash.com/photo-1592924357229-12dd2e7e8b62?auto=format&fit=crop&w=400&q=60")
        );

        productoRepository.saveAll(catalogo);
        System.out.println("--> Catálogo de productos inicializado con " + catalogo.size() + " productos.");
    }

    private Producto producto(String nombre, String descripcion, Double precio, Integer stock,
                               String categoria, Boolean oferta, Double descuento, String imagenUrl) {
        Producto p = new Producto();
        p.setNombre(nombre);
        p.setDescripcion(descripcion);
        p.setPrecio(precio);
        p.setStock(stock);
        p.setCategoria(categoria);
        p.setOferta(oferta);
        p.setDescuentoPorcentaje(descuento);
        p.setImagenUrl(imagenUrl);
        return p;
    }
}