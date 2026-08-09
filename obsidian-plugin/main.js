'use strict';

// 컴파일 없이 옵시디언이 바로 읽는 CommonJS 플러그인.
// 네트워크는 requestUrl 을 쓴다 — 일반 fetch 는 CORS 에 막힌다.
const { Plugin, PluginSettingTab, Setting, ItemView, Notice, requestUrl } = require('obsidian');

const VIEW_TYPE = 'seungwon-dashboard';

const DEFAULT_SETTINGS = {
  apiUrl: 'https://part-time-six.vercel.app'
};

const ENDPOINTS = ['projects', 'courses', 'fitness', 'books', 'mindpick', 'military'];

async function fetchAll(apiUrl) {
  const base = apiUrl.replace(/\/+$/, '');
  const results = {};

  await Promise.all(ENDPOINTS.map(async (name) => {
    try {
      const res = await requestUrl({ url: `${base}/api/${name}`, method: 'GET' });
      results[name] = Array.isArray(res.json) ? res.json : [];
    } catch (err) {
      results[name] = { error: err.message || String(err) };
    }
  }));

  return results;
}

function pct(done, total) {
  if (!total) return 0;
  return Math.min(100, Math.round((done / total) * 100));
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

class DashboardView extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType() { return VIEW_TYPE; }
  getDisplayText() { return '강승원 대시보드'; }
  getIcon() { return 'layout-dashboard'; }

  async onOpen() {
    await this.render();
  }

  async render() {
    const root = this.contentEl;
    root.empty();
    root.addClass('sw-dash');

    const header = root.createDiv({ cls: 'sw-header' });
    header.createEl('h2', { text: '강승원 대시보드' });
    const refresh = header.createEl('button', { text: '새로고침', cls: 'sw-refresh' });
    refresh.onclick = () => this.render();

    const status = root.createDiv({ cls: 'sw-status', text: '불러오는 중…' });

    const data = await fetchAll(this.plugin.settings.apiUrl);

    const failed = ENDPOINTS.filter((n) => data[n] && data[n].error);
    if (failed.length === ENDPOINTS.length) {
      status.setText('연결 실패 — 설정에서 API 주소를 확인해줘.');
      status.addClass('sw-error');
      root.createEl('pre', { text: data[ENDPOINTS[0]].error });
      return;
    }
    status.remove();
    if (failed.length) {
      root.createDiv({ cls: 'sw-status sw-error', text: `일부 항목 실패: ${failed.join(', ')}` });
    }

    this.renderCourses(root, data.courses);
    this.renderBooks(root, data.books);
    this.renderFitness(root, data.fitness);
    this.renderMindpick(root, data.mindpick);
    this.renderMilitary(root, data.military);
    this.renderProjects(root, data.projects);

    root.createDiv({
      cls: 'sw-footer',
      text: `마지막 갱신 ${new Date().toLocaleString('ko-KR')}`
    });
  }

  section(root, title, emoji) {
    const card = root.createDiv({ cls: 'sw-card' });
    card.createEl('h3', { text: `${emoji} ${title}` });
    return card;
  }

  bar(parent, label, done, total, suffix) {
    const row = parent.createDiv({ cls: 'sw-row' });
    const top = row.createDiv({ cls: 'sw-row-top' });
    top.createSpan({ cls: 'sw-label', text: label });
    top.createSpan({ cls: 'sw-value', text: suffix || `${done} / ${total}` });

    const track = row.createDiv({ cls: 'sw-track' });
    const value = pct(done, total);
    const fill = track.createDiv({ cls: 'sw-fill' });
    fill.style.width = `${value}%`;
    if (value >= 100) fill.addClass('sw-done');
    return row;
  }

  empty(card, text) {
    card.createDiv({ cls: 'sw-empty', text });
  }

  renderCourses(root, rows) {
    const card = this.section(root, '강의', '📚');
    if (!Array.isArray(rows) || !rows.length) return this.empty(card, '등록된 강의 없음');

    const active = rows.filter((r) => r.status !== 'done');
    const totalL = rows.reduce((s, r) => s + (r.total_lectures || 0), 0);
    const doneL = rows.reduce((s, r) => s + (r.completed_lectures || 0), 0);

    this.bar(card, '전체 진도', doneL, totalL, `${doneL} / ${totalL}강 (${pct(doneL, totalL)}%)`);
    card.createDiv({ cls: 'sw-divider' });

    (active.length ? active : rows).forEach((r) => {
      this.bar(card, r.name, r.completed_lectures || 0, r.total_lectures || 0,
        `${r.completed_lectures || 0} / ${r.total_lectures || 0}강`);
    });
  }

  renderBooks(root, rows) {
    const card = this.section(root, '독서', '📖');
    if (!Array.isArray(rows) || !rows.length) return this.empty(card, '등록된 책 없음');

    const reading = rows.filter((r) => r.status === 'reading');
    const finished = rows.filter((r) => r.status === 'finished').length;

    card.createDiv({ cls: 'sw-stat', text: `읽는 중 ${reading.length}권 · 완독 ${finished}권 · 전체 ${rows.length}권` });

    if (!reading.length) return this.empty(card, '지금 읽는 중인 책 없음');
    reading.forEach((r) => {
      this.bar(card, r.title, r.current_page || 0, r.total_pages || 0,
        r.total_pages ? `${r.current_page || 0} / ${r.total_pages}p` : '쪽수 미입력');
    });
  }

  renderFitness(root, rows) {
    const card = this.section(root, '피트니스', '💪');
    if (!Array.isArray(rows) || !rows.length) return this.empty(card, '기록 없음');

    // API 가 date 내림차순으로 준다.
    const withWeight = rows.filter((r) => r.weight != null);
    const latest = withWeight[0];
    const cutoff = daysAgo(7);
    const week = rows.filter((r) => r.date >= cutoff).length;

    if (latest) {
      let line = `현재 ${latest.weight}kg (${latest.date})`;
      const prev = withWeight[1];
      if (prev) {
        const diff = (latest.weight - prev.weight).toFixed(1);
        const arrow = diff > 0 ? '▲' : diff < 0 ? '▼' : '–';
        line += `  ${arrow} ${Math.abs(diff)}kg`;
      }
      card.createDiv({ cls: 'sw-stat', text: line });
    }

    this.bar(card, '이번 주 운동', week, 7, `${week} / 7일`);
  }

  renderMindpick(root, rows) {
    const card = this.section(root, '마인드픽', '📱');
    if (!Array.isArray(rows) || !rows.length) return this.empty(card, '게시물 기록 없음');

    const latest = rows[0];
    const followers = rows.find((r) => r.followers != null);
    const cutoff = daysAgo(30);
    const month = rows.filter((r) => r.post_date >= cutoff);
    const avgReach = month.length
      ? Math.round(month.reduce((s, r) => s + (r.reach || 0), 0) / month.length)
      : 0;

    if (followers) card.createDiv({ cls: 'sw-stat', text: `팔로워 ${followers.followers.toLocaleString('ko-KR')}명` });
    card.createDiv({ cls: 'sw-stat', text: `최근 30일 ${month.length}개 · 평균 도달 ${avgReach.toLocaleString('ko-KR')}` });
    card.createDiv({ cls: 'sw-divider' });
    card.createDiv({ cls: 'sw-sub', text: `최근 게시물 (${latest.post_date})` });
    card.createDiv({ cls: 'sw-stat', text: `❤️ ${latest.likes || 0}  💬 ${latest.comments || 0}  🔖 ${latest.saves || 0}` });
  }

  renderMilitary(root, rows) {
    const card = this.section(root, '군대 준비', '🪖');
    if (!Array.isArray(rows) || !rows.length) return this.empty(card, '등록된 항목 없음');

    const done = rows.filter((r) => r.status === 'done').length;
    this.bar(card, '준비 진행률', done, rows.length, `${done} / ${rows.length}개`);
    card.createDiv({ cls: 'sw-divider' });

    rows.filter((r) => r.status !== 'done')
      .sort((a, b) => (a.target_date || '9999').localeCompare(b.target_date || '9999'))
      .slice(0, 8)
      .forEach((r) => {
        const item = card.createDiv({ cls: 'sw-todo' });
        item.createSpan({ cls: `sw-pri sw-pri-${r.priority || 'medium'}`, text: '●' });
        item.createSpan({ text: r.task });
        if (r.target_date) item.createSpan({ cls: 'sw-date', text: r.target_date });
      });
  }

  renderProjects(root, rows) {
    if (!Array.isArray(rows) || !rows.length) return;
    const card = this.section(root, '프로젝트', '🎯');
    rows.filter((r) => r.status !== 'done').forEach((r) => {
      this.bar(card, r.name, r.current_units || 0, r.total_units || 0);
    });
  }
}

