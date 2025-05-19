// Função para realizar a busca
async function performSearch(query) {
  const posts = await loadNews()
  const searchResults = document.getElementById('searchResults')

  if (!query.trim()) {
    searchResults.classList.remove('active')
    return
  }

  // Normaliza a query para busca case-insensitive
  const normalizedQuery = query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  // Filtra os posts que correspondem à busca
  const results = posts.filter((post) => {
    const title = post.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
    const excerpt = post.excerpt
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
    const content = post.content
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

    return (
      title.includes(normalizedQuery) ||
      excerpt.includes(normalizedQuery) ||
      content.includes(normalizedQuery)
    )
  })

  // Exibe os resultados
  if (results.length > 0) {
    searchResults.innerHTML = results
      .map(
        (post) => `
            <a href="/noticia/${post.slug}" class="search-result-item">
                <h3 class="search-result-title">${post.title}</h3>
                <p class="search-result-excerpt">${post.excerpt}</p>
                <div class="search-result-meta">
                    <span class="search-result-category">${
                      post.categories
                    }</span>
                    <span class="search-result-date">${formatDate(
                      post.date
                    )}</span>
                </div>
            </a>
        `
      )
      .join('')
  } else {
    searchResults.innerHTML = `
            <div class="no-results">
                Nenhuma notícia encontrada para "${query}"
            </div>
        `
  }

  searchResults.classList.add('active')
}

// Função para lidar com o envio do formulário
function handleSearchSubmit(event) {
  event.preventDefault()
  const query = document.getElementById('searchInput').value
  performSearch(query)
}

// Função para lidar com a digitação
function handleSearchInput(event) {
  const query = event.target.value
  performSearch(query)
}

// Função para fechar os resultados ao clicar fora
function handleClickOutside(event) {
  const searchBar = document.querySelector('.search-bar')
  const searchResults = document.getElementById('searchResults')

  if (!searchBar.contains(event.target)) {
    searchResults.classList.remove('active')
  }
}

// Inicializa os event listeners
document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('searchForm')
  const searchInput = document.getElementById('searchInput')

  if (searchForm) {
    searchForm.addEventListener('submit', handleSearchSubmit)
  }

  if (searchInput) {
    searchInput.addEventListener('input', handleSearchInput)
  }

  document.addEventListener('click', handleClickOutside)
})
