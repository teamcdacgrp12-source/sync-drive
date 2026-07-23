package com.syncdrive.auth.service;

import com.syncdrive.auth.dto.JWTResponseDTO;
import com.syncdrive.auth.dto.LoginDTO;
import com.syncdrive.auth.dto.RegisterResponseDTO;
import com.syncdrive.auth.dto.UsersDTO;

public interface AuthService {
    JWTResponseDTO login(LoginDTO dto);
    RegisterResponseDTO register(UsersDTO dto);
}
