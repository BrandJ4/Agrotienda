package com.miagrotienda.api.Exception;

import java.time.LocalDateTime;

public record ApiError(
        LocalDateTime timestamp,
        String message
) {
    public static ApiError of(String message) {
        return new ApiError(LocalDateTime.now(), message);
    }
}
