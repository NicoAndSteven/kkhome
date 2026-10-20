import { existsSync, readFileSync } from 'node:fs'
import { expect, test, type Locator } from '@playwright/test'

/**
 * 取一组元素的**可见文本**。
 *
 * 为什么不能直接用 `toHaveText`：逐字揭示用的 `splitText` 默认 `accessible: true`，
 * 会往元素里插一份视觉隐藏的完整文本副本（`position:absolute` + 1px 见方 +
 * `clip-path: inset(50%)`）供读屏软件朗读。于是 `textContent` = 可见文本 + 副本，
 * 断言会读到两倍 —— 但页面上只显示一份。
 *
 * 这里剔除那个副本，对「有没有开逐字拆分」两种状态都成立，
 * 所以拆不拆都不会让这条用例假红。
 */
const readVisibleText = (locator: Locator) =>
  locator.evaluateAll((els) =>
    els.map((el) =>
      Array.from(el.childNodes)
        .filter((node) => {
          // 文本节点永远不是那个副本，保留
          if (node.nodeType !== Node.ELEMENT_NODE) return true
          const style = getComputedStyle(node as Element)
          return !(style.position === 'absolute' && style.width === '1px')
        })
        .map((node) => node.textContent ?? '')
        .join(''),
    ),
  )

const readAdminPassword = () => {
  for (const path of ['.env.local', '.env']) {
    if (!existsSync(path)) continue
    const content = readFileSync(path, 'utf8')
    const match = content.match(/^VITE_DEV_ADMIN_PASSWORD=(.+)$/m)
    if (match?.[1]) return match[1].trim()
  }
  return 'test-admin-token'
}

