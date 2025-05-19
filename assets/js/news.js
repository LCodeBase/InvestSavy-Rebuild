// Função para carregar as notícias
async function loadNews() {
  try {
    const response = await fetch('/_posts/index.php')
    const posts = await response.json()
    return posts
  } catch (error) {
    console.error('Erro ao carregar notícias:', error)
    return []
  }
}

// Função para formatar a data
function formatDate(dateString) {
  const options = { day: 'numeric', month: 'long', year: 'numeric' }
  return new Date(dateString).toLocaleDateString('pt-BR', options)
}

// Função para criar o card de notícia
function createNewsCard(post, isFeatured = false) {
  const cardClass = isFeatured ? 'news-card featured' : 'news-card'
  return `
        <article class="${cardClass}">
            <img src="${post.image}" alt="${post.title}" class="news-image">
            <div class="news-content">
                ${post.categories
                  .map(
                    (category) =>
                      `<span class="news-tag ${category.toLowerCase()}">${category}</span>`
                  )
                  .join('')}
                <h2 class="news-title">${post.title}</h2>
                <p class="news-excerpt">${post.excerpt}</p>
                <div class="news-meta">
                    <span class="news-date">${formatDate(post.date)}</span>
                    <a href="/noticia/${
                      post.slug
                    }" class="news-link">Ler mais</a>
                </div>
            </div>
        </article>
    `
}

// Função para exibir as notícias
async function displayNews() {
  const newsGrid = document.getElementById('newsGrid')
  if (!newsGrid) return

  const posts = await loadNews()
  const currentCategory = window.location.pathname.split('/')[1] || 'destaques'

  // Filtra as notícias por categoria
  const filteredPosts = posts.filter((post) =>
    post.categories.some(
      (category) => category.toLowerCase() === currentCategory.toLowerCase()
    )
  )

  if (filteredPosts.length > 0) {
    // Primeira notícia como destaque
    newsGrid.innerHTML = createNewsCard(filteredPosts[0], true)

    // Restante das notícias
    filteredPosts.slice(1).forEach((post) => {
      newsGrid.innerHTML += createNewsCard(post)
    })
  } else {
    newsGrid.innerHTML =
      '<p>Nenhuma notícia encontrada para esta categoria.</p>'
  }
}

// Carrega as notícias quando a página carregar
document.addEventListener('DOMContentLoaded', displayNews)
