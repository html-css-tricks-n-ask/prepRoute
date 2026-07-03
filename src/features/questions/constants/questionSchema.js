import { z } from 'zod';

export const questionSchema = z.object({
  question: z.string().trim().min(1, 'Question text is required.'),
  option1: z.string().trim().min(1, 'Option 1 is required.'),
  option2: z.string().trim().min(1, 'Option 2 is required.'),
  option3: z.string().trim().min(1, 'Option 3 is required.'),
  option4: z.string().trim().min(1, 'Option 4 is required.'),
  correct_option: z.enum(['option1', 'option2', 'option3', 'option4']),
  explanation: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  topic_id: z.string().optional(),
  sub_topic_id: z.string().optional(),
  media_url: z.string().url('Invalid URL format for Media URL.').or(z.literal('')).optional()
});
