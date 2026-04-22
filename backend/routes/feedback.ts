import express from 'express';

const router = express.Router();

// In-memory store for feedback (no DB needed for MVP)
const feedbackStore: Array<{
  id: string;
  type: string;
  content: string;
  contact?: string;
  createdAt: string;
}> = [];

// In-memory analytics store
const analyticsStore: Array<{
  event: string;
  examId?: string;
  action?: string;
  timestamp: string;
}> = [];

// POST /api/feedback - Submit feedback
router.post('/', (req, res) => {
  const { type, content, contact } = req.body as { type: string; content: string; contact?: string };

  if (!type || !content || content.trim().length === 0) {
    return res.status(400).json({ success: false, message: '请填写反馈内容' });
  }

  const entry = {
    id: `fb-${Date.now()}`,
    type,
    content: content.trim(),
    contact: contact?.trim(),
    createdAt: new Date().toISOString(),
  };

  feedbackStore.push(entry);
  console.log('[Feedback]', entry);

  return res.json({ success: true, data: { id: entry.id } });
});

// POST /api/analytics - Track user behavior
router.post('/analytics', (req, res) => {
  const { event, examId, action } = req.body as { event: string; examId?: string; action?: string };

  if (!event) {
    return res.status(400).json({ success: false, message: 'Missing event' });
  }

  const entry = {
    event,
    examId,
    action,
    timestamp: new Date().toISOString(),
  };

  analyticsStore.push(entry);
  console.log('[Analytics]', entry);

  return res.json({ success: true, data: null });
});

// GET /api/feedback/analytics - Get analytics summary (for product manager)
router.get('/analytics', (_req, res) => {
  const summary: Record<string, number> = {};
  for (const e of analyticsStore) {
    const key = e.examId ? `${e.event}:${e.examId}` : e.event;
    summary[key] = (summary[key] || 0) + 1;
  }
  return res.json({ success: true, data: { events: analyticsStore, summary } });
});

export default router;