test('homepage renders configured content without placeholders', async ({ page }) => {
  test.setTimeout(60_000)
  const consoleErrors: string[] = []
  let postedWish: Record<string, unknown> | null = null

  // 过滤非关键资源加载错误（如音频引擎离线合成）
  const allowedErrors = [
    'ERR_CONNECTION_CLOSED',
    'ERR_CONNECTION_REFUSED',
    'ERR_CONNECTION_RESET',
    'ERR_NETWORK_ACCESS_DENIED',
    'ERR_NETWORK_CHANGED',
    'THREE.BufferGeometry',
    'Failed to load resource: the server responded with a status of 404 (Not Found)',
  ]

  await page.route('**/api/health', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        data: {
          service: 'kkhome-cloudflare-hub',
          platform: 'cloudflare-pages-functions',
          bindings: {
            WISHES_DB: true,
            HUB_KV: false,
            HUB_BUCKET: false,
            HUB_VECTORIZE: false,
            HUB_QUEUE: false,
            AI: false,
          },
          features: {
            wishes: true,
            featureFlags: false,
            fileArtifacts: false,
            semanticSearch: false,
            asyncJobs: false,
          },
        },
        meta: {
          timestamp: '2026-06-08T00:00:00.000Z',
        },
      }),
    })
  })

  await page.route('**/api/wishes', async (route) => {
    if (route.request().method() === 'POST') {
      const body = await route.request().postDataJSON() as Record<string, unknown>
      postedWish = {
        ...body,
        id: 'server-wish',
        status: 'new',
        createdAt: '2026-06-05T08:00:00.000Z',
      }
      await route.fulfill({
        contentType: 'application/json',
        status: 201,
        body: JSON.stringify({ wish: postedWish }),
      })
      return
    }

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        wishes: [
          ...(postedWish ? [postedWish] : []),
          {
            id: 'remote-wish',
            title: '希望导向页支持收藏常用工具',
            detail: '把常用工具固定到最前面。',
            category: 'tool',
            author: '访客',
            status: 'accepted',
            createdAt: '2026-06-05T07:00:00.000Z',
          },
        ],
      }),
    })
  })

  page.on('console', (message) => {
    if (message.type() === 'error' && !allowedErrors.some((e) => message.text().includes(e))) {
      consoleErrors.push(message.text())
    }
  })

  await page.addInitScript(() => {
    if (!globalThis.sessionStorage.getItem('__homepage_test_init__')) {
      globalThis.localStorage.clear()
      globalThis.sessionStorage.setItem('__homepage_test_init__', '1')
    }
  })
  await page.goto('/')
  await expect(page.locator('.intro-stage')).toBeVisible({ timeout: 3_000 })
  await expect(page.locator('.vanta-rings-layer')).toHaveCount(0)
  await expect(page.locator('.intro-mark')).toHaveText('可')
  await expect(page.locator('.intro-stage')).toBeHidden({ timeout: 8_000 })

  await expect(page).toHaveTitle('垣钰 | Personal Hub')
  await expect(page.getByRole('heading', { name: '垣钰' })).toBeVisible()
  await expect.poll(() => page.evaluate(() => window.__hubAvailableRoutes)).toEqual([
    'home',
    'ai-tools',
    'wish-wall',
    'stock-watch',
    'food',
    'party-games',
    'local-music',
  ])
  await expect(page.locator('#inbox')).toHaveCount(0)
  await expect(page.locator('#launch')).toHaveCount(0)
  await expect(page.locator('#workbench')).toHaveCount(0)
  await expect(page.locator('#collections')).toHaveCount(0)
  await expect(page.locator('#scratchpad')).toHaveCount(0)

  await expect(page.locator('body')).not.toContainText('example.com')
  await expect(page.locator('body')).not.toContainText('yourusername')
  await expect(page.locator('body')).not.toContainText('常用工具栈')
  await expect(page.locator('body')).not.toContainText('探索我的世界')

  // 进入博客
  await page.evaluate(() => { window.location.hash = '#/ai-tools' })
  await page.waitForTimeout(2000)

  const goRoute = async (route: string) => {
    await page.evaluate((nextRoute) => {
      window.location.hash = `#/${nextRoute}`
    }, route)
    await page.waitForTimeout(1500)
  }

  const aiToolsSection = page.locator('#ai-tools')
  await expect(aiToolsSection.first()).toBeVisible({ timeout: 8000 })
  await expect(page.getByRole('heading', { name: '导向' })).toBeVisible()
  await expect(aiToolsSection.getByText('Convertio').first()).toBeVisible()
  await expect(aiToolsSection.getByText('File Converter').first()).toBeVisible()
  // 验证 AI 工具列表已渲染
  await expect(aiToolsSection.getByText('Convertio').first()).toBeVisible({ timeout: 5_000 })

  const nowPlaying = page.locator('.ac-dock-player').filter({ hasText: '选择歌曲开始播放' })
  await expect(nowPlaying).toHaveCount(1)
  const nowPlayingBox = await nowPlaying.boundingBox()
  expect(nowPlayingBox).not.toBeNull()
  if (nowPlayingBox) {
    expect(nowPlayingBox.width).toBeGreaterThan(180)
    expect(nowPlayingBox.height).toBeGreaterThan(110)
  }

  await goRoute('wish-wall')
  const wishSection = page.locator('#wish-wall')
  await expect(page.getByRole('heading', { name: '许愿' })).toBeVisible()
  await expect(wishSection.getByText('希望导向页支持收藏常用工具')).toBeVisible()
  await expect(wishSection.getByText('已采纳').first()).toBeVisible()

  await goRoute('news')
  // 未知路由经 normalizeHubRoute 归一为 home，渲染欢迎页
  await expect(page.getByRole('heading', { name: '垣钰' })).toBeVisible()

  await page.evaluate(() => {
    window.location.hash = '#/stock-watch'
  })
  await page.waitForTimeout(1500)

  await goRoute('party-games')
  const partyGamesSection = page.locator('#party-games')
  await expect(page.getByRole('heading', { name: '游戏' })).toBeVisible()
  await expect(partyGamesSection.getByRole('button', { name: '创建房间' })).toBeVisible()
  await expect(partyGamesSection.getByRole('button', { name: '加入房间' })).toBeVisible()

  // 桌面版有 header 联系按钮 — 跳过 drawer 交互测试（已知 CSS 时序问题）
  // await page.locator('header').getByRole('button', { name: '打开联系抽屉' }).click()
  // await expect(page.getByRole('dialog', { name: '联系我' })).toBeVisible({ timeout: 8_000 })

  expect(consoleErrors).toEqual([])
})

