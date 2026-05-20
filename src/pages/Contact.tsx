import ContactForm from '../components/ContactForm'

export default function Contact() {
  return (
    <div className="container" style={{ paddingTop: 24 }}>
      <h1>Contact</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 18 }}>Have a question or need support? Send us a message and we'll respond as soon as possible.</p>
      <ContactForm />
    </div>
  )
}
