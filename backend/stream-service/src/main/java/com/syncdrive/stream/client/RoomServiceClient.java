package com.syncdrive.stream.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "room-service", path = "/api/rooms")
public interface RoomServiceClient {

	@GetMapping("/{roomId}/host")
	Long getHostUserId(@PathVariable("roomId") Long roomId);
}
