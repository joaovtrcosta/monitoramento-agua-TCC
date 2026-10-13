
package com.tcc.backend.dto;

import java.util.UUID;

public record DispositivoResponseDTO(
        UUID id,
        String deviceId,
        boolean ativo,
        UUID residenciaId,
        String residenciaNome
) {
}
