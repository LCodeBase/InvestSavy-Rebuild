// Função para carregar as notícias
async function loadNews() {
  try {
    // Carrega os arquivos Markdown diretamente
    const posts = await Promise.all([
      fetch('/_posts/2024-02-20-mercado-reage-medidas-economicas.md').then(
        (r) => r.text()
      ),
      fetch('/_posts/2025-05-19-mercado-acao-brasileiro.md').then((r) =>
        r.text()
      ),
    ])

    // Processa cada post
    return posts
      .map((post) => {
        // Extrai o front matter
        const frontMatterMatch = post.match(
          /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)/
        )
        if (!frontMatterMatch) return null

        const frontMatter = frontMatterMatch[1]
        const content = frontMatterMatch[2]

        // Processa o front matter
        const metadata = {}
        frontMatter.split('\n').forEach((line) => {
          const [key, ...valueParts] = line.split(':')
          if (key && valueParts.length) {
            let value = valueParts.join(':').trim()
            // Remove aspas
            value = value.replace(/^['"]|['"]$/g, '')

            // Processa arrays
            if (value.startsWith('[') && value.endsWith(']')) {
              value = value
                .slice(1, -1)
                .split(',')
                .map((v) => v.trim())
            }

            metadata[key.trim()] = value
          }
        })

        // Gera o slug do título
        const slug = metadata.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')

        return {
          title: metadata.title,
          date: metadata.date,
          categories: metadata.categories,
          tags: metadata.tags,
          author: metadata.author,
          image: metadata.image,
          excerpt: metadata.excerpt,
          content: content,
          slug: slug,
        }
      })
      .filter(Boolean)
  } catch (error) {
    console.error('Erro ao carregar notícias:', error)
    return []
  }
}

// Função para formatar a data
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

// Função para criar o card de notícia
function createNewsCard(post) {
  const card = document.createElement('article')
  card.className = 'news-card'

  // Adiciona classe 'featured' se for a primeira notícia
  if (post.featured) {
    card.classList.add('featured')
  }

  card.innerHTML = `
        <img src="${post.image}" alt="${post.title}" class="news-image">
        <div class="news-content">
            ${post.tags
              .map(
                (tag) =>
                  `<span class="news-tag ${tag.toLowerCase()}">${tag}</span>`
              )
              .join('')}
            <h2 class="news-title">${post.title}</h2>
            <p class="news-excerpt">${post.excerpt}</p>
            <div class="news-meta">
                <span class="news-date">${formatDate(post.date)}</span>
                <a href="/noticia/${post.slug}" class="news-link">Ler mais</a>
            </div>
        </div>
    `

  return card
}

// Função para exibir as notícias na página
async function displayNews() {
  const newsGrid = document.querySelector('.news-grid')
  if (!newsGrid) return

  const posts = await loadNews()
  const currentCategory = window.location.pathname.split('/')[1] || 'destaques'

  // Filtra as notícias pela categoria atual
  const filteredPosts = posts.filter((post) => {
    if (currentCategory === 'destaques') {
      return post.tags.includes('destaque')
    }
    return post.categories.toLowerCase() === currentCategory.toLowerCase()
  })

  // Limpa o grid
  newsGrid.innerHTML = ''

  // Adiciona as notícias ao grid
  filteredPosts.forEach((post, index) => {
    if (index === 0) {
      post.featured = true
    }
    const card = createNewsCard(post)
    newsGrid.appendChild(card)
  })
}

// Carrega as notícias quando a página carregar
document.addEventListener('DOMContentLoaded', displayNews)
