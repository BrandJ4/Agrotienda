package com.miagrotienda.api.DTO;

import lombok.Data;

@Data
public class AuthResponseDTO {
    private String token;
    private String username;
    private String rol;
}
