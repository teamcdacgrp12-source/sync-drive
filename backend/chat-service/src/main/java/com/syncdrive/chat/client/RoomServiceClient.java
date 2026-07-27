package com.syncdrive.chat.client;

import java.util.Map;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "room-service")
public interface RoomServiceClient {

    @GetMapping("/api/rooms/{roomCode}")
    Map<String, Object> getRoomDetails(@PathVariable("roomCode") String roomCode);

    default boolean roomExists(String roomCode) {
        return getRoomDetails(roomCode) != null;
    }
}
