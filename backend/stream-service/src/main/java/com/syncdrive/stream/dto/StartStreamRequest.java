package com.syncdrive.stream.dto;

import com.syncdrive.stream.domain.StreamType;

public record StartStreamRequest(Long roomId, Long userId, StreamType type, String source) { }
