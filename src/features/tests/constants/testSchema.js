import { z } from 'zod';

export const testSchema = z.object({
  name: z.string().trim().min(1, 'Test Name is required.'),
  subject: z.string().trim().min(1, 'Please select a Subject.'),
  type: z.enum(['chapterwise', 'pyq', 'mock']),
  topics: z.array(z.string()).min(1, 'Select at least one Topic.'),
  sub_topics: z.array(z.string()).min(1, 'Select at least one Sub-topic.'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  correct_marks: z.number().min(0, 'Correct Marks must be 0 or more.'),
  wrong_marks: z.number(),
  unattempt_marks: z.number(),
  total_time: z.number({ invalid_type_error: 'Duration is required.' }).min(1, 'Duration must be greater than 0 minutes.'),
  total_questions: z.number({ invalid_type_error: 'Number of Questions is required.' }).min(1, 'Number of Questions must be greater than 0.'),
  total_marks: z.number().optional()
});
