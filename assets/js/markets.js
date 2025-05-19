// Configuração da API Alpha Vantage
const ALPHA_VANTAGE_API_KEY = 'F69K61TLI38DTZR6' // Nova chave API
const SYMBOLS = ['^BVSP', 'USDBRL=X', 'BTCUSD=X', 'CL=F'] // Ibovespa, Dólar, Bitcoin, Petróleo

// Configuração dos símbolos
const STOCK_TICKERS = [
  { symbol: 'PETR4.SA', name: 'Petrobras' },
  { symbol: 'VALE3.SA', name: 'Vale' },
  { symbol: 'ITUB4.SA', name: 'Itaú Unibanco' },
  { symbol: 'BBDC4.SA', name: 'Bradesco' },
  { symbol: 'ABEV3.SA', name: 'Ambev' },
  { symbol: 'WEGE3.SA', name: 'WEG' },
  { symbol: 'RENT3.SA', name: 'Localiza' },
]

// Função para verificar se o mercado está aberto
function isMarketOpen() {
  const now = new Date()
  const day = now.getDay()
  const hour = now.getHours()
  const minute = now.getMinutes()

  // Verifica se é dia útil (1-5, segunda a sexta)
  if (day === 0 || day === 6) return false

  // Horário de funcionamento da B3: 10:00 às 17:00
  const currentTime = hour * 100 + minute
  return currentTime >= 1000 && currentTime < 1700
}

// Função para formatar números
function formatNumber(number, decimals = 2) {
  return Number(number).toFixed(decimals)
}

// Função para calcular a variação percentual
function calculateChange(current, previous) {
  return ((current - previous) / previous) * 100
}

// Função para atualizar o valor na interface
function updateMarketValue(element, value, change) {
  const valueElement = element.querySelector('.market-value')
  const changeElement = element.querySelector('.market-change')

  valueElement.textContent = formatNumber(value)

  const changeValue = formatNumber(change, 2)
  changeElement.textContent = `${changeValue > 0 ? '+' : ''}${changeValue}%`
  changeElement.className = `market-change ${
    changeValue >= 0 ? 'positive' : 'negative'
  }`
}

// Função para buscar dados da API
async function fetchMarketData() {
  try {
    const responses = await Promise.all(
      SYMBOLS.map((symbol) =>
        fetch(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
        ).then((response) => response.json())
      )
    )

    const marketItems = document.querySelectorAll('.market-item')

    responses.forEach((data, index) => {
      if (data['Global Quote']) {
        const quote = data['Global Quote']
        const currentPrice = parseFloat(quote['05. price'])
        const previousClose = parseFloat(quote['08. previous close'])
        const change = calculateChange(currentPrice, previousClose)

        updateMarketValue(marketItems[index], currentPrice, change)
      }
    })
  } catch (error) {
    console.error('Erro ao buscar dados do mercado:', error)
  }
}

// Atualizar dados a cada 1 minuto
setInterval(fetchMarketData, 60000)

// Buscar dados iniciais
fetchMarketData()

// =============================
// Atualização em tempo real da tabela de ações em destaque
// =============================

async function fetchStockData(symbol) {
  try {
    // Usando o proxy CORS para acessar a API do Yahoo Finance
    const proxyUrl = 'https://corsproxy.io/?'
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`
    const url = proxyUrl + encodeURIComponent(yahooUrl)

    console.log(`Buscando dados para ${symbol}...`)
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data.chart && data.chart.result && data.chart.result[0]) {
      const result = data.chart.result[0]
      const meta = result.meta

      const price = meta.regularMarketPrice
      const previousClose = meta.previousClose
      const change = price - previousClose
      const changePct = calculateChange(price, previousClose)
      const volume = meta.regularMarketVolume

      return {
        price: price.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        change: change,
        changePct: formatNumber(changePct),
        volume:
          volume > 1e6
            ? (volume / 1e6).toFixed(1) + 'M'
            : (volume / 1e3).toFixed(0) + 'K',
        positive: change >= 0,
        isMarketOpen: isMarketOpen(),
      }
    }
    return null
  } catch (e) {
    console.error(`Erro ao buscar dados de ${symbol}:`, e)
    return null
  }
}

// Função para atualizar o relógio e status do mercado
function updateMarketStatus() {
  const marketStatusElement = document.querySelector('.market-status')
  if (!marketStatusElement) return

  const now = new Date()
  const brazilTime = new Date(
    now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })
  )
  const isOpen = isMarketOpen()

  const timeString = brazilTime.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const dateString = brazilTime.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  marketStatusElement.innerHTML = `
    <div class="market-status-content ${
      isOpen ? 'market-open' : 'market-closed'
    }">
      <div class="market-status-indicator">
        <span class="status-dot"></span>
        <span class="status-text">${
          isOpen ? 'Mercado Aberto' : 'Mercado Fechado'
        }</span>
      </div>
      <div class="market-time">
        <span class="time">${timeString}</span>
        <span class="date">${dateString}</span>
      </div>
    </div>
  `
}

// Atualiza o status do mercado a cada segundo
setInterval(updateMarketStatus, 1000)
updateMarketStatus()

async function updateStocksTable() {
  const table = document.querySelector('.stocks-table tbody')
  if (!table) {
    console.error('Tabela de ações não encontrada')
    return
  }

  const marketStatus = isMarketOpen() ? 'Mercado Aberto' : 'Mercado Fechado'
  console.log(`Atualizando dados - ${marketStatus}`)

  table.querySelectorAll('tr').forEach((row, idx) => {
    const ticker = STOCK_TICKERS[idx]
    if (!ticker) {
      console.error(`Ticker não encontrado para índice ${idx}`)
      return
    }

    // Mostra loading enquanto busca
    row.cells[2].textContent = '...'
    row.cells[3].textContent = '...'
    row.cells[3].className = ''
    row.cells[4].textContent = '...'

    fetchStockData(ticker.symbol)
      .then((data) => {
        if (data) {
          console.log(`Dados recebidos para ${ticker.symbol}:`, data)
          row.cells[2].textContent = data.price
          row.cells[3].textContent =
            (data.change >= 0 ? '+' : '') + data.changePct + '%'
          row.cells[3].className = data.positive ? 'positive' : 'negative'
          row.cells[4].textContent = data.volume

          // Adiciona indicador visual de mercado fechado
          if (!data.isMarketOpen) {
            row.cells[2].title = 'Último preço de fechamento'
            row.cells[3].title = 'Variação do último fechamento'
            row.cells[3].classList.add('market-closed-value')
          }
        } else {
          console.error(`Erro ao buscar dados para ${ticker.symbol}`)
          row.cells[2].textContent = 'Erro'
          row.cells[3].textContent = '-'
          row.cells[3].className = ''
          row.cells[4].textContent = '-'
        }
      })
      .catch((error) => {
        console.error(`Erro ao processar dados de ${ticker.symbol}:`, error)
        row.cells[2].textContent = 'Erro'
        row.cells[3].textContent = '-'
        row.cells[3].className = ''
        row.cells[4].textContent = '-'
      })
  })
}

// Atualiza ao carregar e a cada 30 segundos
if (document.querySelector('.stocks-table')) {
  console.log('Inicializando atualização da tabela de ações...')
  updateStocksTable()
  setInterval(updateStocksTable, 30000) // Atualiza a cada 30 segundos
}
