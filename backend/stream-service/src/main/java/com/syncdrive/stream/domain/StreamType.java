package com.syncdrive.stream.domain;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum StreamType {
	MP4,
	SCREEN;

	@JsonCreator
	public static StreamType from(String value) {
		return StreamType.valueOf(value.toUpperCase());
	}
}
