# Girginler Sürücü Kursu - Yerel Web Sunucusu (Zero Dependencies)
# Standart Windows PowerShell .NET HttpListener ile çalışır.

$port = 3000
$prefix = "http://localhost:$port/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host " [GİRGİNLER SÜRÜCÜ KURSU] 3D Web Sitesi Başlatıldı!" -ForegroundColor Green
    Write-Host " Yerel Adres: $prefix" -ForegroundColor Yellow
    Write-Host " Tarayıcınızda açmak için Ctrl+Click yapabilir veya" -ForegroundColor White
    Write-Host " Start-Process '$prefix' komutunu çalıştırabilirsiniz." -ForegroundColor White
    Write-Host " Çıkış için: Ctrl + C" -ForegroundColor Gray
    Write-Host "==========================================================" -ForegroundColor Cyan

    # Tarayıcıyı otomatik aç
    Start-Process $prefix

    $baseDir = $PSScriptRoot

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $urlPath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($urlPath)) {
            $urlPath = "index.html"
        }

        $filePath = Join-Path $baseDir $urlPath

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mimeType = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".svg"  { "image/svg+xml" }
                default { "application/octet-stream" }
            }

            $response.ContentType = $mimeType
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $notFound = [System.Text.Encoding]::UTF8.GetBytes("404 - Dosya Bulunamadı")
            $response.OutputStream.Write($notFound, 0, $notFound.Length)
        }

        $response.OutputStream.Close()
    }
} finally {
    $listener.Stop()
    $listener.Close()
}
