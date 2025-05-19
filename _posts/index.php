<?php
header('Content-Type: application/json');

function parseMarkdownFile($file) {
    $content = file_get_contents($file);

    // Extrai o front matter
    preg_match('/^---\s*\n(.*?)\n---\s*\n(.*)/s', $content, $matches);

    if (count($matches) < 3) {
        return null;
    }

    $frontMatter = $matches[1];
    $body = $matches[2];

    // Parse o front matter
    $metadata = [];
    $lines = explode("\n", $frontMatter);
    foreach ($lines as $line) {
        if (empty($line)) continue;

        if (preg_match('/^([^:]+):\s*(.*)$/', $line, $lineMatches)) {
            $key = trim($lineMatches[1]);
            $value = trim($lineMatches[2]);

            // Remove aspas se existirem
            $value = trim($value, "'\"");

            // Parse arrays
            if (strpos($value, '[') === 0) {
                $value = str_replace(['[', ']'], '', $value);
                $value = array_map('trim', explode(',', $value));
            }

            $metadata[$key] = $value;
        }
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
        'content' => $body,
        'slug' => $slug
    ];
}

// Lê todos os arquivos .md do diretório
$posts = [];
$files = glob('*.md');

foreach ($files as $file) {
    $post = parseMarkdownFile($file);
    if ($post) {
        $posts[] = $post;
    }
}

// Ordena por data (mais recente primeiro)
usort($posts, function($a, $b) {
    return strtotime($b['date']) - strtotime($a['date']);
});

echo json_encode($posts);