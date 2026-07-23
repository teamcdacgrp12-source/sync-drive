ALTER TABLE users
DROP INDEX auth_provider;

ALTER TABLE users
MODIFY auth_provider VARCHAR(20) NOT NULL;

ALTER TABLE users
ADD CONSTRAINT uq_auth_provider_user UNIQUE (auth_provider, provider_user_id);
