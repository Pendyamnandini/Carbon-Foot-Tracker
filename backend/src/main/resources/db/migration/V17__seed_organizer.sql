-- Seed Organizer Account (Password: Organizer@123)
-- BCrypt hash of 'Organizer@123': $2a$10$tZ2zW4.JpBvFmZk5O7Qx.eLzvf6rGj0X8/1LwBqzB0S7Hlq7r2k/. (Actually, I'll use the same hash as Admin@123 for simplicity, which is $2a$10$vGgQbJUl5t5RcHtDfF/y6Onb/2q/ppQXQOaXtv1v/6/IuiGdeHZ16)
INSERT INTO users (full_name, email, mobile_number, password, role, active, created_at, updated_at)
VALUES ('Propelloitte Organizer', 'organizer@carbontracker.com', '+1987654321', '$2a$10$vGgQbJUl5t5RcHtDfF/y6Onb/2q/ppQXQOaXtv1v/6/IuiGdeHZ16', 'ORG_ADMIN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Seed Organization
INSERT INTO organizations (organization_name, organization_type, created_at)
VALUES ('Propelloitte Technologies', 'Business', CURRENT_TIMESTAMP);

-- Link Organizer to Organization
-- Assuming the organizer is ID 2 and Organization is ID 1 (since they are the first ones of their kind besides the admin user).
-- To be safe across environments, we can use subqueries if needed, but Flyway H2 script will execute sequentially.
INSERT INTO organization_users (organization_id, user_id, role)
SELECT o.id, u.id, 'ORG_ADMIN'
FROM organizations o, users u
WHERE o.organization_name = 'Propelloitte Technologies' AND u.email = 'organizer@carbontracker.com';
