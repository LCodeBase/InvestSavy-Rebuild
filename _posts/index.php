<?php
header('Content-Type: application/json');

// Função para ler arquivos Markdown
function readMarkdownFile($file) {
    $content = file_get_contents($file);
    if (!$content) return null;

    // Extrai o front matter
    preg_match('/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)/', $content, $matches);
    if (!$matches) return null;

    $frontMatter = $matches[1];
    $content = $matches[2];

    // Processa o front matter
    $metadata = [];
    foreach (explode("\n", $frontMatter) as $line) {
        if (empty($line)) continue;
        list($key, $value) = explode(':', $line, 2);
        $key = trim($key);
        $value = trim($value);

        // Remove aspas
        $value = trim($value, "' \t\n\r\0\x0B");

        // Processa arrays
        if (strpos($value, '[') === 0 && strpos($value, ']') === strlen($value) - 1) {
            $value = array_map('trim', explode(',', substr($value, 1, -1)));
        }

        $metadata[$key] = $value;
    }

    // Gera o slug do título
    $slug = strtolower($metadata['title']);
    $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
    $slug = trim($slug, '-');

    return [
        'title' => $metadata['title'],
        'date' => $metadata['date'],
        'categories' => $metadata['categories'],
        'tags' => $metadata['tags'],
        'author' => $metadata['author'],
        'image' => $metadata['image'],
        'excerpt' => $metadata['excerpt'],
        'content' => $content,
        'slug' => $slug
    ];
}

// Lê todos os arquivos Markdown na pasta
$posts = [];
$files = glob(__DIR__ . '/*.md');
foreach ($files as $file) {
    $post = readMarkdownFile($file);
    if ($post) {
        $posts[] = $post;
    }
}

// Ordena por data (mais recente primeiro)
usort($posts, function($a, $b) {
    return strtotime($b['date']) - strtotime($a['date']);
});

echo json_encode($posts);