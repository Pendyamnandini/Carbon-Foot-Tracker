CREATE TABLE daily_carbon_summary (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    summary_date DATE NOT NULL,
    transport_total DOUBLE PRECISION DEFAULT 0.0,
    electricity_total DOUBLE PRECISION DEFAULT 0.0,
    food_total DOUBLE PRECISION DEFAULT 0.0,
    shopping_total DOUBLE PRECISION DEFAULT 0.0,
    overall_total DOUBLE PRECISION DEFAULT 0.0,
    activity_count INTEGER DEFAULT 0,
    sustainability_score DOUBLE PRECISION DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_date UNIQUE (user_id, summary_date)
);

CREATE TABLE weekly_carbon_summary (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL,
    year INTEGER NOT NULL,
    transport_total DOUBLE PRECISION DEFAULT 0.0,
    electricity_total DOUBLE PRECISION DEFAULT 0.0,
    food_total DOUBLE PRECISION DEFAULT 0.0,
    shopping_total DOUBLE PRECISION DEFAULT 0.0,
    overall_total DOUBLE PRECISION DEFAULT 0.0,
    activity_count INTEGER DEFAULT 0,
    sustainability_score DOUBLE PRECISION DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_week_year UNIQUE (user_id, week_number, year)
);

CREATE TABLE monthly_carbon_summary (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    transport_total DOUBLE PRECISION DEFAULT 0.0,
    electricity_total DOUBLE PRECISION DEFAULT 0.0,
    food_total DOUBLE PRECISION DEFAULT 0.0,
    shopping_total DOUBLE PRECISION DEFAULT 0.0,
    overall_total DOUBLE PRECISION DEFAULT 0.0,
    activity_count INTEGER DEFAULT 0,
    sustainability_score DOUBLE PRECISION DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_month_year UNIQUE (user_id, month, year)
);

CREATE TABLE user_activity_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    activity_name VARCHAR(100) NOT NULL,
    activity_description VARCHAR(255),
    page_name VARCHAR(100),
    metadata_json TEXT,
    ip_address VARCHAR(45),
    device_info VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
