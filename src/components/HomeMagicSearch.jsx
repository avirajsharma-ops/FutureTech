import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { DIRECTOR_PROFILES } from '../data/directors'
import { EXPERTISE_CARDS } from '../data/expertise'
import { TEAM } from '../data/team'
import './HomeMagicSearch.css'

const MAGIC_SEARCH_PROMPTS = [
  'Find me the best selling products in Europe',
  'Show me new Shopify stores in fashion',
  'Which ads are spending the most on pet products?',
  'Show me top earners in home decor',
  'How does the MW Futuretech Agent OS work?',
]

const AUTO_ADVANCE_MS = 3400
const WHEEL_STEP_PX = 42
const USER_PAUSE_MS = 4500
const MAX_QUERY_LENGTH = 200
const ANSWER_LINK_RE = /\[([^\]]+)\]\((\/[\w\-/]*)\)/g

const RESULT_ENTITIES = [
  ...TEAM.map((member) => ({
    group: 'Team',
    label: member.name,
    meta: member.role,
  })),
  ...Object.values(DIRECTOR_PROFILES).map((profile) => ({
    group: 'Leadership',
    label: profile.name,
    meta: profile.role,
  })),
  ...EXPERTISE_CARDS.map((card) => ({
    group: 'Expertise',
    label: card.title,
    meta: card.description,
  })),
]

function tokenizeAnswerText(text) {
  if (!text) return []
  const tokens = []
  ANSWER_LINK_RE.lastIndex = 0
  let lastIndex = 0
  let match
  while ((match = ANSWER_LINK_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', value: text.slice(lastIndex, match.index) })
    }
    tokens.push({ type: 'link', label: match[1], href: match[2] })
    lastIndex = ANSWER_LINK_RE.lastIndex
  }
  if (lastIndex < text.length) {
    tokens.push({ type: 'text', value: text.slice(lastIndex) })
  }
  return tokens
}

function findSentenceEndAfter(text, index) {
  const end = text.slice(index).search(/[.!?](?=\s|$)/)
  return end === -1 ? text.length : index + end + 1
}

function cleanAnswerSegment(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.!?])/g, '$1')
    .trim()
}

function splitListItem(text) {
  const parts = text.split(/\s+[—-]\s+/)
  if (parts.length < 2) return { label: text, meta: '' }
  return {
    label: parts[0].trim(),
    meta: parts.slice(1).join(' — ').trim(),
  }
}

function buildSemicolonListAnswer(answerText) {
  const sentenceRe = /[^.!?]+(?:;[^.!?]+)+[.!?]?/g
  let match
  while ((match = sentenceRe.exec(answerText)) !== null) {
    const sentence = match[0]
    if (!sentence.includes('—') && !/\s-\s/.test(sentence)) continue

    const terminal = sentence.match(/[.!?]\s*$/)?.[0] || ''
    const sentenceBody = terminal ? sentence.slice(0, -terminal.length) : sentence
    const colonIndex = sentenceBody.lastIndexOf(':')
    let lead = ''
    let listText = sentenceBody

    if (colonIndex !== -1) {
      lead = sentenceBody.slice(0, colonIndex + 1)
      listText = sentenceBody.slice(colonIndex + 1)
    } else {
      const leadMatch = sentenceBody.match(/^(.*?\b(?:includes?|are|offers?|covers?|features?|has|have|names?)\b)\s+/i)
      if (leadMatch) {
        lead = leadMatch[1]
        listText = sentenceBody.slice(leadMatch[0].length)
      }
    }

    const items = listText
      .split(/\s*;\s*/)
      .map((item) => cleanAnswerSegment(item))
      .filter((item) => item.length > 0 && item.length <= 160)
      .map(splitListItem)

    const detailedItems = items.filter((item) => item.label && item.meta)
    if (items.length < 2 || detailedItems.length < 2) continue

    return {
      type: 'structured-list',
      prefixTokens: tokenizeAnswerText(cleanAnswerSegment(`${answerText.slice(0, match.index)} ${lead}`)),
      suffixTokens: tokenizeAnswerText(cleanAnswerSegment(answerText.slice(match.index + sentence.length))),
      items,
    }
  }
  return null
}