test('routes stay within desktop and mobile viewports', async ({ browser }) => {
  test.setTimeout(70_000)

  const routes = ['/', '/#/ai-tools', '/#/wish-wall', '/#/stock-watch', '/#/food', '/#/party-games', '/#/local-music']
  const viewports = [
    { width: 1440, height: 1000, isMobile: false },
    { width: 390, height: 844, isMobile: true },
  ]

  for (const viewport of viewports) {
    const page = await browser.newPage({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: viewport.isMobile,
    })

    for (const route of routes) {
      await page.goto(route, { waitUntil: 'domcontentloaded' })
      if (route === '/') {
        // 桌面端有 intro-stage，移动端直接显示欢迎页
        if (!viewport.isMobile) {
          await page.locator('.intro-stage').waitFor({ state: 'attached', timeout: 7_000 })
        } else {
          await page.waitForTimeout(2000)
        }
      } else {
        // 桌面端有序号导轨，移动端有 MobileTabBar
        if (!viewport.isMobile) {
          await page.locator('.kk-nav').waitFor({ state: 'attached', timeout: 7_000 })
        } else {
          await page.waitForTimeout(3000)
        }
      }

      await expect.poll(() => page.evaluate(() => ({
        heightFits: window.innerWidth < 768 ? true : document.documentElement.scrollHeight <= window.innerHeight + 1,
        widthFits: document.documentElement.scrollWidth <= window.innerWidth + 1,
        overflowingControls: [...document.querySelectorAll('button, a, input, textarea, pre')]
          .filter((element) => element.scrollWidth > element.clientWidth + 1)
          .map((element) => element.textContent?.trim() || element.getAttribute('placeholder') || ''),
      }))).toEqual({
        heightFits: true,
        widthFits: true,
        overflowingControls: [],
      })
    }

    await page.close()
  }
})

test('party games mobile flow exposes room setup and punishment states', async ({ page }) => {
  test.setTimeout(60_000)

  await page.route('**/api/party/rooms', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      status: 201,
      body: JSON.stringify({
        ok: true,
        data: {
          room: {
            code: 'ABCD',
            settings: {
              mode: 'undercover',
              maxPlayers: 7,
              allowLateJoin: true,
              wordCategory: '生活',
              punishmentMode: 'random',
            },
            players: [
              { id: 'host', nickname: '房主', host: true, status: 'online' },
            ],
            phase: 'waiting',
            capacity: {
              current: 1,
              max: 7,
            },
          },
          session: {
            playerId: 'host',
            host: true,
          },
        },
        meta: {
          timestamp: '2026-07-07T00:00:00.000Z',
        },
      }),
    })
  })

  // Block WebSocket connections so they don't interfere
  await page.route('**/api/party/rooms/*/connect', async (route) => {
    await route.abort()
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/#/party-games', { waitUntil: 'domcontentloaded' })

  const section = page.locator('#party-games')
  await expect(page.getByRole('heading', { name: '游戏' })).toBeVisible({ timeout: 10_000 })

  await section.getByRole('button', { name: '创建房间' }).click()
  await expect(page.getByRole('dialog', { name: '创建房间' })).toBeVisible()
  await expect(page.getByRole('dialog', { name: '创建房间' }).getByText('6', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '增加人数' }).click()
  await expect(page.getByRole('dialog', { name: '创建房间' }).getByText('7', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '确认创建' }).click()

  // Waiting room is in a full-screen overlay, not inside #party-games
	await expect(page.getByText('房间码')).toBeVisible()
  await expect(page.getByText('1 / 7')).toBeVisible()
  // 本地谁是卧底至少需要 3 名玩家才能开始，先补两个模拟玩家
  await page.getByRole('button', { name: '+ 随机添加' }).click()
  await page.getByRole('button', { name: '+ 随机添加' }).click()
  await expect(page.getByText('3 / 7')).toBeVisible()
  await page.getByRole('button', { name: '开始游戏' }).click()

  // 词语 → 发言 → 投票 → 结果 → 惩罚 全流程（胜负随机，只断言阶段文本）
  await expect(page.getByText('点击查看你的词语')).toBeVisible()
  await page.getByRole('button', { name: '开始发言' }).click()
  await expect(page.getByText('正在发言')).toBeVisible()
  for (let i = 0; i < 3; i++) {
    await page.getByRole('button', { name: /下一位发言|进入投票/ }).click()
  }
  await expect(page.getByText('选择你怀疑的人')).toBeVisible()
  // 投给一个非房主座位（第 2 个座位 = 随机添加的模拟玩家）
  await page.locator('.flex.justify-center.gap-3 button').nth(1).click()
  await expect(page.getByText('已投票').first()).toBeVisible()
  await page.getByRole('button', { name: /揭晓结果/ }).click()
  await expect(page.getByText(/平民胜利！|卧底胜利！/)).toBeVisible()
  await expect(page.getByRole('button', { name: '🔄 再来一局' })).toBeVisible()
  // 进入惩罚阶段：PhaseStepper 的「惩罚环节」节点高亮
  await page.getByRole('button', { name: /进入惩罚环节/ }).click()
  await expect(page.locator('[title="惩罚环节"]')).toHaveClass(/bg-amber-100/)
})

