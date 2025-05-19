<?php
$slug = $_GET['slug'] ?? '';
$posts = json_decode(file_get_contents('_posts/index.php'), true);
$post = null;

foreach ($posts as $p) {
    if ($p['slug'] === $slug) {
        $post = $p;
        break;
    }
}

if (!$post) {
    header('Location: /');
    exit;
}

// Converte o conteúdo Markdown para HTML
require_once 'vendor/parsedown/Parsedown.php';
$parsedown = new Parsedown();
$content = $parsedown->text($post['content']);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($post['title']); ?> - InvestSavy</title>
    <link rel="icon" type="image/x-icon" href="assets/images/favicon.ico">
    <link rel="stylesheet" href="assets/css/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
</head>
<body>
    <!-- Header Principal -->
    <header class="header">
        <a href="/" class="logo">InvestSavy</a>
        <div class="header-actions">
            <a href="/login" class="header-action">Login</a>
            <a href="/assine" class="header-action">Assine</a>
            <a href="/contato" class="header-action">Contato</a>
        </div>
    </header>

    <!-- Barra de Navegação Secundária -->
    <nav class="nav-bar">
        <ul class="nav-menu">
            <li><a href="/destaques" class="nav-link">Destaques</a></li>
            <li><a href="/mercados" class="nav-link">Mercados</a></li>
            <li><a href="/economia" class="nav-link">Economia</a></li>
            <li><a href="/politica" class="nav-link">Política</a></li>
            <li><a href="/tecnologia" class="nav-link">Tecnologia</a></li>
            <li><a href="/energia" class="nav-link">Energia</a></li>
        </ul>
        <div class="nav-search">
            <input type="search" placeholder="Buscar...">
            <button type="button">🔍</button>
        </div>
    </nav>

    <!-- Conteúdo da Notícia -->
    <main class="post-content">
        <article class="post">
            <div class="post-header">
                <h1 class="post-title"><?php echo htmlspecialchars($post['title']); ?></h1>
                <div class="post-meta">
                    <span class="post-author">Por <?php echo htmlspecialchars($post['author']); ?></span>
                    <span class="post-date"><?php echo date('d \d\e F \d\e Y', strtotime($post['date'])); ?></span>
                </div>
                <div class="post-tags">
                    <?php foreach ($post['tags'] as $tag): ?>
                        <span class="post-tag <?php echo strtolower($tag); ?>"><?php echo htmlspecialchars($tag); ?></span>
                    <?php endforeach; ?>
                </div>
            </div>

            <img src="<?php echo htmlspecialchars($post['image']); ?>" alt="<?php echo htmlspecialchars($post['title']); ?>" class="post-image">

            <div class="post-body">
                <?php echo $content; ?>
            </div>

            <div class="post-footer">
                <div class="post-tags">
                    <?php foreach ($post['tags'] as $tag): ?>
                        <span class="post-tag <?php echo strtolower($tag); ?>"><?php echo htmlspecialchars($tag); ?></span>
                    <?php endforeach; ?>
                </div>
            </div>
        </article>
    </main>

    <!-- Footer -->
    <footer class="footer">
        <div class="footer-content">
            <div class="footer-section">
                <h3>Sobre o InvestSavy</h3>
                <p>Portal líder em notícias financeiras e análises de mercado, trazendo informações precisas e atualizadas para investidores.</p>
            </div>
            <div class="footer-section">
                <h3>Links Rápidos</h3>
                <ul class="footer-links">
                    <li><a href="/termos">Termos de Uso</a></li>
                    <li><a href="/privacidade">Política de Privacidade</a></li>
                    <li><a href="/contato">Fale Conosco</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h3>Redes Sociais</h3>
                <ul class="footer-links">
                    <li><a href="#">Twitter</a></li>
                    <li><a href="#">LinkedIn</a></li>
                    <li><a href="#">Instagram</a></li>
                </ul>
            </div>
        </div>
    </footer>

    <script src="assets/js/markets.js"></script>
</body>
</html>