function buildStructuredAnswer(answerText, isError) {
  const fallback = { type: 'text', tokens: tokenizeAnswerText(answerText) }
  if (!answerText || isError) return fallback

  const lowerAnswer = answerText.toLowerCase()
  const matches = RESULT_ENTITIES
    .map((entity) => {
      const index = lowerAnswer.indexOf(entity.label.toLowerCase())
      return index === -1 ? null : { ...entity, index, end: index + entity.label.length }
    })
    .filter(Boolean)

  const groupedMatches = matches.reduce((groups, match) => {
    const group = groups.get(match.group) || []
    group.push(match)
    groups.set(match.group, group)
    return groups
  }, new Map())

  const bestGroup = [...groupedMatches.values()]
    .filter((group) => group.length >= 2)
    .sort((a, b) => b.length - a.length || a[0].index - b[0].index)[0]

  if (!bestGroup) return buildSemicolonListAnswer(answerText) || fallback

  const items = [...bestGroup].sort((a, b) => a.index - b.index)
  const listStart = items[0].index
  const listEnd = findSentenceEndAfter(answerText, items[items.length - 1].end)
  const prefix = cleanAnswerSegment(answerText.slice(0, listStart))
  const suffix = cleanAnswerSegment(answerText.slice(listEnd))

  return {
    type: 'structured-list',
    prefixTokens: tokenizeAnswerText(prefix),
    suffixTokens: tokenizeAnswerText(suffix),
    items,
  }
}

