ALTER TABLE tickets ADD COLUMN resolved_at TIMESTAMP;
ALTER TABLE tickets ADD COLUMN resolved_by_id BIGINT;
ALTER TABLE tickets ADD COLUMN resolution_message TEXT;
ALTER TABLE tickets ADD COLUMN time_taken_minutes BIGINT;
ALTER TABLE tickets ADD COLUMN issue_summary TEXT;
ALTER TABLE tickets ADD COLUMN root_cause TEXT;
ALTER TABLE tickets ADD COLUMN resolution_action TEXT;
ALTER TABLE tickets ADD COLUMN resolution_result TEXT;

ALTER TABLE tickets ADD FOREIGN KEY (resolved_by_id) REFERENCES users(id) ON DELETE SET NULL;
