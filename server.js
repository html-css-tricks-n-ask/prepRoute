import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'db.json');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());

// Log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Read/Write DB Helpers
const readDb = () => {
  try {
    if (!fs.existsSync(dbPath)) {
      return { subjects: [], topics: [], sub_topics: [], tests: [], questions: [] };
    }
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database", err);
    return { subjects: [], topics: [], sub_topics: [], tests: [], questions: [] };
  }
};

const writeDb = (data) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error("Error writing database", err);
  }
};

// Auth middleware for endpoints other than login
const authMiddleware = (req, res, next) => {
  if (req.path === '/auth/login' || req.path.startsWith('/public')) {
    return next();
  }
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
  }
  const token = authHeader.split(' ')[1];
  if (!token || token !== 'mock-jwt-token-here') {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
  }
  next();
};

app.use(authMiddleware);

// 1. Login API
app.post('/auth/login', (req, res) => {
  const { userId, password } = req.body;
  if (!userId || !password) {
    return res.status(400).json({ success: false, message: 'userId and password are required' });
  }
  // Allow login with userId and checks password for demo purposes
  if (password !== 'password123') {
    return res.status(400).json({ success: false, message: 'Invalid credentials. Password is password123' });
  }
  res.json({
    success: true,
    data: {
      token: 'mock-jwt-token-here',
      user: { userId }
    }
  });
});

// 2. Get All Subjects
app.get('/subjects', (req, res) => {
  const db = readDb();
  res.json({ success: true, data: db.subjects });
});

// 3. Get Topics by Subject
app.get('/topics/subject/:subjectId', (req, res) => {
  const { subjectId } = req.params;
  const db = readDb();
  const filtered = db.topics.filter(t => t.subject_id === subjectId);
  res.json({ success: true, data: filtered });
});

// 4. Get Sub-topics by Topic
app.get('/sub-topics/topic/:topicId', (req, res) => {
  const { topicId } = req.params;
  const db = readDb();
  const filtered = db.sub_topics.filter(s => s.topic_id === topicId);
  res.json({ success: true, data: filtered });
});

// 11. Sub Topic by Topic List (POST)
app.post('/sub-topics/multi-topics', (req, res) => {
  const { topicIds } = req.body;
  if (!topicIds || !Array.isArray(topicIds)) {
    return res.status(400).json({ success: false, message: 'topicIds array is required' });
  }
  const db = readDb();
  const filtered = db.sub_topics.filter(s => topicIds.includes(s.topic_id));
  res.json({ success: true, data: filtered });
});

// 5. Get All Tests
app.get('/tests', (req, res) => {
  const db = readDb();
  res.json({ success: true, data: db.tests });
});

// 6. Create Test
app.post('/tests', (req, res) => {
  const testData = req.body;
  if (!testData.name || !testData.subject) {
    return res.status(400).json({ success: false, message: 'name and subject are required' });
  }
  const db = readDb();
  
  // Find subject name from subjects list if it is an ID
  const subjectObj = db.subjects.find(s => s.id === testData.subject || s.name === testData.subject);
  const subjectName = subjectObj ? subjectObj.name : testData.subject;
  const subjectId = subjectObj ? subjectObj.id : testData.subject;

  // Resolve topics names
  const topicIds = Array.isArray(testData.topics) ? testData.topics : [];
  const resolvedTopicNames = topicIds.map(tId => {
    const tObj = db.topics.find(t => t.id === tId || t.name === tId);
    return tObj ? tObj.name : tId;
  });

  // Resolve subtopics names
  const subTopicIds = Array.isArray(testData.sub_topics) ? testData.sub_topics : [];
  const resolvedSubTopicNames = subTopicIds.map(stId => {
    const stObj = db.sub_topics.find(st => st.id === stId || st.name === stId);
    return stObj ? stObj.name : stId;
  });

  const newTest = {
    id: crypto.randomUUID(),
    name: testData.name,
    type: testData.type || 'chapterwise',
    subject: subjectName,
    subject_id: subjectId,
    topics: resolvedTopicNames,
    topic_ids: topicIds,
    sub_topics: resolvedSubTopicNames,
    sub_topic_ids: subTopicIds,
    correct_marks: testData.correct_marks !== undefined ? Number(testData.correct_marks) : 4,
    wrong_marks: testData.wrong_marks !== undefined ? Number(testData.wrong_marks) : -1,
    unattempt_marks: testData.unattempt_marks !== undefined ? Number(testData.unattempt_marks) : 0,
    difficulty: testData.difficulty || 'medium',
    total_time: testData.total_time !== undefined ? Number(testData.total_time) : 60,
    total_marks: testData.total_marks !== undefined ? Number(testData.total_marks) : 0,
    total_questions: testData.total_questions !== undefined ? Number(testData.total_questions) : 0,
    status: testData.status || 'draft',
    questions: testData.questions || [],
    created_at: new Date().toISOString()
  };

  db.tests.push(newTest);
  writeDb(db);

  res.json({
    success: true,
    data: newTest,
    message: 'Test created successfully'
  });
});

