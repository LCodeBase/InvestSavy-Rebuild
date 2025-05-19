// Configuração da API Alpha Vantage
const ALPHA_VANTAGE_API_KEY = 'F69K61TLI38DTZR6' // Nova chave API
const SYMBOLS = ['^BVSP', 'USDBRL=X', 'BTCUSD=X', 'CL=F'] // Ibovespa, Dólar, Bitcoin, Petróleo

// Configuração dos símbolos
const STOCK_TICKERS = [
  {
    symbol: 'PETR4',
    name: 'Petrobras',
    price: '32,09',
    change: '-0,31%',
    volume: '2.3M',
  },
  {
    symbol: 'VALE3',
    name: 'Vale',
    price: '55,42',
    change: '-1,25%',
    volume: '3.1M',
  },
  {
    symbol: 'ITUB4',
    name: 'Itaú Unibanco',
    price: '38,49',
    change: '+0,52%',
    volume: '1.8M',
  },
  {
    symbol: 'BBDC4',
    name: 'Bradesco',
    price: '19,87',
    change: '-0,23%',
    volume: '2.5M',
  },
  {
    symbol: 'ABEV3',
    name: 'Ambev',
    price: '14,93',
    change: '+0,31%',
    volume: '1.2M',
  },
  {
    symbol: 'WEGE3',
    name: 'WEG',
    price: '42,65',
    change: '+2,18%',
    volume: '980K',
  },
  {
    symbol: 'RENT3',
    name: 'Localiza',
    price: '58,72',
    change: '-1,42%',
    volume: '865K',
  },
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
  if (!element) {
    console.error('Elemento não encontrado para atualização')
    return
  }

  const valueElement = element.querySelector('.market-value')
  const changeElement = element.querySelector('.market-change')

  if (!valueElement || !changeElement) {
    console.error('Elementos de valor ou mudança não encontrados')
    return
  }

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
    const marketItems = document.querySelectorAll('.market-item')
    if (!marketItems.length) {
      console.log('Nenhum elemento de mercado encontrado')
      return
    }

    const responses = await Promise.all(
      SYMBOLS.map((symbol) =>
        fetch(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
        ).then((response) => response.json())
      )
    )

    responses.forEach((data, index) => {
      if (data['Global Quote'] && marketItems[index]) {
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
    // Usando a API Alpha Vantage
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}.SAO&apikey=${ALPHA_VANTAGE_API_KEY}`

    console.log(`Buscando dados para ${symbol}...`)
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data['Global Quote']) {
      const quote = data['Global Quote']
      const price = parseFloat(quote['05. price'])
      const previousClose = parseFloat(quote['08. previous close'])
      const change = price - previousClose
      const changePct = ((change / previousClose) * 100).toFixed(2)
      const volume = parseInt(quote['06. volume']) || 0

      // Validação adicional para garantir que os preços estão corretos
      if (
        isNaN(price) ||
        price <= 0 ||
        isNaN(previousClose) ||
        previousClose <= 0
      ) {
        throw new Error('Dados de preço inválidos')
      }

      return {
        price: price.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        change: change,
        changePct: changePct,
        volume:
          volume > 1e6
            ? (volume / 1e6).toFixed(1) + 'M'
            : (volume / 1e3).toFixed(0) + 'K',
        positive: change >= 0,
        isMarketOpen: isMarketOpen(),
      }
    }
    throw new Error('Dados não disponíveis')
  } catch (e) {
    console.error(`Erro ao buscar dados de ${symbol}:`, e)
    return null
  }
}

// Função para calcular o tempo restante
function calculateTimeRemaining() {
  const now = new Date()
  const brazilTime = new Date(
    now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })
  )
  const day = brazilTime.getDay()
  const hour = brazilTime.getHours()
  const minute = brazilTime.getMinutes()
  const isOpen = isMarketOpen()

  // Se for fim de semana
  if (day === 0 || day === 6) {
    const nextMonday = new Date(brazilTime)
    nextMonday.setDate(brazilTime.getDate() + (day === 0 ? 1 : 2))
    nextMonday.setHours(10, 0, 0, 0)
    return {
      isOpen: false,
      timeRemaining: nextMonday - brazilTime,
      isWeekend: true,
    }
  }

  // Se o mercado estiver aberto
  if (isOpen) {
    const closeTime = new Date(brazilTime)
    closeTime.setHours(17, 0, 0, 0)
    return {
      isOpen: true,
      timeRemaining: closeTime - brazilTime,
      isWeekend: false,
    }
  }

  // Se o mercado estiver fechado
  const openTime = new Date(brazilTime)
  if (hour < 10) {
    // Abre hoje
    openTime.setHours(10, 0, 0, 0)
  } else {
    // Abre amanhã
    openTime.setDate(brazilTime.getDate() + 1)
    openTime.setHours(10, 0, 0, 0)
  }
  return {
    isOpen: false,
    timeRemaining: openTime - brazilTime,
    isWeekend: false,
  }
}

// Função para formatar o tempo restante
function formatTimeRemaining(ms) {
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${minutes}m`
}

// Função para atualizar o relógio e status do mercado
function updateMarketStatus() {
  const marketStatusElement = document.querySelector('.market-status')
  if (!marketStatusElement) return

  const now = new Date()
  const brazilTime = new Date(
    now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })
  )
  const timeInfo = calculateTimeRemaining()

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

  let statusText = timeInfo.isOpen ? 'Mercado Aberto' : 'Mercado Fechado'
  let timeRemainingText = ''

  if (timeInfo.isWeekend) {
    timeRemainingText = 'Abre na próxima segunda-feira'
  } else if (timeInfo.isOpen) {
    timeRemainingText = `Fechamento em ${formatTimeRemaining(
      timeInfo.timeRemaining
    )}`
  } else {
    timeRemainingText = `Abertura em ${formatTimeRemaining(
      timeInfo.timeRemaining
    )}`
  }

  marketStatusElement.innerHTML = `
    <div class="market-status-content ${
      timeInfo.isOpen ? 'market-open' : 'market-closed'
    }">
      <div class="market-status-indicator">
        <span class="status-dot"></span>
        <span class="status-text">${statusText}</span>
      </div>
      <div class="market-time">
        <span class="time">${timeString}</span>
        <span class="date">${dateString}</span>
      </div>
      <div class="market-countdown">
        <span class="countdown-text">${timeRemainingText}</span>
      </div>
    </div>
  `
}

