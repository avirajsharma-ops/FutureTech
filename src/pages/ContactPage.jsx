import PageShell from './PageShell'

export default function ContactPage() {
  return (
    <PageShell
      eyebrow="Get in touch"
      title="Let's build something great."
      lead="Tell us about your project. We typically respond within one business day."
    >
      <form
        className="contact-form"
        onSubmit={(e) => {
          e.preventDefault()
          alert('Thanks — we will be in touch shortly.')
        }}
      >
        <div>
          <label htmlFor="cf-name">Name</label>
          <input id="cf-name" type="text" required placeholder="Jane Doe" />
        </div>
        <div>
          <label htmlFor="cf-email">Email</label>
          <input id="cf-email" type="email" required placeholder="you@company.com" />
        </div>
        <div>
          <label htmlFor="cf-msg">Project details</label>
          <textarea id="cf-msg" required placeholder="What are you building?" />
        </div>
        <button type="submit">Send message</button>
      </form>
    </PageShell>
  )
}