module.exports = class DashboardPlugin extends Plugin {
  async onload() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());

    this.registerView(VIEW_TYPE, (leaf) => new DashboardView(leaf, this));

    this.addRibbonIcon('layout-dashboard', '강승원 대시보드', () => this.activateView());

    this.addCommand({
      id: 'open-dashboard',
      name: '대시보드 열기',
      callback: () => this.activateView()
    });

    this.addCommand({
      id: 'check-connection',
      name: 'API 연결 확인',
      callback: async () => {
        const base = this.settings.apiUrl.replace(/\/+$/, '');
        try {
          const res = await requestUrl({ url: `${base}/api/projects`, method: 'GET' });
          new Notice(`연결 성공 (${res.status})`);
        } catch (err) {
          new Notice(`연결 실패: ${err.message || err}`);
        }
      }
    });

    this.addSettingTab(new DashboardSettingTab(this.app, this));
  }

  async activateView() {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(VIEW_TYPE)[0];
    if (!leaf) {
      leaf = workspace.getRightLeaf(false);
      await leaf.setViewState({ type: VIEW_TYPE, active: true });
    }
    workspace.revealLeaf(leaf);
  }

  onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE);
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
};

class DashboardSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName('API 주소')
      .setDesc('Vercel 배포 주소. 끝에 /api 는 붙이지 않는다.')
      .addText((text) => text
        .setPlaceholder(DEFAULT_SETTINGS.apiUrl)
        .setValue(this.plugin.settings.apiUrl)
        .onChange(async (value) => {
          this.plugin.settings.apiUrl = value.trim();
          await this.plugin.saveSettings();
        }));
  }
}
