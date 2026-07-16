CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile_number VARCHAR(50),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    profile_image_url VARCHAR(500),
    sustainability_preferences TEXT,
    active BOOLEAN DEFAULT TRUE,
    date_of_birth DATE,
    gender VARCHAR(50),
    country VARCHAR(100),
    state VARCHAR(100),
    city VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE password_reset_otp (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(255) NOT NULL,
    expiry_time TIMESTAMP NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id BIGINT,
    description TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE organizations (
    id BIGSERIAL PRIMARY KEY,
    organization_name VARCHAR(255) NOT NULL,
    organization_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE organization_users (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    CONSTRAINT unique_org_user UNIQUE (organization_id, user_id)
);

CREATE TABLE organization_reports (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
    report_month INTEGER NOT NULL,
    report_year INTEGER NOT NULL,
    total_emission DOUBLE PRECISION DEFAULT 0.0
);

CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expiry_date TIMESTAMP NOT NULL
);

CREATE TABLE uploaded_files (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_carbon_summary (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    transport_total DOUBLE PRECISION DEFAULT 0.0,
    electricity_total DOUBLE PRECISION DEFAULT 0.0,
    food_total DOUBLE PRECISION DEFAULT 0.0,
    shopping_total DOUBLE PRECISION DEFAULT 0.0,
    overall_total DOUBLE PRECISION DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE leaderboard_snapshots (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    rank_position INTEGER NOT NULL,
    score DOUBLE PRECISION NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL
);

CREATE TABLE emission_factors (
    id BIGSERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    factor DOUBLE PRECISION NOT NULL,
    source VARCHAR(255),
    version VARCHAR(50) DEFAULT '1.0',
    effective_date DATE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE activity_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    quantity DOUBLE PRECISION NOT NULL,
    unit VARCHAR(50) NOT NULL,
    emission_factor DOUBLE PRECISION NOT NULL,
    carbon_emission DOUBLE PRECISION NOT NULL,
    log_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE goals (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    goal_title VARCHAR(255) NOT NULL,
    target_reduction_percentage DOUBLE PRECISION NOT NULL,
    start_date DATE NOT NULL,
    target_date DATE NOT NULL,
    current_progress DOUBLE PRECISION DEFAULT 0.0,
    status VARCHAR(50) NOT NULL
);

CREATE TABLE badges (
    id BIGSERIAL PRIMARY KEY,
    badge_name VARCHAR(255) NOT NULL,
    description TEXT,
    criteria VARCHAR(255) NOT NULL
);

CREATE TABLE user_badges (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    badge_id BIGINT REFERENCES badges(id) ON DELETE CASCADE,
    awarded_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE feedbacks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    feedback_text TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
