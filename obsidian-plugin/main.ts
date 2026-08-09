import { Plugin, PluginSettingTab, App, Setting, Modal, Notice } from 'obsidian';

interface DashboardSettings {
  vercelUrl: string;
}

const DEFAULT_SETTINGS: DashboardSettings = {
  vercelUrl: 'https://your-vercel-project.vercel.app'
};

export default class DashboardPlugin extends Plugin {
  settings: DashboardSettings;

  async onload() {
    await this.loadSettings();

    this.addCommand({
      id: 'show-dashboard',
      name: 'Show Dashboard',
      callback: () => {
        new DashboardModal(this.app, this.settings).open();
      }
    });

    this.addCommand({
      id: 'refresh-data',
      name: 'Refresh All Data',
      callback: () => {
        this.refreshData();
      }
    });

    this.addSettingTab(new SettingsTab(this.app, this));
  }

  async refreshData() {
    try {
      const url = this.settings.vercelUrl;
      const projects = await fetch(`${url}/api/projects`).then(r => r.json());
      const fitness = await fetch(`${url}/api/fitness`).then(r => r.json());
      const books = await fetch(`${url}/api/books`).then(r => r.json());
      const mindpick = await fetch(`${url}/api/mindpick`).then(r => r.json());

      new Notice('✅ Data refreshed successfully');
    } catch (error) {
      new Notice('❌ Failed to refresh data: ' + error.message);
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class DashboardModal extends Modal {
  settings: DashboardSettings;

  constructor(app: App, settings: DashboardSettings) {
    super(app);
    this.settings = settings;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.createEl('h2', { text: '강승원 대시보드' });

    const container = contentEl.createEl('div', { cls: 'dashboard-container' });

    const sections = ['강의', '피트니스', '독서', '마인드픽', '군대준비'];
    sections.forEach(section => {
      container.createEl('div', { cls: 'dashboard-section', text: `📊 ${section}` });
    });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

class SettingsTab extends PluginSettingTab {
  plugin: DashboardPlugin;

  constructor(app: App, plugin: DashboardPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Dashboard Settings' });

    new Setting(containerEl)
      .setName('Vercel URL')
      .setDesc('Your Vercel project URL')
      .addText(text => text
        .setPlaceholder('https://your-vercel-project.vercel.app')
        .setValue(this.plugin.settings.vercelUrl)
        .onChange(async (value) => {
          this.plugin.settings.vercelUrl = value;
          await this.plugin.saveSettings();
        })
      );
  }
}