// Atualiza o status do mercado a cada segundo
setInterval(updateMarketStatus, 1000)
updateMarketStatus()

// Função para atualizar a tabela de ações
async function updateStocksTable() {
  const table = document.querySelector('.stocks-table tbody')
  if (!table) {
    console.error('Tabela de ações não encontrada')
    return
  }

  const marketStatus = isMarketOpen() ? 'Mercado Aberto' : 'Mercado Fechado'
  console.log(`Atualizando dados - ${marketStatus}`)

  for (const ticker of STOCK_TICKERS) {
    // Encontrando a linha pelo texto do ticker
    const rows = Array.from(table.querySelectorAll('tr'))
    const row = rows.find((row) => {
      const tickerCell = row.querySelector('td:first-child')
      return tickerCell && tickerCell.textContent.trim() === ticker.symbol
    })

    if (!row) {
      console.error(`Linha não encontrada para ${ticker.symbol}`)
      continue
    }

    // Atualiza os dados com valores fixos
    const priceCell = row.cells[2]
    const changeCell = row.cells[3]
    const volumeCell = row.cells[4]

    // Formata o preço
    const price = parseFloat(ticker.price.replace(',', '.'))
    priceCell.textContent = price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

    // Atualiza a variação
    const change = ticker.change
    changeCell.textContent = change
    changeCell.className = change.startsWith('+') ? 'positive' : 'negative'

    // Atualiza o volume
    volumeCell.textContent = ticker.volume

    // Adiciona indicador visual de mercado fechado
    if (!isMarketOpen()) {
      priceCell.title = 'Último preço de fechamento'
      changeCell.title = 'Variação do último fechamento'
      changeCell.classList.add('market-closed-value')
    }
  }
}

// Atualiza ao carregar e a cada 30 segundos
if (document.querySelector('.stocks-table')) {
  console.log('Inicializando atualização da tabela de ações...')
  updateStocksTable()
  setInterval(updateStocksTable, 30000) // Atualiza a cada 30 segundos
}