// 8. Update Test / 10. Publish Test (PUT)
app.put('/tests/:id', (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const db = readDb();
  const testIndex = db.tests.findIndex(t => t.id === id);
  if (testIndex === -1) {
    return res.status(404).json({ success: false, message: 'Test not found' });
  }

  const existingTest = db.tests[testIndex];

  // Resolve update names if ID references changed
  let subjectName = existingTest.subject;
  let subjectId = existingTest.subject_id;
  if (updateData.subject) {
    const subjectObj = db.subjects.find(s => s.id === updateData.subject || s.name === updateData.subject);
    subjectName = subjectObj ? subjectObj.name : updateData.subject;
    subjectId = subjectObj ? subjectObj.id : updateData.subject;
  }

  let resolvedTopicNames = existingTest.topics;
  let topicIds = existingTest.topic_ids;
  if (updateData.topics) {
    topicIds = Array.isArray(updateData.topics) ? updateData.topics : [];
    resolvedTopicNames = topicIds.map(tId => {
      const tObj = db.topics.find(t => t.id === tId || t.name === tId);
      return tObj ? tObj.name : tId;
    });
  }

  let resolvedSubTopicNames = existingTest.sub_topics;
  let subTopicIds = existingTest.sub_topic_ids;
  if (updateData.sub_topics) {
    subTopicIds = Array.isArray(updateData.sub_topics) ? updateData.sub_topics : [];
    resolvedSubTopicNames = subTopicIds.map(stId => {
      const stObj = db.sub_topics.find(st => st.id === stId || st.name === stId);
      return stObj ? stObj.name : stId;
    });
  }

  const updatedTest = {
    ...existingTest,
    name: updateData.name !== undefined ? updateData.name : existingTest.name,
    type: updateData.type !== undefined ? updateData.type : existingTest.type,
    subject: subjectName,
    subject_id: subjectId,
    topics: resolvedTopicNames,
    topic_ids: topicIds,
    sub_topics: resolvedSubTopicNames,
    sub_topic_ids: subTopicIds,
    correct_marks: updateData.correct_marks !== undefined ? Number(updateData.correct_marks) : existingTest.correct_marks,
    wrong_marks: updateData.wrong_marks !== undefined ? Number(updateData.wrong_marks) : existingTest.wrong_marks,
    unattempt_marks: updateData.unattempt_marks !== undefined ? Number(updateData.unattempt_marks) : existingTest.unattempt_marks,
    difficulty: updateData.difficulty !== undefined ? updateData.difficulty : existingTest.difficulty,
    total_time: updateData.total_time !== undefined ? Number(updateData.total_time) : existingTest.total_time,
    total_marks: updateData.total_marks !== undefined ? Number(updateData.total_marks) : existingTest.total_marks,
    total_questions: updateData.total_questions !== undefined ? Number(updateData.total_questions) : existingTest.total_questions,
    status: updateData.status !== undefined ? updateData.status : existingTest.status,
    questions: updateData.questions !== undefined ? updateData.questions : existingTest.questions,
    updated_at: new Date().toISOString()
  };

  db.tests[testIndex] = updatedTest;
  writeDb(db);

  res.json({
    success: true,
    data: updatedTest,
    message: 'Test updated successfully'
  });
});

// 8. Get Test by ID
app.get('/tests/:id', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const test = db.tests.find(t => t.id === id);
  if (!test) {
    return res.status(404).json({ success: false, message: 'Test not found' });
  }
  res.json({ success: true, data: test });
});

// Delete Test API (Helper for dashboard CRUD actions)
app.delete('/tests/:id', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const testIndex = db.tests.findIndex(t => t.id === id);
  if (testIndex === -1) {
    return res.status(404).json({ success: false, message: 'Test not found' });
  }
  db.tests.splice(testIndex, 1);
  // Optional: cascade delete questions
  db.questions = db.questions.filter(q => q.test_id !== id);
  writeDb(db);
  res.json({ success: true, message: 'Test deleted successfully' });
});

// 9. Bulk Create / Update Questions (Upsert)
app.post('/questions/bulk', (req, res) => {
  const { questions } = req.body;
  if (!questions || !Array.isArray(questions)) {
    return res.status(400).json({ success: false, message: 'questions array is required' });
  }
  
  const db = readDb();
  const createdQuestions = [];

  for (const q of questions) {
    const qId = q.id || crypto.randomUUID();
    const existingIndex = db.questions.findIndex(eq => eq.id === qId);

    const questionObj = {
      id: qId,
      type: q.type || 'mcq',
      question: q.question,
      option1: q.option1,
      option2: q.option2,
      option3: q.option3,
      option4: q.option4,
      correct_option: q.correct_option,
      explanation: q.explanation || '',
      difficulty: q.difficulty || 'medium',
      test_id: q.test_id,
      topic_id: q.topic_id || '',
      sub_topic_id: q.sub_topic_id || '',
      media_url: q.media_url || '',
      created_at: q.created_at || new Date().toISOString(),
      updated_at: q.id ? new Date().toISOString() : undefined
    };

    if (existingIndex !== -1) {
      db.questions[existingIndex] = questionObj;
    } else {
      db.questions.push(questionObj);
    }
    
    createdQuestions.push(questionObj);
  }

  writeDb(db);

  res.json({
    success: true,
    data: createdQuestions,
    message: `Successfully processed ${createdQuestions.length} questions`
  });
});

// 12. Fetch Questions Bulk (POST)
app.post('/questions/fetchBulk', (req, res) => {
  const { question_ids } = req.body;
  if (!question_ids || !Array.isArray(question_ids)) {
    return res.status(400).json({ success: false, message: 'question_ids array is required' });
  }
  const db = readDb();
  const filtered = db.questions.filter(q => question_ids.includes(q.id));
  res.json({ success: true, data: filtered });
});

app.listen(PORT, () => {
  console.log(`Backend Server is running on port ${PORT}`);
});
