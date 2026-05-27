package com.miagrotienda.api.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity // Indica que esta clase es una tabla en MySQL
@Data   // Genera Getters, Setters y Constructores automáticamente (
@AllArgsConstructor // Genera el constructor con todos los campos (ID, nombre, precio, stock)
@NoArgsConstructor  // Genera el constructor vacío (obligatorio para Hibernate/JPA)
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String descripcion;
    private Double precio;
    private Integer stock;

    private Boolean oferta = false;
    private Double descuentoPorcentaje;
}
