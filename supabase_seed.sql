-- Seed data for testing the AI Romance Book Factory

-- Insert sample users
INSERT INTO users (id, name, email, role) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Admin User', 'admin@example.com', 'admin'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'AI Agent', 'ai@example.com', 'ai_agent'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Beta Reader 1', 'reader1@example.com', 'beta_reader'),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Beta Reader 2', 'reader2@example.com', 'beta_reader');

-- Insert sample projects
INSERT INTO projects (id, title, genre, tropes, pov, heat_level, status, deadline, cost, roi, created_by) VALUES
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 
   'The Billionaire''s Secret', 
   'Contemporary Romance', 
   ARRAY['Billionaire', 'Secret Baby', 'Second Chance'], 
   'dual_pov', 
   'steamy', 
   'writing', 
   '2025-12-31', 
   150.00, 
   0.0, 
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 
   'Highland Hearts', 
   'Historical Romance', 
   ARRAY['Enemies to Lovers', 'Forced Marriage', 'Scottish Highland'], 
   'third_person_limited', 
   'moderate', 
   'planning', 
   '2025-11-30', 
   0.00, 
   0.0, 
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  
  ('10eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 
   'Fake Dating the CEO', 
   'Contemporary Romance', 
   ARRAY['Fake Dating', 'Office Romance', 'Grumpy/Sunshine'], 
   'first_person', 
   'mild', 
   'writing', 
   '2025-10-15', 
   75.50, 
   0.0, 
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

-- Insert sample chapters for "The Billionaire's Secret"
INSERT INTO chapters (id, project_id, chapter_number, title, status, word_count, target_word_count) VALUES
  ('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 1, 'The Unexpected Encounter', 'not_started', 0, 3000),
  ('21eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 2, 'Old Flames', 'not_started', 0, 3000),
  ('22eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 3, 'The Revelation', 'not_started', 0, 3500),
  ('23eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 4, 'Conflicted Hearts', 'not_started', 0, 3000),
  ('24eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 5, 'The Truth Unfolds', 'not_started', 0, 3200);

-- Insert sample chapters for "Fake Dating the CEO"
INSERT INTO chapters (id, project_id, chapter_number, title, status, word_count, target_word_count) VALUES
  ('30eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 1, 'The Proposal', 'not_started', 0, 2800),
  ('31eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 2, 'The Contract', 'not_started', 0, 2800),
  ('32eebc99-9c0b-4ef8-bb6d-6bb9bd380a25', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 3, 'First Public Appearance', 'not_started', 0, 3000);

-- Insert sample chapters for "Highland Hearts"
INSERT INTO chapters (id, project_id, chapter_number, title, status, word_count, target_word_count) VALUES
  ('40eebc99-9c0b-4ef8-bb6d-6bb9bd380a26', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 1, 'Arrival at the Castle', 'not_started', 0, 3500),
  ('41eebc99-9c0b-4ef8-bb6d-6bb9bd380a27', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 2, 'The Highland Laird', 'not_started', 0, 3500);