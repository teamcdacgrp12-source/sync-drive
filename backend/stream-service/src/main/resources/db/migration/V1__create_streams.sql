CREATE TABLE streams (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    room_id BIGINT NOT NULL,
    host_user_id BIGINT NOT NULL,
    stream_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    media_source TEXT,
    playback_time DOUBLE DEFAULT 0,
    started_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
