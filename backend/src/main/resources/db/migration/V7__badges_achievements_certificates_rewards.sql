ALTER TABLE users ADD COLUMN reward_points INT DEFAULT 0;
ALTER TABLE users ADD COLUMN level INT DEFAULT 1;

ALTER TABLE badges ADD COLUMN category VARCHAR(50) DEFAULT 'GENERAL';
ALTER TABLE badges ADD COLUMN image_url VARCHAR(500) DEFAULT '/assets/badges/general.png';

-- Update existing seed badges
UPDATE badges SET category = 'GENERAL', image_url = '/assets/badges/starter.png' WHERE badge_name = 'Green Starter';
UPDATE badges SET category = 'GOAL', image_url = '/assets/badges/warrior.png' WHERE badge_name = 'Eco Warrior';
UPDATE badges SET category = 'ANALYTICS', image_url = '/assets/badges/reducer.png' WHERE badge_name = 'Carbon Reducer';
UPDATE badges SET category = 'GENERAL', image_url = '/assets/badges/sustainability.png' WHERE badge_name = 'Sustainability Champion';

-- Insert new badges requested
INSERT INTO badges (badge_name, description, criteria, category, image_url) VALUES
('Green Beginner', 'Logged at least 1 activity on the platform.', 'LOGS >= 1', 'GENERAL', '/assets/badges/green_beginner.png'),
('7-Day Activity Streak', 'Logged carbon logs for 7 consecutive days.', 'STREAK >= 7', 'CONSISTENCY', '/assets/badges/streak_7.png'),
('30-Day Consistency', 'Logged carbon logs for 30 consecutive days.', 'STREAK >= 30', 'CONSISTENCY', '/assets/badges/streak_30.png'),
('First Goal Achieved', 'Successfully reached 100% on your first active goal.', 'GOALS_COMPLETED >= 1', 'GOAL', '/assets/badges/goal_1.png'),
('Eco Saver 10 kg', 'Reduced overall carbon footprint by 10 kg CO₂.', 'SAVED_CO2 >= 10', 'SAVINGS', '/assets/badges/eco_10.png'),
('Eco Saver 25 kg', 'Reduced overall carbon footprint by 25 kg CO₂.', 'SAVED_CO2 >= 25', 'SAVINGS', '/assets/badges/eco_25.png'),
('Eco Saver 50 kg', 'Reduced overall carbon footprint by 50 kg CO₂.', 'SAVED_CO2 >= 50', 'SAVINGS', '/assets/badges/eco_50.png'),
('Carbon Champion', 'Reduced carbon footprint by over 100 kg CO₂.', 'SAVED_CO2 >= 100', 'SAVINGS', '/assets/badges/champion.png'),
('Sustainability Expert', 'Maintained a sustainability score above 85 for 7 consecutive days.', 'SUSTAINABILITY_SCORE >= 85', 'GENERAL', '/assets/badges/expert.png'),
('Top 10 Leaderboard', 'Ranked in the top 10 positions on the global leaderboard.', 'LEADERBOARD_RANK <= 10', 'LEADERBOARD', '/assets/badges/top_10.png'),
('Organization Contributor', 'Joined an organization and contributed to reports.', 'ORG_COUNT >= 1', 'COMMUNITY', '/assets/badges/contributor.png'),
('Recommendation Master', 'Completed at least 5 recommendations.', 'RECS_COMPLETED >= 5', 'RECOMMENDATION', '/assets/badges/recs_master.png'),
('Analytics Explorer', 'Viewed custom range analytics reports.', 'ANALYTICS_EXPLORED >= 1', 'ANALYTICS', '/assets/badges/explorer.png'),
('Community Hero', 'Earned over 1,000 lifetime reward points.', 'REWARD_POINTS >= 1000', 'COMMUNITY', '/assets/badges/community_hero.png');

CREATE TABLE achievements (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(500) NOT NULL,
    reward_points INT NOT NULL DEFAULT 0,
    badge_name VARCHAR(255),
    certificate_eligible BOOLEAN DEFAULT FALSE,
    achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE certificates (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    certificate_id VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(500) NOT NULL,
    date_issued DATE NOT NULL,
    verification_code VARCHAR(255) UNIQUE NOT NULL,
    organization_name VARCHAR(255) NOT NULL,
    digital_signature VARCHAR(255) NOT NULL,
    platform_logo VARCHAR(255) NOT NULL
);
