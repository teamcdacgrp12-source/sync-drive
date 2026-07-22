package com.syncdrive.auth.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.syncdrive.auth.security.jwt.AuthEntryPointJwt;
import com.syncdrive.auth.security.jwt.AuthTokenFilter;
import com.syncdrive.auth.security.services.UserDetailsServiceImplementation;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {
	private final UserDetailsServiceImplementation userDetailsService;
	private final AuthEntryPointJwt unauthorizedHandler;
	private final AuthTokenFilter authTokenFilter;

	public WebSecurityConfig(UserDetailsServiceImplementation userDetailsService, AuthEntryPointJwt unauthorizedHandler,
			AuthTokenFilter authTokenFilter) {
		this.userDetailsService = userDetailsService;
		this.unauthorizedHandler = unauthorizedHandler;
		this.authTokenFilter = authTokenFilter;
	}

	@Bean
	public DaoAuthenticationProvider authenticationProvider() {
		DaoAuthenticationProvider authenticationProvider = new DaoAuthenticationProvider();
		authenticationProvider.setUserDetailsService(userDetailsService);
		authenticationProvider.setPasswordEncoder(passwordEncoder());
		return authenticationProvider;
	}

	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
		return authenticationConfiguration.getAuthenticationManager();
	}

	@Bean
	public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http.csrf(AbstractHttpConfigurer::disable)
				.exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests(authorize -> authorize
						.requestMatchers("/api/auth/signup", "/api/auth/signin").permitAll()
						.anyRequest().authenticated());
		http.authenticationProvider(authenticationProvider());
		http.addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter.class);
		return http.build();
	}
}