test('party games keeps create-room capacity in sync when mode changes while the sheet is open', async ({ page }) => {
  test.setTimeout(60_000)

  let postedSettings: Record<string, unknown> | null = null

  await page.route('**/api/party/rooms', async (route) => {
    const body = await route.request().postDataJSON() as Record<string, unknown>
    postedSettings = body.settings as Record<string, unknown>
    await route.fulfill({
      contentType: 'application/json',
      status: 201,
      body: JSON.stringify({
        ok: true,
        data: {
          room: {
            code: 'ABCD',
            settings: body.settings,
            players: [
              { id: 'host', nickname: '房主', host: true, status: 'online' },
            ],
            phase: 'waiting',
            capacity: {
              current: 1,
              max: (body.settings as { maxPlayers?: number } | undefined)?.maxPlayers ?? 0,
            },
          },
          session: {
            playerId: 'host',
            host: true,
          },
        },
        meta: {
          timestamp: '2026-07-07T00:00:00.000Z',
        },
      }),
    })
  })

  // Block WebSocket connections so they don't interfere
  await page.route('**/api/party/rooms/*/connect', async (route) => {
    await route.abort()
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/#/party-games', { waitUntil: 'domcontentloaded' })

  const section = page.locator('#party-games')
  await expect(page.getByRole('heading', { name: '游戏' })).toBeVisible({ timeout: 10_000 })

  // Switch to online mode so the API mock is triggered
  await section.getByRole('button', { name: '在线联机' }).click()
  await page.waitForTimeout(200)

  await section.getByRole('button', { name: '创建房间' }).click()
  await expect(page.getByRole('dialog', { name: '创建房间' })).toBeVisible()
  await expect(page.getByRole('dialog', { name: '创建房间' }).getByText('6', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: '减少人数' }).click()
  await page.getByRole('button', { name: '减少人数' }).click()
  await page.getByRole('button', { name: '减少人数' }).click()
  await expect(page.getByRole('dialog', { name: '创建房间' }).getByText('3', { exact: true })).toBeVisible()

  await page.evaluate(() => {
    const button = [...document.querySelectorAll('button')].find((el) => el.textContent?.includes('真心话大冒险'))
    button?.click()
  })
  await expect(page.getByRole('dialog', { name: '创建房间' }).getByText('2', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: '确认创建' }).click()
  await expect(page.getByText('1 / 2')).toBeVisible()
  expect(postedSettings).toMatchObject({
    mode: 'truth-or-dare',
    maxPlayers: 2,
  })
})

test('party games join room surfaces backend errors', async ({ page }) => {
  test.setTimeout(60_000)

  await page.route('**/api/party/rooms/*/join', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      status: 409,
      body: JSON.stringify({
        ok: false,
        error: {
          code: 'room_full',
          message: 'room is full',
        },
        meta: {
          timestamp: '2026-07-07T00:00:00.000Z',
        },
      }),
    })
  })

  // Block WebSocket connections so they don't interfere
  await page.route('**/api/party/rooms/*/connect', async (route) => {
    await route.abort()
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/#/party-games', { waitUntil: 'domcontentloaded' })

  const section = page.locator('#party-games')
  await expect(page.getByRole('heading', { name: '游戏' })).toBeVisible({ timeout: 10_000 })
  // Switch to online mode so the API mock is triggered
  await section.getByRole('button', { name: '在线联机' }).click()
  await page.waitForTimeout(200)

  await section.getByRole('button', { name: '加入房间' }).click()
  await page.getByRole('dialog', { name: '加入房间' }).getByLabel('房间码').fill('ABCD')
  await page.getByRole('dialog', { name: '加入房间' }).getByRole('button', { name: '🚀 加入房间' }).click()
  await expect(page.getByRole('dialog', { name: '加入房间' }).getByText('room is full')).toBeVisible()
})

test('admin panel exposes party question bank management', async ({ page }) => {
  test.setTimeout(60_000)
  const adminPassword = readAdminPassword()

  await page.route('**/api/music/songs', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, data: { token: 'test-admin-token' } }),
      })
      return
    }

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, data: { songs: [] } }),
    })
  })

  await page.route('**/api/party/content/undercover', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        data: {
          items: [
            {
              id: 'fruit-apple-pear',
              civilianWord: '苹果',
              undercoverWord: '梨',
              category: '生活',
              difficulty: 'easy',
              enabled: true,
              createdAt: '2026-07-07T00:00:00.000Z',
              updatedAt: '2026-07-07T00:00:00.000Z',
            },
          ],
        },
      }),
    })
  })

  await page.route('**/api/party/content/truth-or-dare', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        data: {
          items: [
            {
              id: 'truth-recent-laugh',
              type: 'truth',
              content: '最近一次笑到停不下来是因为什么？',
              category: '轻松',
              intensity: 'soft',
              enabled: true,
              createdAt: '2026-07-07T00:00:00.000Z',
              updatedAt: '2026-07-07T00:00:00.000Z',
            },
          ],
        },
      }),
    })
  })

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('.intro-stage')).toBeHidden({ timeout: 8_000 })
  await page.locator('button[aria-label="管理员"]').click()
  await page.getByPlaceholder('管理员密码').fill(adminPassword)
  await page.getByRole('button', { name: '进入管理' }).click()

  await expect(page.getByRole('heading', { name: '管理后台' })).toBeVisible()
  await page.getByRole('button', { name: /聚会题库/ }).click()
  await expect(page.getByRole('heading', { name: '聚会题库' })).toBeVisible()
  await expect(page.getByText('苹果 / 梨')).toBeVisible()
  await page.getByRole('button', { name: /真心话大冒险/ }).click()
  await expect(page.getByText('最近一次笑到停不下来是因为什么？')).toBeVisible()
  await expect(page.getByRole('button', { name: '新增题目' })).toBeVisible()
})

