package com.syncdrive.auth.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.syncdrive.auth.dto.JWTResponseDTO;
import com.syncdrive.auth.dto.LoginDTO;
import com.syncdrive.auth.security.jwt.JWTutils;
import com.syncdrive.auth.security.services.UserDetailsImplementation;

@Service
public class AuthServiceImplementation implements AuthService {
    private final AuthenticationManager authenticationManager;
    private final JWTutils jwtUtils;

    public AuthServiceImplementation(AuthenticationManager authenticationManager, JWTutils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
    }

    @Override
    public JWTResponseDTO login(LoginDTO dto) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getUsername(), dto.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserDetailsImplementation user = (UserDetailsImplementation) authentication.getPrincipal();
            return new JWTResponseDTO(jwtUtils.generateJWTtoken(authentication), user.getId(), user.getUsername(), user.getEmail());
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
        }
    }
}
