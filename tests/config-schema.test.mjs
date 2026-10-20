import assert from 'node:assert/strict'
import test from 'node:test'
import {
  parseAppConfig,
  parsePluginConfigs,
  getDefaultPluginConfigs,
  defaultAppConfig,
  defaultSiteConfig,
  defaultProfileConfig,
  defaultHeroConfig,
} from '../src/core/configSchema.ts'

// ── parseAppConfig ──

test('parseAppConfig returns defaults for null input', () => {
  const config = parseAppConfig(null)
  assert.equal(config.site.title, defaultSiteConfig.title)
  assert.equal(config.profile.name, defaultProfileConfig.name)
})

test('parseAppConfig returns defaults for undefined input', () => {
  const config = parseAppConfig(undefined)
  assert.equal(config.site.title, defaultSiteConfig.title)
})

test('parseAppConfig returns defaults for empty object', () => {
  const config = parseAppConfig({})
  assert.equal(config.site.title, defaultSiteConfig.title)
  assert.equal(config.profile.name, defaultProfileConfig.name)
  assert.equal(config.motion.intro, defaultAppConfig.motion.intro)
})

test('parseAppConfig preserves valid site config', () => {
  const config = parseAppConfig({
    site: { title: 'My Hub', description: 'My desc', author: 'Me', theme: 'dark' },
  })
  assert.equal(config.site.title, 'My Hub')
  assert.equal(config.site.description, 'My desc')
  assert.equal(config.site.author, 'Me')
  assert.equal(config.site.theme, 'dark')
})

test('parseAppConfig falls back to default for empty title', () => {
  const config = parseAppConfig({
    site: { title: '', description: 'd', author: 'a', theme: 'dark' },
  })
  assert.equal(config.site.title, defaultSiteConfig.title)
})

test('parseAppConfig falls back to default for invalid theme', () => {
  const config = parseAppConfig({
    site: { title: 'T', description: 'D', author: 'A', theme: 'purple' },
  })
  assert.equal(config.site.theme, defaultSiteConfig.theme)
})

test('parseAppConfig preserves valid profile config', () => {
  const config = parseAppConfig({
    profile: {
      avatar: '/avatar.png',
      name: 'Alice',
      title: 'Engineer',
      bio: 'Bio text',
      skills: ['React', 'Go'],
      location: 'Shanghai',
      email: 'alice@example.com',
    },
  })
  assert.equal(config.profile.name, 'Alice')
  assert.deepEqual(config.profile.skills, ['React', 'Go'])
})

test('parseAppConfig falls back for invalid email', () => {
  const config = parseAppConfig({
    profile: { name: 'Alice', email: 'not-an-email' },
  })
  assert.equal(config.profile.email, defaultProfileConfig.email)
})

test('parseAppConfig preserves valid hero config', () => {
  const config = parseAppConfig({
    hero: {
      videoUrl: '/videos/bg.mp4',
      videoPosition: 'center top',
      badge: 'HELLO',
      headline: ['A', 'B'],
      subline: 'Sub',
      ctaLabel: 'Go',
      ctaHref: '#/home',
    },
  })
  assert.equal(config.hero.badge, 'HELLO')
  assert.deepEqual(config.hero.headline, ['A', 'B'])
})

test('parseAppConfig falls back for empty headline array', () => {
  const config = parseAppConfig({
    hero: { headline: [] },
  })
  assert.deepEqual(config.hero.headline, defaultHeroConfig.headline)
})

test('parseAppConfig clamps introDuration to valid range', () => {
  const tooLow = parseAppConfig({ motion: { intro: true, introDuration: 100 } })
  assert.equal(tooLow.motion.introDuration, defaultAppConfig.motion.introDuration)

  const tooHigh = parseAppConfig({ motion: { intro: true, introDuration: 99999 } })
  assert.equal(tooHigh.motion.introDuration, defaultAppConfig.motion.introDuration)

  const valid = parseAppConfig({ motion: { intro: true, introDuration: 2000 } })
  assert.equal(valid.motion.introDuration, 2000)
})

// ── parsePluginConfigs ──

test('parsePluginConfigs returns defaults for null input', () => {
  const plugins = parsePluginConfigs(null)
  assert.ok(plugins.length > 0)
  assert.ok(plugins.some((p) => p.id === 'profile'))
})

test('parsePluginConfigs returns defaults for empty object', () => {
  const plugins = parsePluginConfigs({})
  assert.ok(plugins.length > 0)
})

test('parsePluginConfigs returns defaults for empty plugins array', () => {
  const plugins = parsePluginConfigs({ plugins: [] })
  assert.ok(plugins.length > 0)
  assert.ok(plugins.some((p) => p.id === 'profile'))
})

test('parsePluginConfigs preserves valid plugin list', () => {
  const plugins = parsePluginConfigs({
    plugins: [
      { id: 'profile', enabled: true, order: 1, config: {} },
      { id: 'ai-navigator', enabled: true, order: 2, config: {} },
    ],
  })
  assert.equal(plugins.length, 2)
  assert.equal(plugins[0].id, 'profile')
  assert.equal(plugins[1].id, 'ai-navigator')
})

test('parsePluginConfigs assigns order by index when order is 0', () => {
  const plugins = parsePluginConfigs({
    plugins: [
      { id: 'profile', enabled: true, order: 0, config: {} },
      { id: 'wish-wall', enabled: true, order: 0, config: {} },
    ],
  })
  assert.equal(plugins[0].order, 1)
  assert.equal(plugins[1].order, 2)
})

test('parsePluginConfigs defaults enabled to true when not specified', () => {
  const plugins = parsePluginConfigs({
    plugins: [{ id: 'profile', order: 1, config: {} }],
  })
  assert.equal(plugins[0].enabled, true)
})

// ── getDefaultPluginConfigs ──

test('getDefaultPluginConfigs returns non-empty list with profile enabled', () => {
  const defaults = getDefaultPluginConfigs()
  assert.ok(defaults.length > 0)
  const profile = defaults.find((p) => p.id === 'profile')
  assert.ok(profile)
  assert.equal(profile.enabled, true)
})

test('getDefaultPluginConfigs has disabled plugins for optional modules', () => {
  const defaults = getDefaultPluginConfigs()
  const inbox = defaults.find((p) => p.id === 'universal-inbox')
  assert.ok(inbox)
  assert.equal(inbox.enabled, false)

  const workbench = defaults.find((p) => p.id === 'workbench')
  assert.ok(workbench)
  assert.equal(workbench.enabled, false)
})

// ── parsePluginConfigs with runtime config parsing ──

test('parsePluginConfigs parses ai-navigator config with categories and tools', () => {
  const plugins = parsePluginConfigs({
    plugins: [
      {
        id: 'ai-navigator',
        enabled: true,
        order: 1,
        config: {
          categories: [
            { id: 'all', title: '全部' },
          ],
          intentPrompts: ['搜索'],
          tools: [
            {
              id: 'test',
              title: 'Test',
              category: 'all',
              url: 'https://test.com',
              description: 'desc',
            },
          ],
        },
      },
    ],
  })
  assert.equal(plugins.length, 1)
  assert.ok(plugins[0].config)
  assert.ok(plugins[0].config.categories)
  assert.equal(plugins[0].config.categories[0].title, '全部')
})

test('parsePluginConfigs returns undefined config for invalid ai-navigator data', () => {
  const plugins = parsePluginConfigs({
    plugins: [
      {
        id: 'ai-navigator',
        enabled: true,
        order: 1,
        config: 'not-an-object',
      },
    ],
  })
  assert.equal(plugins[0].config, undefined)
})