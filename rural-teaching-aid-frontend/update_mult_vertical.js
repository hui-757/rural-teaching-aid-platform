import { createClient } from '@supabase/supabase-js'

const url = 'https://kcavasttvezmhaixuvmd.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjYXZhc3R0dmV6bWhhaXh1dm1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1Nzg3NzAsImV4cCI6MjA5OTE1NDc3MH0.ziCgpTC852Ins1jbZuq62lpuLEVyuhTl6VP7sURNnOA'

const supabase = createClient(url, key)

function generateVertical(a, b) {
  const aStr = String(a)
  const bStr = String(b)
  const result = a * b
  const resultStr = String(result)

  const width = Math.max(aStr.length, bStr.length, resultStr.length) + 2

  const lines = []

  lines.push([{ type: 'text', text: ' '.repeat(width - aStr.length) + aStr }])
  lines.push([{ type: 'text', text: '×' + ' '.repeat(width - bStr.length - 1) + bStr }])
  lines.push([{ type: 'text', text: '-'.repeat(width) }])

  const bDigits = bStr.split('').reverse()
  for (let i = 0; i < bDigits.length; i++) {
    const digit = parseInt(bDigits[i])
    const partial = a * digit
    const partialStr = String(partial)
    const pad = ' '.repeat(Math.max(0, width - partialStr.length - i))

    const line = [{ type: 'text', text: pad }]
    for (const d of partialStr) {
      line.push({ type: 'blank', answer: d })
    }
    lines.push(line)
  }

  lines.push([{ type: 'text', text: '-'.repeat(width) }])

  const resultPad = ' '.repeat(Math.max(0, width - resultStr.length))
  const resultLine = [{ type: 'text', text: resultPad }]
  for (const d of resultStr) {
    resultLine.push({ type: 'blank', answer: d })
  }
  lines.push(resultLine)

  return { type: 'multiplication', lines }
}

async function main() {
  const { data, error } = await supabase
    .from('calc_question')
    .select('id, content, answer, category')
    .eq('type', 'vertical')
    .not('category', 'in', '("口算除法","笔算除法竖式")')

  if (error) {
    console.error(error)
    process.exit(1)
  }

  let updated = 0
  for (const row of data) {
    const match = row.content.match(/(\d+)\s*×\s*(\d+)/)
    if (!match) {
      console.log('Skip:', row.content)
      continue
    }
    const a = parseInt(match[1])
    const b = parseInt(match[2])
    const raw = generateVertical(a, b)
    const correctAnswer = String(a * b)

    const { error: upError } = await supabase
      .from('calc_question')
      .update({ raw_content: raw, answer: correctAnswer })
      .eq('id', row.id)

    if (upError) {
      console.error('Update error id=', row.id, upError)
    } else {
      updated++
    }
  }

  console.log(`Updated ${updated} / ${data.length} rows`)
}

main()
