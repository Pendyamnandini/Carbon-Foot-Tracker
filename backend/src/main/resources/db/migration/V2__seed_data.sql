-- Seed Admin Account (Password: Admin@123)
-- BCrypt hash of 'Admin@123': $2a$10$vGgQbJUl5t5RcHtDfF/y6Onb/2q/ppQXQOaXtv1v/6/IuiGdeHZ16
INSERT INTO users (full_name, email, mobile_number, password, role, active, created_at, updated_at)
VALUES ('System Admin', 'admin@carbontracker.com', '+1234567890', '$2a$10$vGgQbJUl5t5RcHtDfF/y6Onb/2q/ppQXQOaXtv1v/6/IuiGdeHZ16', 'ADMIN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Seed Emission Factors
INSERT INTO emission_factors (category, activity_type, unit, factor, source, version, effective_date, active, created_at) VALUES
('TRANSPORT', 'Car Travel', 'Kilometer', 0.18, 'EPA 2023', '1.0', '2023-01-01', true, CURRENT_TIMESTAMP),
('TRANSPORT', 'Motorcycle', 'Kilometer', 0.10, 'EPA 2023', '1.0', '2023-01-01', true, CURRENT_TIMESTAMP),
('TRANSPORT', 'Flight', 'Kilometer', 0.25, 'IPCC 2023', '1.0', '2023-01-01', true, CURRENT_TIMESTAMP),
('TRANSPORT', 'Bus', 'Kilometer', 0.08, 'EPA 2023', '1.0', '2023-01-01', true, CURRENT_TIMESTAMP),
('TRANSPORT', 'Train', 'Kilometer', 0.04, 'EPA 2023', '1.0', '2023-01-01', true, CURRENT_TIMESTAMP),
('TRANSPORT', 'Metro', 'Kilometer', 0.03, 'EPA 2023', '1.0', '2023-01-01', true, CURRENT_TIMESTAMP),

('ELECTRICITY', 'Grid Electricity', 'kWh', 0.85, 'EIA 2023', '1.0', '2023-01-01', true, CURRENT_TIMESTAMP),
('ELECTRICITY', 'Solar Energy', 'kWh', 0.05, 'NREL 2023', '1.0', '2023-01-01', true, CURRENT_TIMESTAMP),
('ELECTRICITY', 'Renewable Energy', 'kWh', 0.02, 'NREL 2023', '1.0', '2023-01-01', true, CURRENT_TIMESTAMP),

('FOOD', 'Vegetarian Meal', 'Servings', 1.50, 'Our World in Data', '1.0', '2023-01-01', true, CURRENT_TIMESTAMP),
('FOOD', 'Vegan Meal', 'Servings', 0.80, 'Our World in Data', '1.0', '2023-01-01', true, CURRENT_TIMESTAMP),
('FOOD', 'Chicken Meal', 'Servings', 3.00, 'Our World in Data', '1.0', '2023-01-01', true, CURRENT_TIMESTAMP),
('FOOD', 'Beef Meal', 'Servings', 8.00, 'Our World in Data', '1.0', '2023-01-01', true, CURRENT_TIMESTAMP),
('FOOD', 'Seafood Meal', 'Servings', 2.50, 'Our World in Data', '1.0', '2023-01-01', true, CURRENT_TIMESTAMP),

('SHOPPING', 'Clothing', 'Currency Spend', 0.50, 'UK DEFRA', '1.0', '2023-01-01', true, CURRENT_TIMESTAMP),
('SHOPPING', 'Electronics', 'Currency Spend', 0.90, 'UK DEFRA', '1.0', '2023-01-01', true, CURRENT_TIMESTAMP),
('SHOPPING', 'Household Products', 'Currency Spend', 0.30, 'UK DEFRA', '1.0', '2023-01-01', true, CURRENT_TIMESTAMP),
('SHOPPING', 'Furniture', 'Currency Spend', 0.60, 'UK DEFRA', '1.0', '2023-01-01', true, CURRENT_TIMESTAMP);

-- Seed Badges
INSERT INTO badges (badge_name, description, criteria) VALUES
('Green Starter', 'Awarded for logging your first carbon activity.', 'LOG_COUNT >= 1'),
('Eco Warrior', 'Awarded for achieving 3 carbon reduction goals.', 'GOALS_COMPLETED >= 3'),
('Carbon Reducer', 'Awarded for reducing weekly emissions by 20%.', 'WEEKLY_REDUCTION >= 20'),
('Sustainability Champion', 'Awarded for logging activities in all 4 categories.', 'CATEGORIES_LOGGED >= 4');
