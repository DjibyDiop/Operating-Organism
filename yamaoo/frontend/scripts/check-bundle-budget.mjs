import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const assetsDir = join(process.cwd(), 'dist', 'assets')
const previousReportPath = join(process.cwd(), '..', '..', 'artifacts', 'yamaoo-frontend-bundle-report.json')
const selectedProfile = process.argv[2] === 'release' ? 'release' : 'standard'

const budgetProfiles = {
  standard: {
    totalLimitKb: 620,
    maxTotalGrowthPct: 6,
    maxChunkGrowthPct: 20,
    budgets: [
      { match: /^index-.*\.js$/, maxKb: 30, label: 'entry index' },
      { match: /^App-.*\.js$/, maxKb: 35, label: 'app screen' },
      { match: /^vendor-react-.*\.js$/, maxKb: 220, label: 'vendor react' },
      { match: /^vendor-router-.*\.js$/, maxKb: 55, label: 'vendor router' },
      { match: /^vendor-motion-.*\.js$/, maxKb: 45, label: 'vendor motion' },
      { match: /^vendor-icons-.*\.js$/, maxKb: 35, label: 'vendor icons' },
      { match: /^vendor-(?!react-|router-|motion-|icons-).*\.js$/, maxKb: 130, label: 'vendor shared' },
    ],
  },
  release: {
    totalLimitKb: 520,
    maxTotalGrowthPct: 3,
    maxChunkGrowthPct: 10,
    budgets: [
      { match: /^index-.*\.js$/, maxKb: 22, label: 'entry index' },
      { match: /^App-.*\.js$/, maxKb: 30, label: 'app screen' },
      { match: /^vendor-react-.*\.js$/, maxKb: 200, label: 'vendor react' },
      { match: /^vendor-router-.*\.js$/, maxKb: 45, label: 'vendor router' },
      { match: /^vendor-motion-.*\.js$/, maxKb: 38, label: 'vendor motion' },
      { match: /^vendor-icons-.*\.js$/, maxKb: 28, label: 'vendor icons' },
      { match: /^vendor-(?!react-|router-|motion-|icons-).*\.js$/, maxKb: 105, label: 'vendor shared' },
    ],
  },
}

function toKb(bytes) {
  return bytes / 1024
}

function findFile(files, regex) {
  return files.find((name) => regex.test(name))
}

function getFileKb(filePath) {
  return toKb(statSync(filePath).size)
}

function tryReadPreviousReport() {
  if (!existsSync(previousReportPath)) return null

  try {
    const raw = readFileSync(previousReportPath, 'utf8')
    const parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.javascript) || !parsed.totals) return null
    return parsed
  } catch {
    return null
  }
}

function findAssetByPattern(assets, regex) {
  return assets.find((asset) => regex.test(asset.file))
}

function percentGrowth(previous, current) {
  if (previous <= 0) return 0
  return ((current - previous) / previous) * 100
}

try {
  const files = readdirSync(assetsDir)
  const failures = []
  const warnings = []
  const profile = budgetProfiles[selectedProfile]

  for (const budget of profile.budgets) {
    const file = findFile(files, budget.match)
    if (!file) {
      failures.push(`${budget.label}: missing file for pattern ${budget.match}`)
      continue
    }

    const sizeKb = getFileKb(join(assetsDir, file))
    if (sizeKb > budget.maxKb) {
      failures.push(`${budget.label}: ${sizeKb.toFixed(2)}KB exceeds ${budget.maxKb}KB (${file})`)
    }
  }

  const totalJsKb = files
    .filter((name) => name.endsWith('.js'))
    .map((name) => getFileKb(join(assetsDir, name)))
    .reduce((sum, size) => sum + size, 0)

  const totalLimitKb = profile.totalLimitKb
  if (totalJsKb > totalLimitKb) {
    failures.push(`total js: ${totalJsKb.toFixed(2)}KB exceeds ${totalLimitKb}KB`)
  }

  const previousReport = tryReadPreviousReport()
  if (previousReport) {
    const totalGrowth = percentGrowth(previousReport.totals.javascriptKb, totalJsKb)
    if (totalGrowth > profile.maxTotalGrowthPct) {
      failures.push(
        `total js growth: +${totalGrowth.toFixed(2)}% exceeds +${profile.maxTotalGrowthPct}% (prev ${Number(previousReport.totals.javascriptKb).toFixed(2)}KB -> now ${totalJsKb.toFixed(2)}KB)`,
      )
    }

    for (const budget of profile.budgets) {
      const currentFile = findFile(files, budget.match)
      const currentSize = currentFile ? getFileKb(join(assetsDir, currentFile)) : null
      const previousAsset = findAssetByPattern(previousReport.javascript, budget.match)

      if (currentSize === null || !previousAsset) continue

      const growth = percentGrowth(Number(previousAsset.sizeKb), currentSize)
      if (growth > profile.maxChunkGrowthPct) {
        failures.push(
          `${budget.label} growth: +${growth.toFixed(2)}% exceeds +${profile.maxChunkGrowthPct}% (prev ${Number(previousAsset.sizeKb).toFixed(2)}KB -> now ${currentSize.toFixed(2)}KB)`,
        )
      }
    }
  } else {
    warnings.push('previous bundle report not found or unreadable; growth checks skipped')
  }

  if (failures.length > 0) {
    console.error(`Bundle budget check failed (${selectedProfile}):`)
    for (const failure of failures) console.error(`- ${failure}`)
    process.exit(1)
  }

  for (const warning of warnings) {
    console.warn(`Bundle budget warning (${selectedProfile}): ${warning}`)
  }

  console.log(`Bundle budget check passed (${selectedProfile}, total js ${totalJsKb.toFixed(2)}KB)`)
} catch (error) {
  console.error('Bundle budget check could not run. Build artifacts may be missing.')
  if (error instanceof Error) console.error(error.message)
  process.exit(1)
}
