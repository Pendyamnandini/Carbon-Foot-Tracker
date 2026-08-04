ALTER TABLE tickets ADD COLUMN ai_confidence_score INT;
ALTER TABLE tickets ADD COLUMN ai_estimated_time VARCHAR(128);
ALTER TABLE tickets ADD COLUMN ai_helpful_resources TEXT;
ALTER TABLE tickets ADD COLUMN ai_severity VARCHAR(64);
ALTER TABLE tickets ADD COLUMN ai_preventive_advice TEXT;
ALTER TABLE tickets ADD COLUMN ai_generated_at TIMESTAMP;
ALTER TABLE tickets ADD COLUMN is_ai_resolved BOOLEAN DEFAULT FALSE;
ALTER TABLE tickets ADD COLUMN affected_module VARCHAR(128);