export default function HomeMagicSearch() {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [mode, setMode] = useState('picker') // 'picker' | 'input'
  const [inputValue, setInputValue] = useState('')
  const [status, setStatus] = useState('idle') // 'idle' | 'loading' | 'success' | 'error'
  const [answer, setAnswer] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const stageRef = useRef(null)
  const audioCtxRef = useRef(null)
  const wheelAccumRef = useRef(0)
  const userActiveUntilRef = useRef(0)
  const inputRef = useRef(null)
  const answerRef = useRef(null)

  const promptCount = MAGIC_SEARCH_PROMPTS.length

  const playTick = useCallback(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (!Ctx) return
      if (!audioCtxRef.current) audioCtxRef.current = new Ctx()
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') ctx.resume()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = 1280
      const now = ctx.currentTime
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.07, now + 0.005)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06)
      osc.connect(gain).connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.08)
    } catch {
      /* audio unavailable — silent */
    }
  }, [])

  const advance = useCallback(
    (delta) => {
      const steps = Math.trunc(delta)
      if (!steps) return
      setAnswer('')
      setErrorMessage('')
      setStatus('idle')
      setSelectedIndex((prev) => {
        const next = ((prev + steps) % promptCount + promptCount) % promptCount
        return next
      })
      userActiveUntilRef.current = performance.now() + USER_PAUSE_MS
      playTick()
    },
    [playTick, promptCount],
  )

  // Auto-advance only when idle, picker mode, no answer/loading.
  useEffect(() => {
    if (mode !== 'picker') return undefined
    if (status === 'loading' || answer || errorMessage) return undefined
    if (typeof window === 'undefined') return undefined
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined

    const id = window.setInterval(() => {
      if (performance.now() < userActiveUntilRef.current) return
      setSelectedIndex((prev) => (prev + 1) % promptCount)
    }, AUTO_ADVANCE_MS)
    return () => window.clearInterval(id)
  }, [mode, status, answer, errorMessage, promptCount])

  // Wheel on the stage rotates prompts AND blocks page scroll.
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return undefined

    const onWheel = (event) => {
      if (mode !== 'picker') return
      // Swallow vertical scroll over the picker so the page doesn't move,
      // but advance the prompts proportionally to the wheel velocity so a
      // fast scroll blazes through several prompts at once.
      event.preventDefault()
      if (Math.abs(event.deltaY) < 1) return
      wheelAccumRef.current += event.deltaY
      const stepsRaw = wheelAccumRef.current / WHEEL_STEP_PX
      const steps = stepsRaw >= 0 ? Math.floor(stepsRaw) : Math.ceil(stepsRaw)
      if (steps === 0) return
      wheelAccumRef.current -= steps * WHEEL_STEP_PX
      advance(steps)
    }

    stage.addEventListener('wheel', onWheel, { passive: false })
    return () => stage.removeEventListener('wheel', onWheel)
  }, [mode, advance])

  // Touch swipe support (mobile) without locking page scroll outright.
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return undefined

    let startY = null

    const onTouchStart = (event) => {
      if (mode !== 'picker' || event.touches.length !== 1) return
      startY = event.touches[0].clientY
    }
    const onTouchMove = (event) => {
      if (startY === null) return
      const currentY = event.touches[0].clientY
      const delta = startY - currentY
      if (Math.abs(delta) > 40) {
        advance(delta > 0 ? 1 : -1)
        startY = currentY
      }
    }
    const onTouchEnd = () => {
      startY = null
    }

    stage.addEventListener('touchstart', onTouchStart, { passive: true })
    stage.addEventListener('touchmove', onTouchMove, { passive: true })
    stage.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      stage.removeEventListener('touchstart', onTouchStart)
      stage.removeEventListener('touchmove', onTouchMove)
      stage.removeEventListener('touchend', onTouchEnd)
    }
  }, [mode, advance])

  const handleToggleInput = () => {
    if (mode === 'picker') {
      setMode('input')
      setAnswer('')
      setErrorMessage('')
      setStatus('idle')
      setInputValue('')
      requestAnimationFrame(() => inputRef.current?.focus())
    } else {
      setMode('picker')
      setInputValue('')
      setErrorMessage('')
    }
    playTick()
  }

  const submitQuery = async () => {
    const rawQuery = mode === 'input' ? inputValue.trim() : MAGIC_SEARCH_PROMPTS[selectedIndex]
    if (!rawQuery) {
      setErrorMessage('Please type a question first.')
      setStatus('error')
      return
    }
    if (rawQuery.length > MAX_QUERY_LENGTH) {
      setErrorMessage(`Question is too long (max ${MAX_QUERY_LENGTH} characters).`)
      setStatus('error')
      return
    }

    setStatus('loading')
    setAnswer('')
    setErrorMessage('')

    try {
      const response = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: rawQuery }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok || !data?.answer) {
        setErrorMessage(data?.error || 'Something went wrong. Please try again.')
        setStatus('error')
        return
      }

      setAnswer(data.answer)
      setStatus('success')
    } catch {
      setErrorMessage('Network error. Please try again.')
      setStatus('error')
    }
  }

  const onInputKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submitQuery()
    } else if (event.key === 'Escape') {
      handleToggleInput()
    }
  }

  // Wrapped offsets so the wheel loops visually (no items disappear at the ends).
  const wheelItems = useMemo(() => {
    const half = Math.floor(promptCount / 2)
    return MAGIC_SEARCH_PROMPTS.map((prompt, index) => {
      let offset = index - selectedIndex
      if (offset > half) offset -= promptCount
      if (offset < -half) offset += promptCount
      return { prompt, offset }
    })
  }, [selectedIndex, promptCount])

  const isLoading = status === 'loading'
  const hasResult = Boolean(answer || errorMessage)
  const isJoined = hasResult

  // Ghost-text reveal: stagger each word in once the answer arrives.
  useEffect(() => {
    if (!hasResult) return
    const node = answerRef.current
    if (!node) return
    const targets = node.querySelectorAll('.home-magic-search__ghost-word')
    if (!targets.length) return
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(targets, { y: 0, autoAlpha: 1 })
      return
    }
    const ctx = gsap.context(() => {
      gsap.from(targets, {
        y: 10,
        autoAlpha: 0,
        duration: 0.55,
        ease: 'power4.out',
        stagger: 0.02,
      })
    }, node)
    return () => ctx.revert()
  }, [hasResult, answer, errorMessage])

  const answerText = errorMessage || answer
  const structuredAnswer = useMemo(
    () => buildStructuredAnswer(answerText, Boolean(errorMessage)),
    [answerText, errorMessage],
  )

  const renderGhostWords = (text, keyPrefix) =>
    text.split(/(\s+)/).map((piece, i) =>
      /\s+/.test(piece) ? (
        <span key={`${keyPrefix}-s-${i}`}>{piece}</span>
      ) : piece ? (
        <span key={`${keyPrefix}-w-${i}`} className="home-magic-search__ghost-word">
          {piece}
        </span>
      ) : null,
    )

  const renderTokens = (tokens, keyPrefix) => tokens.map((token, index) =>
    token.type === 'link' ? (
      <Link
        key={`${keyPrefix}-link-${index}`}
        to={token.href}
        className="home-magic-search__answer-link"
      >
        {renderGhostWords(token.label, `${keyPrefix}-link-${index}`)}
      </Link>
    ) : (
      <span key={`${keyPrefix}-text-${index}`}>
        {renderGhostWords(token.value, `${keyPrefix}-text-${index}`)}
      </span>
    ),
  )

  return (
    <section className="home-magic-search" aria-labelledby="home-magic-search-title">
      <motion.div
        className="home-magic-search__inner"
        initial={{ opacity: 0, y: 34 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.45 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="home-magic-search__copy">
          <h2 id="home-magic-search-title">NEW: Magic AI Search</h2>
          <p>
            Find your next profitable product by exploring our vast database with millions of products
            and ads, using our smart search.
          </p>
          <a className="home-magic-search__link" href="/news-events" aria-label="Learn more about Magic AI Search">
            <span>Learn More</span>
          </a>
        </div>

        <motion.div
          className="home-magic-search__component"
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ delay: 0.14, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            ref={stageRef}
            className={`home-magic-search__prompt-stage${mode === 'input' ? ' is-input-mode' : ''}`}
          >
            {mode === 'picker' && (
              <ul className="home-magic-search__prompt-stack" aria-hidden="true">
                {wheelItems.map(({ prompt, offset }) => {
                  const distance = Math.abs(offset)
                  const opacity = offset === 0 ? 0 : Math.max(0.08, 1 - distance * 0.32)
                  const scale = Math.max(0.82, 1 - distance * 0.06)
                  return (
                    <li
                      key={prompt}
                      className={`home-magic-search__prompt-item${offset === 0 ? ' is-current' : ''}`}
                      style={{
                        transform: `translate(-50%, calc(-50% + var(--magic-row-height) * ${offset})) scale(${scale})`,
                        opacity,
                      }}
                    >
                      {prompt}
                    </li>
                  )
                })}
              </ul>
            )}

            <div
              className={`home-magic-search__pod${isJoined ? ' is-joined' : ''}${isLoading ? ' is-loading' : ''}${hasResult ? ' has-result' : ''}${errorMessage ? ' is-error' : ''}`}
            >
              <div className="home-magic-search__search-wrap">
                <div className="home-magic-search__search-inner">
                  <button
                    className={`home-magic-search__icon-button home-magic-search__icon-button--add${mode === 'input' ? ' is-active' : ''}`}
                    type="button"
                    aria-label={mode === 'input' ? 'Close custom search' : 'Open custom search'}
                    aria-pressed={mode === 'input'}
                    onClick={handleToggleInput}
                  >
                    <span aria-hidden="true" />
                  </button>

                  <div
                    className={`home-magic-search__active-prompt${mode === 'input' ? ' is-input' : ' is-picker'}`}
                  >
                    {mode === 'input' ? (
                      <>
                        <input
                          ref={inputRef}
                          type="text"
                          className="home-magic-search__input"
                          placeholder="Ask anything about MW Futuretech…"
                          value={inputValue}
                          onChange={(event) => setInputValue(event.target.value.slice(0, MAX_QUERY_LENGTH))}
                          onKeyDown={onInputKeyDown}
                          maxLength={MAX_QUERY_LENGTH}
                          aria-label="Custom AI search"
                        />
                        <span
                          className={`home-magic-search__char-count${inputValue.length >= MAX_QUERY_LENGTH ? ' is-max' : ''}`}
                          aria-live="polite"
                        >
                          {inputValue.length}/{MAX_QUERY_LENGTH}
                        </span>
                      </>
                    ) : (
                      <span key={selectedIndex} className="home-magic-search__active-text">
                        {MAGIC_SEARCH_PROMPTS[selectedIndex]}
                      </span>
                    )}
                  </div>

                  <button
                    className="home-magic-search__icon-button home-magic-search__icon-button--send"
                    type="button"
                    aria-label="Run search"
                    onClick={submitQuery}
                    disabled={isLoading}
                  >
                    <span aria-hidden="true">
                      {isLoading ? (
                        <span className="home-magic-search__spinner" />
                      ) : (
                        <svg viewBox="0 0 20 20" focusable="false">
                          <path d="M10 15V5M10 5L5.8 9.2M10 5l4.2 4.2" />
                        </svg>
                      )}
                    </span>
                  </button>
                </div>
              </div>

              {hasResult && (
                <div
                  ref={answerRef}
                  className="home-magic-search__answer"
                  role="status"
                  aria-live="polite"
                >
                  {structuredAnswer.type === 'structured-list' ? (
                    <>
                      {structuredAnswer.prefixTokens.length > 0 && (
                        <p className="home-magic-search__answer-copy">
                          {renderTokens(structuredAnswer.prefixTokens, 'prefix')}
                        </p>
                      )}
                      <ul className="home-magic-search__answer-pills" aria-label="Search result items">
                        {structuredAnswer.items.map((item) => (
                          <li className="home-magic-search__answer-pill" key={item.label}>
                            <span className="home-magic-search__answer-pill-label">
                              {renderGhostWords(item.label, `pill-label-${item.label}`)}
                            </span>
                            <span className="home-magic-search__answer-pill-meta">
                              {renderGhostWords(item.meta, `pill-meta-${item.label}`)}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {structuredAnswer.suffixTokens.length > 0 && (
                        <p className="home-magic-search__answer-copy">
                          {renderTokens(structuredAnswer.suffixTokens, 'suffix')}
                        </p>
                      )}
                    </>
                  ) : (
                    renderTokens(structuredAnswer.tokens, 'answer')
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
