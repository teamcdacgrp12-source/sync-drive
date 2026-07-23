package com.syncdrive.auth.service;

import com.syncdrive.auth.dto.JWTResponseDTO;
import com.syncdrive.auth.dto.LoginDTO;

public interface AuthService {
    JWTResponseDTO login(LoginDTO dto);
}
