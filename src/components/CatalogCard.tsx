type Item = { id: string; title: string; author: string; imgId: string; excerpt: string }

export default function CatalogCard({ item }: { item: Item }) {
  const imageUrl = (id: string, w = 720, h = 360) => `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format&ixlib=rb-4.0.3&q=80`

  return (
    <article style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
      <img src={imageUrl(item.imgId)} alt={`${item.title} cover`} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
      <div style={{ padding: 16 }}>
        <h2 style={{ margin: 0, fontSize: '1.05rem' }}>{item.title}</h2>
        <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: 6 }}>By {item.author}</div>
        <p style={{ marginTop: 10, color: 'var(--color-text-muted)' }}>{item.excerpt}</p>
        <div style={{ marginTop: 12 }}>
          <a href={`/catalog/item/${item.id}`} style={{ textDecoration: 'none', background: 'var(--color-primary)', color: '#fff', padding: '8px 12px', borderRadius: 8 }}>View</a>
        </div>
      </div>
    </article>
  )
}
