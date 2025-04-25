import { Hono } from 'hono';
import { prettyJSON } from 'hono/pretty-json';

interface Env {
  FEEDING_LOGS: D1Database;
}

const app = new Hono<{ Bindings: Env }>();

app.use('*', prettyJSON());

app.post('/api/feedings', async (c) => {
  try {
    const { time, amount, fedBy } = await c.req.json();
    if (!time || !amount || !fedBy) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    await c.env.FEEDING_LOGS.prepare(
      'INSERT INTO feedings (time, amount, fedBy) VALUES (?, ?, ?)'
    ).bind(time, amount, fedBy).run();

    return c.json({ success: true });
  } catch (error) {
    console.error('Error logging feeding:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/api/feedings', async (c) => {
  try {
    const { results } = await c.env.FEEDING_LOGS.prepare(
      'SELECT * FROM feedings ORDER BY time DESC'
    ).all();

    return c.json(results);
  } catch (error) {
    console.error('Error fetching feedings:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default app;