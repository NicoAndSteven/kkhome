import { expect, test } from '@playwright/test'

test('homepage renders configured content without placeholders', async ({ page }) => {
  const consoleErrors: string[] = []
  let postedWish: Record<string, unknown> | null = null

  // 过滤非关键资源加载错误（如音频引擎离线合成）
  const allowedErrors = ['ERR_CONNECTION_CLOSED', 'ERR_CONNECTION_REFUSED', 'ERR_NETWORK_ACCESS_DENIED', 'THREE.BufferGeometry']

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
  await expect(page.locator('.intro-mark')).toHaveText('可')
  await expect(page.locator('.intro-stage')).toBeHidden({ timeout: 5_000 })

  await expect(page).toHaveTitle('垣钰 | Personal Hub')
  await expect(page.getByRole('heading', { name: '垣钰' })).toBeVisible()
  await expect.poll(() => page.evaluate(() => window.__hubAvailableRoutes)).toEqual([
    'home',
    'ai-tools',
    'wish-wall',
    'cloudflare-lab',
    'news',
    'stock-watch',
    'food',
    'ambient-music',
    'gallery',
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

  // 进入博客后验证
  await page.evaluate(() => { window.location.hash = '#/ai-tools' })
  await expect(page.locator('.blog-sidebar')).toBeVisible({ timeout: 3_000 })
  const mainContent = page.locator('main').filter({ hasText: '工具导航' })
  await expect(mainContent.first()).toBeVisible({ timeout: 3_000 })

  const goRoute = async (route: string) => {
    await page.evaluate((nextRoute) => {
      window.location.hash = `#/${nextRoute}`
    }, route)
    await expect(page).toHaveURL(new RegExp(`#/${route}`))
    await expect.poll(() => page.evaluate(() => (
      document.documentElement.scrollHeight <= window.innerHeight + 1
    ))).toBe(true)
  }

  await goRoute('ai-tools')
  const aiToolsSection = page.locator('#ai-tools')
  await expect(aiToolsSection.getByRole('heading', { name: '工具导航' })).toBeVisible()
  await expect(aiToolsSection.getByText('Convertio').first()).toBeVisible()
  await expect(aiToolsSection.getByText('File Converter')).toBeVisible()
  await aiToolsSection.getByRole('button', { name: '转换工具', exact: true }).click()
  const resultMetrics = await aiToolsSection.locator('.ai-results-scroll').evaluate((element) => ({
    height: element.clientHeight,
    cards: element.querySelectorAll('.surface-item').length,
  }))
  expect(resultMetrics.height).toBeGreaterThan(260)
  expect(resultMetrics.cards).toBeGreaterThan(3)
  await expect(aiToolsSection.locator('.ai-results-scroll .surface-item').first()).not.toContainText('30aitool')
  await aiToolsSection.getByRole('button', { name: '文件转换器', exact: true }).click()
  await expect(aiToolsSection.getByText('Convertio').first()).toBeVisible()
  await expect(aiToolsSection.getByText('File Converter')).toBeVisible()
  await aiToolsSection.getByRole('searchbox', { name: '搜索目标工具' }).fill('图片压缩')
  await expect(aiToolsSection.getByText(/TinyPNG|Tinypng/)).toBeVisible()
  await expect(aiToolsSection.getByText('File Converter')).toHaveCount(0)

  await goRoute('wish-wall')
  const wishSection = page.locator('#wish-wall')
  await expect(wishSection.getByRole('heading', { name: '访客许愿墙' })).toBeVisible()
  await expect(wishSection.getByText('希望导向页支持收藏常用工具')).toBeVisible()
  await expect(wishSection.getByText('已采纳').first()).toBeVisible()
  await expect(wishSection.getByText('进入计划').first()).toBeVisible()
  await wishSection.getByPlaceholder('例如：希望导向页支持收藏常用工具').fill('希望增加愿望优先级')
  await wishSection.getByPlaceholder('补充使用场景或你希望它解决的问题').fill('想知道哪些需求更值得先做。')
  await wishSection.getByPlaceholder('可匿名').fill('测试访客')
  await wishSection.getByRole('button', { name: '功能', exact: true }).click()
  await wishSection.getByRole('button', { name: '许愿', exact: true }).click()
  await expect(wishSection.getByText('愿望已写入墙面')).toBeVisible()
  await expect(wishSection.getByText('希望增加愿望优先级')).toBeVisible()

  await goRoute('cloudflare-lab')
  const labSection = page.locator('#cloudflare-lab')
  await expect(labSection.getByRole('heading', { name: 'Cloudflare Lab' })).toBeVisible()
  await expect(labSection.getByText('WISHES_DB')).toBeVisible()
  await expect(labSection.getByText('bound')).toBeVisible()
  await expect(labSection.locator('span').filter({ hasText: '语义搜索' })).toBeVisible()
  await expect(labSection.locator('span').filter({ hasText: '网页炼金室' })).toBeVisible()

  await page.locator('header').getByRole('button', { name: '打开联系抽屉' }).click()
  await expect(page.getByRole('dialog', { name: '联系我' })).toBeVisible()
  await page.getByRole('button', { name: '关闭', exact: true }).click()
  await expect(page.getByRole('dialog', { name: '联系我' })).toBeHidden()

  expect(consoleErrors).toEqual([])
})

test('routes stay within desktop and mobile viewports', async ({ browser }) => {
  test.setTimeout(70_000)

  const routes = ['/', '/#/ai-tools', '/#/wish-wall', '/#/cloudflare-lab', '/#/news', '/#/stock-watch', '/#/food']
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
        await page.locator('.intro-stage').waitFor({ state: 'attached', timeout: 7_000 })
      } else {
        await page.locator('.blog-sidebar').waitFor({ state: 'attached', timeout: 7_000 })
      }

      await expect.poll(() => page.evaluate(() => ({
        heightFits: document.documentElement.scrollHeight <= window.innerHeight + 2,
        widthFits: document.documentElement.scrollWidth <= window.innerWidth + 2,
        overflowingControls: [...document.querySelectorAll('button, a, input, textarea, pre')]
          .filter((element) => element.scrollWidth > element.clientWidth + 8)
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
