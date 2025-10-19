import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const CONTENT_DIR = path.resolve(process.cwd(), '../whole-wind/src/content/blog');

function loadAllPosts() {
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
  const posts = files.map((filename) => {
    const full = path.join(CONTENT_DIR, filename);
    const raw = fs.readFileSync(full, 'utf-8');
    const { data, content } = matter(raw);
    const slug = filename.replace(/\.(md|mdx)$/i, '');
    const html = marked.parse(content);
    const tags = Array.isArray(data.tags) ? data.tags : [];
    const difficulty = data.difficulty || null; // e.g., easy, medium, hard
    const date = data.pubDate || data.date || null;
    return {
      slug,
      title: data.title || slug,
      description: data.description || '',
      tags,
      difficulty,
      date,
      content,
      html,
    };
  });
  // 최신 순 정렬 (date 존재 시)
  posts.sort((a, b) => (b.date ? new Date(b.date) : 0) - (a.date ? new Date(a.date) : 0));
  return posts;
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/posts', (req, res) => {
  const { tag, difficulty, q } = req.query;
  const posts = loadAllPosts();
  const filtered = posts.filter((p) => {
    const byTag = tag ? p.tags.includes(String(tag)) : true;
    const byDiff = difficulty ? p.difficulty === String(difficulty) : true;
    const byQuery = q ? (p.title + ' ' + p.description + ' ' + p.content).toLowerCase().includes(String(q).toLowerCase()) : true;
    return byTag && byDiff && byQuery;
  }).map(({ content, html, ...rest }) => rest);
  res.json({ posts: filtered });
});

app.get('/api/posts/:slug', (req, res) => {
  const { slug } = req.params;
  const posts = loadAllPosts();
  const found = posts.find((p) => p.slug === slug);
  if (!found) return res.status(404).json({ error: 'Not found' });
  res.json(found);
});

app.get('/api/tags', (_req, res) => {
  const posts = loadAllPosts();
  const tagSet = new Set();
  posts.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
  res.json({ tags: Array.from(tagSet).sort() });
});

app.get('/api/difficulties', (_req, res) => {
  const posts = loadAllPosts();
  const diffSet = new Set();
  posts.forEach((p) => p.difficulty && diffSet.add(p.difficulty));
  res.json({ difficulties: Array.from(diffSet).sort() });
});

// 글 작성 API
app.post('/api/posts', (req, res) => {
  const { title, description, content, tags, difficulty, date } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: '제목과 내용은 필수입니다' });
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9가-힣]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const filename = `${slug}.md`;
  const filepath = path.join(CONTENT_DIR, filename);

  // 파일이 이미 존재하는지 확인
  if (fs.existsSync(filepath)) {
    return res.status(409).json({ error: '같은 제목의 글이 이미 존재합니다' });
  }

  const frontmatter = {
    title,
    description: description || '',
    tags: Array.isArray(tags) ? tags : [],
    difficulty: difficulty || null,
    pubDate: date || new Date().toISOString().split('T')[0]
  };

  const fileContent = `---\n${Object.entries(frontmatter)
    .filter(([_, v]) => v !== null && v !== '')
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? JSON.stringify(v) : JSON.stringify(v)}`)
    .join('\n')}\n---\n\n${content}`;

  try {
    fs.writeFileSync(filepath, fileContent, 'utf-8');
    res.json({ success: true, slug, filename });
  } catch (error) {
    res.status(500).json({ error: '파일 저장 실패' });
  }
});

// 글 수정 API
app.put('/api/posts/:slug', (req, res) => {
  const { slug } = req.params;
  const { title, description, content, tags, difficulty, date } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: '제목과 내용은 필수입니다' });
  }

  const oldFilepath = path.join(CONTENT_DIR, `${slug}.md`);
  if (!fs.existsSync(oldFilepath)) {
    return res.status(404).json({ error: '글을 찾을 수 없습니다' });
  }

  const newSlug = title.toLowerCase().replace(/[^a-z0-9가-힣]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const newFilepath = path.join(CONTENT_DIR, `${newSlug}.md`);

  const frontmatter = {
    title,
    description: description || '',
    tags: Array.isArray(tags) ? tags : [],
    difficulty: difficulty || null,
    pubDate: date || new Date().toISOString().split('T')[0]
  };

  const fileContent = `---\n${Object.entries(frontmatter)
    .filter(([_, v]) => v !== null && v !== '')
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? JSON.stringify(v) : JSON.stringify(v)}`)
    .join('\n')}\n---\n\n${content}`;

  try {
    // 새 파일명이 다르면 기존 파일 삭제
    if (newSlug !== slug) {
      fs.unlinkSync(oldFilepath);
    }
    fs.writeFileSync(newFilepath, fileContent, 'utf-8');
    res.json({ success: true, slug: newSlug, filename: `${newSlug}.md` });
  } catch (error) {
    res.status(500).json({ error: '파일 저장 실패' });
  }
});

// 글 삭제 API
app.delete('/api/posts/:slug', (req, res) => {
  const { slug } = req.params;
  const filepath = path.join(CONTENT_DIR, `${slug}.md`);
  
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: '글을 찾을 수 없습니다' });
  }

  try {
    fs.unlinkSync(filepath);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '파일 삭제 실패' });
  }
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});