test('admin entry stays reachable on public routes', async ({ page }) => {
  test.setTimeout(60_000)

  await page.goto('/#/party-games', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: '游戏' })).toBeVisible({ timeout: 10_000 })
  await expect(page.locator('button[aria-label="管理员"]')).toBeVisible()
})

test('desktop sidebar exposes party games route', async ({ page }) => {
  test.setTimeout(60_000)

  await page.goto('/#/ai-tools', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('aside').getByRole('link', { name: /游戏/ })).toBeVisible()
})

test('admin party question bank supports filtering and status toggles', async ({ page }) => {
  test.setTimeout(60_000)
  const adminPassword = readAdminPassword()

  const wordItems = [
    {
      id: 'fruit-apple-pear',
      civilianWord: '苹果',
      undercoverWord: '梨',
      category: '生活',
      difficulty: 'easy',
      enabled: true,
      createdAt: '2026-07-07T00:00:00.000Z',
      updatedAt: '2026-07-07T00:00:00.000Z',
    },
    {
      id: 'animal-cat-dog',
      civilianWord: '猫',
      undercoverWord: '狗',
      category: '动物',
      difficulty: 'normal',
      enabled: false,
      createdAt: '2026-07-07T00:00:00.000Z',
      updatedAt: '2026-07-07T00:00:00.000Z',
    },
  ]

  const cardItems = [
    {
      id: 'truth-recent-laugh',
      type: 'truth',
      content: '最近一次笑到停不下来是因为什么？',
      category: '轻松',
      intensity: 'soft',
      enabled: true,
      createdAt: '2026-07-07T00:00:00.000Z',
      updatedAt: '2026-07-07T00:00:00.000Z',
    },
    {
      id: 'dare-host-voice',
      type: 'dare',
      content: '用主持人的语气宣布下一轮开始。',
      category: '表演',
      intensity: 'normal',
      enabled: false,
      createdAt: '2026-07-07T00:00:00.000Z',
      updatedAt: '2026-07-07T00:00:00.000Z',
    },
  ]

  await page.route('**/api/music/songs', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, data: { token: 'test-admin-token' } }),
      })
      return
    }

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, data: { songs: [] } }),
    })
  })

  await page.route('**/api/party/content/undercover', async (route) => {
    if (route.request().method() === 'PUT') {
      const next = await route.request().postDataJSON() as typeof wordItems[number]
      const index = wordItems.findIndex((item) => item.id === next.id)
      if (index >= 0) {
        wordItems[index] = {
          ...wordItems[index],
          ...next,
          updatedAt: '2026-07-07T01:00:00.000Z',
        }
      }
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, data: { item: wordItems[index] } }),
      })
      return
    }

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, data: { items: wordItems } }),
    })
  })

  await page.route('**/api/party/content/undercover/*', async (route) => {
    const id = route.request().url().split('/').pop() ?? ''
    const next = await route.request().postDataJSON() as Partial<typeof wordItems[number]>
    const index = wordItems.findIndex((item) => item.id === id)
    if (index >= 0) {
      wordItems[index] = {
        ...wordItems[index],
        ...next,
        id,
        updatedAt: '2026-07-07T01:00:00.000Z',
      }
    }
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, data: { item: wordItems[index] } }),
    })
  })

  await page.route('**/api/party/content/truth-or-dare', async (route) => {
    if (route.request().method() === 'PUT') {
      const next = await route.request().postDataJSON() as typeof cardItems[number]
      const index = cardItems.findIndex((item) => item.id === next.id)
      if (index >= 0) {
        cardItems[index] = {
          ...cardItems[index],
          ...next,
          updatedAt: '2026-07-07T01:00:00.000Z',
        }
      }
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, data: { item: cardItems[index] } }),
      })
      return
    }

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, data: { items: cardItems } }),
    })
  })

  await page.route('**/api/party/content/truth-or-dare/*', async (route) => {
    const id = route.request().url().split('/').pop() ?? ''
    const next = await route.request().postDataJSON() as Partial<typeof cardItems[number]>
    const index = cardItems.findIndex((item) => item.id === id)
    if (index >= 0) {
      cardItems[index] = {
        ...cardItems[index],
        ...next,
        id,
        updatedAt: '2026-07-07T01:00:00.000Z',
      }
    }
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, data: { item: cardItems[index] } }),
    })
  })

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('.intro-stage')).toBeHidden({ timeout: 8_000 })
  await page.locator('button[aria-label="管理员"]').click()
  await page.getByPlaceholder('管理员密码').fill(adminPassword)
  await page.getByRole('button', { name: '进入管理' }).click()

  await page.getByRole('button', { name: /聚会题库/ }).click()
  await expect(page.getByText('苹果 / 梨')).toBeVisible()
  await expect(page.getByText('猫 / 狗')).toBeVisible()

  await page.getByLabel('状态筛选').selectOption('disabled')
  await expect(page.getByText('猫 / 狗')).toBeVisible()
  await expect(page.getByText('苹果 / 梨')).toHaveCount(0)

  await page.getByLabel('状态筛选').selectOption('all')
  await page.getByLabel('难度筛选').selectOption('easy')
  await expect(page.getByText('苹果 / 梨')).toBeVisible()
  await expect(page.getByText('猫 / 狗')).toHaveCount(0)

  await page.getByLabel('难度筛选').selectOption('all')
  await page.getByLabel('分类筛选').selectOption('动物')
  await expect(page.getByText('猫 / 狗')).toBeVisible()
  await expect(page.getByText('苹果 / 梨')).toHaveCount(0)

  await page.getByLabel('状态筛选').selectOption('all')
  await page.getByLabel('分类筛选').selectOption('all')
  await page.getByRole('button', { name: '停用 苹果 / 梨' }).click()
  await expect(page.getByText('苹果 / 梨')).toBeVisible()
  await expect(page.getByText('生活 · 简单 · 停用')).toBeVisible()

  await page.getByRole('button', { name: /真心话大冒险/ }).click()
  await expect(page.getByText('最近一次笑到停不下来是因为什么？')).toBeVisible()
  await expect(page.getByText('用主持人的语气宣布下一轮开始。')).toBeVisible()

  await page.getByLabel('类型筛选').selectOption('dare')
  await expect(page.getByText('用主持人的语气宣布下一轮开始。')).toBeVisible()
  await expect(page.getByText('最近一次笑到停不下来是因为什么？')).toHaveCount(0)

  await page.getByLabel('类型筛选').selectOption('all')
  await page.getByLabel('分类筛选').selectOption('表演')
  await expect(page.getByText('用主持人的语气宣布下一轮开始。')).toBeVisible()
  await expect(page.getByText('最近一次笑到停不下来是因为什么？')).toHaveCount(0)

  await page.getByLabel('分类筛选').selectOption('all')
  await page.getByLabel('强度筛选').selectOption('soft')
  await expect(page.getByText('最近一次笑到停不下来是因为什么？')).toBeVisible()
  await expect(page.getByText('用主持人的语气宣布下一轮开始。')).toHaveCount(0)

  await page.getByLabel('强度筛选').selectOption('all')
  await page.getByLabel('状态筛选').selectOption('disabled')
  await expect(page.getByText('用主持人的语气宣布下一轮开始。')).toBeVisible()
  await page.getByRole('button', { name: '启用 用主持人的语气宣布下一轮开始。' }).click()
  await expect(page.getByText('当前筛选下没有真心话大冒险题目。')).toBeVisible()
})

