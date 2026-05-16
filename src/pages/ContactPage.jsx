import { motion } from 'motion/react'
import './ContactPage.css'

export default function ContactPage() {
  return (
    <section className="lets-talk-page" aria-labelledby="lets-talk-title">
      <motion.div
        className="lets-talk-page__media"
        initial={{ opacity: 0, x: -28 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden="true"
      >
        <img
          src="/contact/contact-figma-media.png"
          alt=""
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      </motion.div>

      <motion.div
        className="lets-talk-page__panel"
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
      >
        <img src="/favicon.png" alt="MW Futuretech" className="lets-talk-page__logo" />
        <h1 id="lets-talk-title">Get Started</h1>
        <p>
          Want to know more about us? <strong>Let&rsquo;s get started</strong>
        </p>

        <div className="lets-talk-page__divider" role="separator" />

      <form
        className="lets-talk-form"
        onSubmit={(e) => {
          e.preventDefault()
          alert('Thanks - we will be in touch shortly.')
        }}
      >
        <label className="lets-talk-form__field" htmlFor="contact-email">
          <span>Email address</span>
          <input id="contact-email" type="email" placeholder="Enter your E-mail address" />
        </label>

        <span className="lets-talk-form__or">Or</span>

        <label className="lets-talk-form__field" htmlFor="contact-phone">
          <span>Contact number</span>
          <input id="contact-phone" type="tel" placeholder="Enter your Contact number" />
        </label>

        <button type="submit">Connect with us</button>
      </form>
      </motion.div>
    </section>
  )
}
