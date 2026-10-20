import assert from 'node:assert/strict'
import test from 'node:test'
import {
  scoreTool,
  rankTools,
  getHostname,
  fieldIncludes,
  listIncludes,
} from '../src/plugins/ai-navigator/search.ts'

const makeTool = (overrides = {}) => ({
  id: 'test-tool',
  title: 'TestTool',
  category: 'convert',
  url: 'https://testtool.example.com/',
  description: 'A test tool for unit testing.',
  ...overrides,
})

// ── getHostname ──

test('getHostname extracts hostname and strips www', () => {
  assert.equal(getHostname('https://www.example.com/path'), 'example.com')
})

test('getHostname handles URLs without www', () => {
  assert.equal(getHostname('https://convertio.co/zh/'), 'convertio.co')
})

test('getHostname returns empty string for invalid URL', () => {
  assert.equal(getHostname('not-a-url'), '')
})

// ── fieldIncludes ──

test('fieldIncludes returns true for substring match', () => {
  assert.equal(fieldIncludes('PDF Converter', 'pdf'), true)
})

test('fieldIncludes returns false for no match', () => {
  assert.equal(fieldIncludes('Image Editor', 'pdf'), false)
})

test('fieldIncludes returns false for undefined', () => {
  assert.equal(fieldIncludes(undefined, 'pdf'), false)
})

// ── listIncludes ──

test('listIncludes returns true if any item matches', () => {
  assert.equal(listIncludes(['PDF', 'Word'], 'pdf'), true)
})

test('listIncludes returns false for empty array', () => {
  assert.equal(listIncludes([], 'pdf'), false)
})

test('listIncludes returns false for undefined', () => {
  assert.equal(listIncludes(undefined, 'pdf'), false)
})

// ── scoreTool ──

test('scoreTool returns 0 for empty query', () => {
  assert.equal(scoreTool(makeTool(), ''), 0)
})

test('scoreTool returns 0 for no match', () => {
  assert.equal(scoreTool(makeTool({ title: 'Convertio' }), 'docker'), 0)
})

test('scoreTool gives highest score for exact title match', () => {
  const tool = makeTool({ title: 'Convertio' })
  assert.equal(scoreTool(tool, 'convertio'), 100)
})

test('scoreTool gives high score for title prefix match', () => {
  const tool = makeTool({ title: 'Convertio Pro' })
  assert.equal(scoreTool(tool, 'convertio'), 80)
})

test('scoreTool gives medium score for title includes match', () => {
  const tool = makeTool({ title: 'My Convertio Tool' })
  assert.equal(scoreTool(tool, 'convertio'), 55)
})

test('scoreTool adds alias bonus on top of title match', () => {
  const tool = makeTool({
    title: 'Convertio',
    aliases: ['convertio pro', '格式转换'],
  })
  // exact title (100) + alias match (45) = 145
  assert.equal(scoreTool(tool, 'convertio'), 145)
})

test('scoreTool adds tag bonus', () => {
  const tool = makeTool({
    title: 'Convertio',
    tags: ['convertio tool', 'PDF'],
  })
  // exact title (100) + tag match (35) = 135
  assert.equal(scoreTool(tool, 'convertio'), 135)
})

test('scoreTool adds description bonus', () => {
  const tool = makeTool({
    title: 'Convertio',
    description: 'A convertio online tool for file conversion.',
  })
  // exact title (100) + description match (18) = 118
  assert.equal(scoreTool(tool, 'convertio'), 118)
})

test('scoreTool adds featured bonus only when score > 0', () => {
  const featured = makeTool({ title: 'Unrelated', featured: true })
  // no match → featured bonus doesn't apply → 0
  assert.equal(scoreTool(featured, 'docker'), 0)

  const featuredMatch = makeTool({ title: 'Docker', featured: true })
  // exact title (100) + featured (4) = 104
  assert.equal(scoreTool(featuredMatch, 'docker'), 104)
})

test('scoreTool does not add featured bonus when featured is false', () => {
  const tool = makeTool({ title: 'Convertio', featured: false })
  assert.equal(scoreTool(tool, 'convertio'), 100)
})

test('scoreTool matches via alias only', () => {
  const tool = makeTool({
    title: 'Totally Different Name',
    aliases: ['文件转换器'],
  })
  // alias match only (45)
  assert.equal(scoreTool(tool, '文件转换'), 45)
})

test('scoreTool expects pre-lowercased query (matching is case-insensitive via caller)', () => {
  const tool = makeTool({ title: 'Convertio' })
  // scoreTool expects query already lowercased (caller does .toLowerCase())
  assert.equal(scoreTool(tool, 'convertio'), 100)
  // uppercase query won't match anything because scoreTool doesn't lowercase the query itself
  assert.equal(scoreTool(tool, 'CONVERTIO'), 0)
})

// ── rankTools ──

test('rankTools returns original order for empty query', () => {
  const tools = [
    makeTool({ id: 'a', title: 'Alpha' }),
    makeTool({ id: 'b', title: 'Beta' }),
  ]
  const result = rankTools(tools, '')
  assert.equal(result.length, 2)
  assert.equal(result[0].id, 'a')
  assert.equal(result[1].id, 'b')
})

test('rankTools returns original order for whitespace-only query', () => {
  const tools = [
    makeTool({ id: 'a', title: 'Alpha' }),
    makeTool({ id: 'b', title: 'Beta' }),
  ]
  const result = rankTools(tools, '   ')
  assert.equal(result.length, 2)
})

test('rankTools filters out non-matching tools', () => {
  const tools = [
    makeTool({ id: 'a', title: 'Convertio', category: 'convert' }),
    makeTool({ id: 'b', title: 'Docker', category: 'devops' }),
  ]
  const result = rankTools(tools, 'convert')
  assert.equal(result.length, 1)
  assert.equal(result[0].id, 'a')
})

test('rankTools sorts by score descending', () => {
  const tools = [
    makeTool({ id: 'a', title: 'Docker' }),
    makeTool({ id: 'b', title: 'Docker Hub' }),
    makeTool({ id: 'c', title: 'Unrelated' }),
  ]
  const result = rankTools(tools, 'docker')
  // exact match 'docker' scores 100, prefix match 'docker hub' scores 80
  assert.equal(result[0].id, 'a')
  assert.equal(result[1].id, 'b')
})

test('rankTools preserves original order for equal scores', () => {
  const tools = [
    makeTool({ id: 'first', title: 'Cat', aliases: ['cat'] }),
    makeTool({ id: 'second', title: 'Cat', aliases: ['cat'] }),
  ]
  const result = rankTools(tools, 'cat')
  // both score 145 (100 title + 45 alias), first stays first
  assert.equal(result[0].id, 'first')
  assert.equal(result[1].id, 'second')
})