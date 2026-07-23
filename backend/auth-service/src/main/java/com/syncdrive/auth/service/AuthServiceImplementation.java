package com.syncdrive.auth.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.syncdrive.auth.client.UserClient;
import com.syncdrive.auth.dto.JWTResponseDTO;
import com.syncdrive.auth.dto.LoginDTO;
import com.syncdrive.auth.dto.RegisterResponseDTO;
import com.syncdrive.auth.dto.UsersDTO;
import com.syncdrive.auth.entity.Users;
import com.syncdrive.auth.repository.UserRepository;
import com.syncdrive.auth.security.jwt.JWTutils;
import com.syncdrive.auth.security.services.UserDetailsImplementation;

@Service
public class AuthServiceImplementation implements AuthService {
    private final AuthenticationManager authenticationManager;
    private final JWTutils jwtUtils;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserClient userClient;

    public AuthServiceImplementation(AuthenticationManager authenticationManager, JWTutils jwtUtils,
            UserRepository userRepository, PasswordEncoder passwordEncoder, UserClient userClient) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userClient = userClient;
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

    @Override
    public RegisterResponseDTO register(UsersDTO dto) {
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username is already in use");
        }
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already in use");
        }

        Users user = new Users(dto.getUsername(), passwordEncoder.encode(dto.getPassword()), dto.getEmail());
        Users savedUser = userRepository.save(user);
        userClient.createUserProfile(savedUser.getId(), savedUser.getUsername());
        return new RegisterResponseDTO("User registered successfully");
    }
}
