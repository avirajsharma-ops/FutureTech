import { motion } from 'motion/react'
import './HomeMagicSearch.css'

const MAGIC_SEARCH_PROMPTS = [
  'Find me the best selling products in Europe...',
  'Show me new Shopify stores in fashion',
  'Find me the best selling products in Europe',
  'Which ads are spending the most on pet products?',
  'Show me top earners in home decor',
]

const ROLLING_PROMPTS = [...MAGIC_SEARCH_PROMPTS, ...MAGIC_SEARCH_PROMPTS]

export default function HomeMagicSearch() {
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
          <p>Find your next profitable product by exploring our vast database with millions of products and ads, using our smart search.</p>
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
          <div className="home-magic-search__prompt-stage">
            <ul className="home-magic-search__prompt-stack" aria-hidden="true">
              {ROLLING_PROMPTS.map((prompt, index) => (
                <li key={`${prompt}-${index}`}>{prompt}</li>
              ))}
            </ul>

            <div className="home-magic-search__search-wrap">
              <div className="home-magic-search__search-inner">
                <button className="home-magic-search__icon-button home-magic-search__icon-button--add" type="button" aria-label="Add context">
                  <span aria-hidden="true" />
                </button>

                <div className="home-magic-search__active-prompt">
                  <ul>
                    {ROLLING_PROMPTS.map((prompt, index) => (
                      <li key={`${prompt}-active-${index}`}>{prompt}</li>
                    ))}
                  </ul>
                </div>

                <button className="home-magic-search__icon-button home-magic-search__icon-button--send" type="button" aria-label="Run search">
                  <span aria-hidden="true">
                    <svg viewBox="0 0 20 20" focusable="false">
                      <path d="M10 15V5M10 5L5.8 9.2M10 5l4.2 4.2" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
