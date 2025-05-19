// Configurações
const NEWS_API_KEY = 'e30be74acf9142acb17e04f4f5ef7bc9'

// URLs das APIs
const YAHOO_FINANCE_PROXY =
  'https://cors-anywhere.herokuapp.com/https://query1.finance.yahoo.com/v8/finance/chart/'
const NEWS_API_BASE_URL = 'https://newsapi.org/v2'

// Símbolos das ações para monitorar (formato Yahoo Finance)
const STOCK_SYMBOLS = [
  'PETR4.SA',
  'VALE3.SA',
  'ITUB4.SA',
  'BBDC4.SA',
  'ABEV3.SA',
]

// Cache para dados das ações
const stockCache = {
  data: {},
  lastUpdate: {},
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutos em milissegundos
}

// Elementos DOM
const marketsTicker = document.querySelector('.markets__ticker')
const highlightsGrid = document.querySelector('.highlights__grid')
const categoriesGrid = document.querySelector('.categories__grid')

// Funções de Utilidade
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

const formatPercentage = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100)
}

// Gerenciamento do Ticker de Mercado
async function updateMarketsTicker() {
  try {
    // Adiciona classe de loading em todos os itens
    const marketItems = document.querySelectorAll('.market-item')
    marketItems.forEach((item) => item.classList.add('loading'))

    const stockData = await Promise.all(
      STOCK_SYMBOLS.map((symbol) => fetchStockData(symbol))
    )

    marketsTicker.innerHTML = stockData
      .map(
        (stock) => `
            <div class="market-item ${stock.error ? 'error' : ''}">
                <span class="market-name">${stock.symbol.replace(
                  '.SA',
                  ''
                )}</span>
                <span class="market-value">${formatCurrency(stock.price)}</span>
                <span class="market-change ${
                  stock.change >= 0 ? 'positive' : 'negative'
                }">
                    ${formatPercentage(stock.change)}
                </span>
            </div>
        `
      )
      .join('')
  } catch (error) {
    console.error('Erro ao atualizar ticker:', error)
    marketsTicker.innerHTML = '<p>Dados temporariamente indisponíveis</p>'
  }
}

async function fetchStockData(symbol) {
  try {
    // Verifica se há dados em cache válidos
    const now = Date.now()
    if (
      stockCache.data[symbol] &&
      stockCache.lastUpdate[symbol] &&
      now - stockCache.lastUpdate[symbol] < stockCache.CACHE_DURATION
    ) {
      return stockCache.data[symbol]
    }

    const response = await fetch(
      `${YAHOO_FINANCE_PROXY}${symbol}?interval=1d&range=1d`
    )
    const data = await response.json()

    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      throw new Error('Dados não disponíveis')
    }

    const result = data.chart.result[0]
    const quote = result.indicators.quote[0]
    const price = quote.close[quote.close.length - 1]
    const previousClose = result.meta.previousClose
    const change = ((price - previousClose) / previousClose) * 100

    const stockData = {
      symbol: symbol,
      price: price,
      change: change,
      error: false,
    }

    // Atualiza o cache
    stockCache.data[symbol] = stockData
    stockCache.lastUpdate[symbol] = now

    return stockData
  } catch (error) {
    console.error(`Erro ao buscar dados de ${symbol}:`, error)

    // Se houver dados em cache, mesmo expirados, usa eles
    if (stockCache.data[symbol]) {
      return {
        ...stockCache.data[symbol],
        error: true,
      }
    }

    // Retorna dados de fallback
    return {
      symbol: symbol,
      price: 0,
      change: 0,
      error: true,
    }
  }
}

// Gerenciamento de Destaques
async function updateHighlights() {
  try {
    const response = await fetch(
      `${NEWS_API_BASE_URL}/top-headlines?country=br&category=business&apiKey=${NEWS_API_KEY}`
    )
    const data = await response.json()

    highlightsGrid.innerHTML = data.articles
      .slice(0, 3)
      .map(
        (article) => `
      <article class="highlight-card">
        <div class="highlight-card__image">
          <img src="${
            article.urlToImage || 'assets/images/placeholder.jpg'
          }" alt="${article.title}">
        </div>
        <div class="highlight-card__content">
          <span class="highlight-card__category">${article.source.name}</span>
          <h3 class="highlight-card__title">${article.title}</h3>
          <p class="highlight-card__excerpt">${article.description}</p>
          <a href="${
            article.url
          }" class="btn btn--primary" target="_blank" rel="noopener">Leia mais</a>
        </div>
      </article>
    `
      )
      .join('')
  } catch (error) {
    console.error('Erro ao atualizar destaques:', error)
    highlightsGrid.innerHTML = '<p>Conteúdo temporariamente indisponível</p>'
  }
}

// Gerenciamento de Categorias
async function updateCategories() {
  try {
    const categories = ['economia', 'mercados', 'tecnologia']
    const categoryPromises = categories.map((category) =>
      fetch(
        `${NEWS_API_BASE_URL}/top-headlines?country=br&category=${category}&apiKey=${NEWS_API_KEY}`
      ).then((res) => res.json())
    )

    const categoryData = await Promise.all(categoryPromises)

    categoriesGrid.innerHTML = categories
      .map(
        (category, index) => `
      <section class="category-section">
        <h2 class="category-section__title">${
          category.charAt(0).toUpperCase() + category.slice(1)
        }</h2>
        <div class="category-section__grid">
          ${categoryData[index].articles
            .slice(0, 3)
            .map(
              (article) => `
            <article class="category-card">
              <div class="category-card__image">
                <img src="${
                  article.urlToImage || 'assets/images/placeholder.jpg'
                }" alt="${article.title}">
              </div>
              <div class="category-card__content">
                <h3 class="category-card__title">${article.title}</h3>
                <p class="category-card__excerpt">${article.description}</p>
                <a href="${
                  article.url
                }" class="btn btn--text" target="_blank" rel="noopener">Leia mais</a>
              </div>
            </article>
          `
            )
            .join('')}
        </div>
      </section>
    `
      )
      .join('')
  } catch (error) {
    console.error('Erro ao atualizar categorias:', error)
    categoriesGrid.innerHTML = '<p>Conteúdo temporariamente indisponível</p>'
  }
}

// Gerenciamento do Menu Mobile
function initMobileMenu() {
  const menuButton = document.createElement('button')
  menuButton.className = 'mobile-menu-button'
  menuButton.innerHTML = `
    <span></span>
    <span></span>
    <span></span>
  `

  const header = document.querySelector('.header__content')
  header.insertBefore(menuButton, header.firstChild)

  menuButton.addEventListener('click', () => {
    const nav = document.querySelector('.header__nav')
    nav.classList.toggle('active')
    menuButton.classList.toggle('active')
  })
}

// Gerenciamento do Formulário de Newsletter
function initNewsletterForm() {
  const form = document.querySelector('.newsletter__form')
  if (!form) return

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = form.querySelector('input[type="email"]').value

    try {
      // Aqui você implementaria a lógica de envio para sua API
      console.log('Email cadastrado:', email)
      form.reset()
      alert('Inscrição realizada com sucesso!')
    } catch (error) {
      console.error('Erro ao cadastrar email:', error)
      alert('Erro ao realizar inscrição. Tente novamente.')
    }
  })
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu()
  initNewsletterForm()
  updateMarketsTicker()
  updateHighlights()
  updateCategories()

  // Atualiza o ticker a cada 30 segundos
  setInterval(updateMarketsTicker, 30000)
})
