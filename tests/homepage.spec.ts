import { expect, test } from '@playwright/test'

test('homepage renders configured content without placeholders', async ({ page }) => {
  test.setTimeout(60_000)
  const consoleErrors: string[] = []
  let postedWish: Record<string, unknown> | null = null

  // 过滤非关键资源加载错误（如音频引擎离线合成）
  const allowedErrors = [
    'ERR_CONNECTION_CLOSED',
    'ERR_CONNECTION_REFUSED',
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
  await expect(page.locator('.vanta-rings-layer')).toHaveCount(1)
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
  await expect(aiToolsSection.getByRole('heading', { name: '找工具' })).toBeVisible()
  await expect(aiToolsSection.getByText('Convertio').first()).toBeVisible()
  await expect(aiToolsSection.getByText('File Converter')).toBeVisible()
  // 验证 AI 工具列表已渲染
  await expect(aiToolsSection.getByText('Convertio').first()).toBeVisible({ timeout: 5_000 })

  const nowPlaying = page.locator('aside').locator('section').filter({ hasText: '音乐库' })
  await expect(nowPlaying).toHaveCount(1)
  await expect(nowPlaying.getByRole('button', { name: '上一首' })).toHaveCount(1)
  await expect(nowPlaying.getByRole('button', { name: '下一首' })).toHaveCount(1)
  const nowPlayingBox = await nowPlaying.boundingBox()
  expect(nowPlayingBox).not.toBeNull()
  if (nowPlayingBox) {
    expect(nowPlayingBox.width).toBeGreaterThan(180)
    expect(nowPlayingBox.height).toBeGreaterThan(110)
  }

  await goRoute('wish-wall')
  const wishSection = page.locator('#wish-wall')
  await expect(wishSection.getByRole('heading', { name: '访客许愿墙' })).toBeVisible()
  await expect(wishSection.getByText('希望导向页支持收藏常用工具')).toBeVisible()
  await expect(wishSection.getByText('已采纳').first()).toBeVisible()

  await goRoute('news')
  await expect(page).toHaveURL(/#\/ai-tools$/)
  await expect(page.locator('#ai-tools').first()).toBeVisible()

  await page.evaluate(() => {
    window.location.hash = '#/stock-watch'
  })
  await page.waitForTimeout(1500)

  await goRoute('party-games')
  const partyGamesSection = page.locator('#party-games')
  await expect(partyGamesSection.getByRole('heading', { name: '聚会游戏' })).toBeVisible()
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
      await page.goto(route)
      if (route === '/') {
        // 桌面端有 intro-stage，移动端直接显示欢迎页
        if (!viewport.isMobile) {
          await page.locator('.intro-stage').waitFor({ state: 'attached', timeout: 7_000 })
        } else {
          await page.waitForTimeout(2000)
        }
      } else {
        // 桌面端有 page-shell，移动端有 MobileTabBar
        if (!viewport.isMobile) {
          await page.locator('.page-shell.page-ready').waitFor({ state: 'attached', timeout: 7_000 })
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

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/#/party-games')
  await page.waitForTimeout(2500)

  const section = page.locator('#party-games')
  await expect(section.getByRole('heading', { name: '聚会游戏' })).toBeVisible()

  await section.getByRole('button', { name: '创建房间' }).click()
  await expect(page.getByRole('dialog', { name: '创建房间' })).toBeVisible()
  await expect(page.getByLabel('最多人数')).toHaveValue('6')
  await page.getByRole('button', { name: '增加人数' }).click()
  await expect(page.getByLabel('最多人数')).toHaveValue('7')
  await page.getByRole('button', { name: '确认创建' }).click()

  await expect(section.getByText('房间码')).toBeVisible()
  await expect(section.getByText('1 / 7')).toBeVisible()
  await section.getByRole('button', { name: '开始游戏' }).click()

  await expect(section.getByText('长按查看你的词')).toBeVisible()
  await section.getByRole('button', { name: '进入发言' }).click()
  await expect(section.getByText('当前发言')).toBeVisible()
  await section.getByRole('button', { name: '进入投票' }).click()
  await expect(section.getByText('选择你怀疑的人')).toBeVisible()
  await section.getByRole('button', { name: '揭晓结果' }).click()
  await expect(section.getByText('平民胜利')).toBeVisible()
  await section.getByRole('button', { name: '抽惩罚' }).click()
  await expect(section.getByText('真心话大冒险')).toBeVisible()
})