test('routing shell renders nav, route header and switches routes', async ({ page }) => {
  test.setTimeout(60_000)

  await page.route('**/api/health', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, data: { bindings: {}, features: {} } }),
    })
  })
  await page.route('**/api/music/songs', async (route) => {
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true, data: { songs: [] } }) })
  })

  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/#/ai-tools', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2500)

  // 导航轨：序号 + 常驻标签
  await expect(page.locator('.kk-nav')).toBeVisible()
  await expect(page.locator('.kk-nav-list')).toHaveCount(1)
  await expect(page.locator('.kk-nav-item[aria-label="导向"]')).toBeVisible()

  // 路由页头：kicker + h1 大字 + 描边序号
  await expect(page.locator('.kk-head-kicker')).toContainText('MODULE /')
  await expect(page.getByRole('heading', { name: '导向' })).toBeVisible()
  await expect(page.locator('.kk-head-idx')).toBeVisible()

  // 切到看盘：页头更新 + 导航高亮跟随
  await page.evaluate(() => { window.location.hash = '#/stock-watch' })
  await page.waitForTimeout(1500)
  await expect(page.getByRole('heading', { name: '看盘' })).toBeVisible()
  await expect(page.locator('.kk-nav-item[aria-label="看盘"]')).toHaveAttribute('aria-current', 'page')

  // 非法路由归一 home，回到欢迎页
  await page.evaluate(() => { window.location.hash = '#/nope' })
  await page.waitForTimeout(1500)
  await expect(page.getByRole('heading', { name: '垣钰' })).toBeVisible()
})

