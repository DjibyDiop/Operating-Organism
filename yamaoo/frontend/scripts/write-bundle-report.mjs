import { mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const root = process.cwd()
const assetsDir = join(root, 'dist', 'assets')
const frontendReportDir = join(root, 'artifacts')
const repoReportDir = join(root, '..', '..', 'artifacts')

const reportTargets = [
  {
    markdown: join(frontendReportDir, 'bundle-report.md'),
    json: join(frontendReportDir, 'bundle-report.json'),
  },
  {
    markdown: join(repoReportDir, 'yamaoo-frontend-bundle-report.md'),
    json: join(repoReportDir, 'yamaoo-frontend-bundle-report.json'),
  },
]

function toKb(bytes) {
  return bytes / 1024
}

function formatKb(bytes) {
  return `${toKb(bytes).toFixed(2)} KB`
}

function listAssetStats() {
  return readdirSync(assetsDir)
    .map((name) => {
      const size = statSync(join(assetsDir, name)).size
      return { name, size }
    })
    .sort((a, b) => b.size - a.size)
}

function nowIso() {
  return new Date().toISOString()
}

function ensureDir(path) {
  mkdirSync(path, { recursive: true })
}

try {
  const assets = listAssetStats()
  const jsAssets = assets.filter((asset) => asset.name.endsWith('.js'))
  const cssAssets = assets.filter((asset) => asset.name.endsWith('.css'))

  const totalJsBytes = jsAssets.reduce((sum, asset) => sum + asset.size, 0)
  const totalCssBytes = cssAssets.reduce((sum, asset) => sum + asset.size, 0)
  const generatedAt = nowIso()

  const lines = [
    '# Frontend Bundle Report',
    '',
    `Generated: ${generatedAt}`,
    '',
    '## Summary',
    '',
    `- JavaScript total: ${formatKb(totalJsBytes)}`,
    `- CSS total: ${formatKb(totalCssBytes)}`,
    `- Asset files: ${assets.length}`,
    '',
    '## Top JavaScript Assets',
    '',
    '| File | Size |',
    '| --- | ---: |',
    ...jsAssets.slice(0, 15).map((asset) => `| ${asset.name} | ${formatKb(asset.size)} |`),
    '',
    '## Top CSS Assets',
    '',
    '| File | Size |',
    '| --- | ---: |',
    ...cssAssets.slice(0, 10).map((asset) => `| ${asset.name} | ${formatKb(asset.size)} |`),
    '',
  ]

  const jsonPayload = {
    generatedAt,
    totals: {
      javascriptKb: Number(toKb(totalJsBytes).toFixed(2)),
      cssKb: Number(toKb(totalCssBytes).toFixed(2)),
      assetFiles: assets.length,
    },
    javascript: jsAssets.map((asset) => ({
      file: asset.name,
      sizeKb: Number(toKb(asset.size).toFixed(2)),
    })),
    css: cssAssets.map((asset) => ({
      file: asset.name,
      sizeKb: Number(toKb(asset.size).toFixed(2)),
    })),
  }

  for (const target of reportTargets) {
    ensureDir(dirname(target.markdown))
    writeFileSync(target.markdown, lines.join('\n'), 'utf8')
    writeFileSync(target.json, `${JSON.stringify(jsonPayload, null, 2)}\n`, 'utf8')
  }

  console.log('Bundle reports written:')
  for (const target of reportTargets) {
    console.log(`- ${target.markdown}`)
    console.log(`- ${target.json}`)
  }
} catch (error) {
  console.error('Unable to generate bundle report. Ensure a build was run first.')
  if (error instanceof Error) console.error(error.message)
  process.exit(1)
}
