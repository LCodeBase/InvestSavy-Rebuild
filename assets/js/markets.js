// Configuração da API Alpha Vantage
const API_KEY = 'JVBMTELK0EZ8UJCY' // Substitua pela sua chave API
const SYMBOLS = ['^BVSP', 'USDBRL=X', 'BTCUSD=X', 'CL=F'] // Ibovespa, Dólar, Bitcoin, Petróleo

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
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
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