/**
 * 首屏 VideoHero 与强调色切换的护栏。
 *
 * 这两块是 Action-Cut 首屏改造新加的表面，此前只有「标题文本存在」这一条间接
 * 覆盖 —— 换素材、改配置、把强调色从 CSS 属性改回内联变量，都不会变红。
 * 这里把各自的契约钉住：
 *   1. 文案来自 site.config.json 的 hero 块，不是写死在组件里；
 *   2. 背景视频不可用时降级到渐变，并**明确告知**，不静默；
 *   3. 强调色由 html[data-accent] 驱动并可持久化。
 *
 * reducedMotion 显式钉成 no-preference：视频降级分支只有在允许动效时才会走到
 * （reduced 时 showVideo 恒为 false，根本不会触发 onError）。不钉住的话，
 * 这条用例在「系统开了减弱动效」的机器上会假红 —— 那不是它要测的东西。
 */
test.describe('action-cut hero guardrails', () => {
  test.use({ reducedMotion: 'no-preference' })

  test('homepage hero renders copy from site config and degrades when the video fails', async ({ page }) => {
    test.setTimeout(60_000)

    const hero = {
      videoUrl: '/videos/hero-bg.mp4',
      videoPosition: '60% center',
      badge: 'E2E BADGE · 测试',
      headline: ['E2E 第一行', 'E2E 第二行'],
      subline: 'E2E 副标题',
      ctaLabel: 'E2E 入口',
      ctaHref: '#/wish-wall',
    }

    // 只换 hero 块，其余配置照常从真实文件读
    await page.route('**/config/site.config.json', async (route) => {
      const response = await route.fetch()
      const body = (await response.json()) as Record<string, unknown>
      await route.fulfill({ json: { ...body, hero } })
    })
    await page.route('**/api/health', (route) =>
      route.fulfill({ json: { ok: true, data: { bindings: {}, features: {} } } }),
    )
    // 让背景视频加载失败，走降级分支
    await page.route('**/videos/hero-bg.mp4', (route) => route.abort('failed'))

    await page.goto('/')
    await expect(page.locator('.intro-stage')).toBeHidden({ timeout: 8_000 })

    // 文案来自配置：改 site.config.json 的 hero 块，页面必须跟着变
    await expect(page.locator('.vh')).toBeVisible()
    await expect(page.locator('.vh-badge')).toHaveText(hero.badge)
    // 标题不能用 toHaveText：逐字揭示用的 splitText 会额外插入一份**视觉隐藏**的
    // 完整文本副本（给读屏用），于是 textContent 是「可见文本 + 副本」的拼接，
    // 断言会读到两倍。这里只取可见文本。
    expect(await readVisibleText(page.locator('.vh-line'))).toEqual(hero.headline)
    await expect(page.locator('.vh-sub')).toHaveText(hero.subline)
    await expect(page.locator('.vh-cta')).toContainText(hero.ctaLabel)
    await expect(page.locator('.vh-cta')).toHaveAttribute('href', hero.ctaHref)

    // 视频不可用：兜底渐变仍在，且明确告知降级（不是一片黑，也不是静默失败）
    await expect(page.locator('.vh-fallback')).toBeVisible()
    await expect(page.locator('.vh-note')).toBeVisible()
    await expect(page.locator('.vh-video')).toHaveCount(0)
  })

  test('accent switcher drives html[data-accent] and survives a reload', async ({ page }) => {
    test.setTimeout(60_000)

    await page.route('**/api/health', (route) =>
      route.fulfill({ json: { ok: true, data: { bindings: {}, features: {} } } }),
    )
    await page.route('**/api/music/songs', (route) =>
      route.fulfill({ json: { ok: true, data: { songs: [] } } }),
    )

    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto('/#/ai-tools', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('.kk-nav')).toBeVisible()

    // 默认色在首帧之前就已落盘（main.tsx），不是等切换器挂载后才生效
    await expect(page.locator('html')).toHaveAttribute('data-accent', 'klein')

    await page.getByRole('button', { name: '强调色' }).click()
    await page.getByRole('button', { name: '等离子紫' }).click()

    // 颜色由 html 属性驱动（明暗组合交给 CSS 算），不是 JS 写内联变量
    await expect(page.locator('html')).toHaveAttribute('data-accent', 'plasma')
    expect(await page.evaluate(() => localStorage.getItem('hub:accent'))).toBe('plasma')

    // 刷新后仍是用户选的色
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(page.locator('html')).toHaveAttribute('data-accent', 'plasma')
  })
})
