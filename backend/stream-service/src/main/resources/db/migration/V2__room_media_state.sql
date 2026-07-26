CREATE TABLE room_media_state (
    room_id BIGINT PRIMARY KEY,
    media_id BIGINT NOT NULL,
    current_time_seconds INT DEFAULT 0,
    is_playing BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
