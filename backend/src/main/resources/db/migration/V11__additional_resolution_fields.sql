ALTER TABLE tickets ADD COLUMN problem_analysis TEXT;
ALTER TABLE tickets ADD COLUMN resolution_steps TEXT;
ALTER TABLE tickets ADD COLUMN changes_made TEXT;
ALTER TABLE tickets ADD COLUMN verification_performed TEXT;
ALTER TABLE tickets ADD COLUMN final_notes TEXT;
ALTER TABLE tickets ADD COLUMN additional_resources TEXT;
ALTER TABLE tickets ADD COLUMN resolution_attachment_url VARCHAR(512);
ALTER TABLE tickets ADD COLUMN resolution_attachment_name VARCHAR(255);
