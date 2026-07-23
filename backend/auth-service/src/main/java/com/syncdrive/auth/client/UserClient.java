package com.syncdrive.auth.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "user-service")
public interface UserClient {
    @PostMapping("/api/users/internal/create")
    void createUserProfile(@RequestParam("userId") Long userId, @RequestParam("username") String username);
}
