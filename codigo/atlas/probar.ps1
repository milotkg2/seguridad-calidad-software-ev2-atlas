# Pruebas de Atlas contra la API local. Requiere Docker ya levantado.
$ErrorActionPreference = "Stop"
$Base = "http://localhost:3010"
$Ok = 0
$Mal = 0

function Assert-Codigo($Nombre, $Esperado, $Real) {
    if ($Real -eq $Esperado) {
        Write-Host "OK   $Nombre -> HTTP $Real"
        $script:Ok++
    } else {
        Write-Host "FALLO $Nombre -> HTTP $Real (esperado $Esperado)"
        $script:Mal++
    }
}

function Invoke-Atlas($Metodo, $Ruta, $Cuerpo, $Token) {
    $archivo = Join-Path $env:TEMP ("atlas-" + [guid]::NewGuid().ToString() + ".json")
    $salida = Join-Path $env:TEMP ("atlas-out-" + [guid]::NewGuid().ToString() + ".txt")
    $args = @("-s", "-o", $salida, "-w", "%{http_code}", "-X", $Metodo, "$Base$Ruta")
    if ($Token) { $args += @("-H", "Authorization: Bearer $Token") }
    if ($null -ne $Cuerpo) {
        [IO.File]::WriteAllText($archivo, ($Cuerpo | ConvertTo-Json -Compress))
        $args += @("-H", "Content-Type: application/json", "--data-binary", "@$archivo")
    }
    $codigo = & curl.exe @args
    $texto = ""
    if (Test-Path $salida) { $texto = [IO.File]::ReadAllText($salida) }
    Remove-Item $archivo, $salida -ErrorAction SilentlyContinue
    $json = $null
    if ($texto) { try { $json = $texto | ConvertFrom-Json } catch { $json = $null } }
    return @{ Codigo = [int]$codigo; Json = $json; Texto = $texto }
}

Assert-Codigo "Salud" 200 (Invoke-Atlas "GET" "/api/salud" $null $null).Codigo

$admin = Invoke-Atlas "POST" "/api/auth/login" @{ nombre_usuario = "jperez"; password = "Clave#Segura2026" } $null
Assert-Codigo "CP-FUN-01 login jperez" 200 $admin.Codigo
$token = $admin.Json.token

$malo = Invoke-Atlas "POST" "/api/auth/login" @{ nombre_usuario = "jperez"; password = "ClaveIncorrecta" } $null
Assert-Codigo "Login invalido" 401 $malo.Codigo

$editor = Invoke-Atlas "POST" "/api/auth/login" @{ nombre_usuario = "editor1"; password = "Clave#Segura2026" } $null
Assert-Codigo "Login editor" 200 $editor.Codigo
$editorToken = $editor.Json.token

$postEditor = Invoke-Atlas "POST" "/api/empresas/1/clients" @{ nombre = "Cliente no autorizado"; rut = "76.999.999-9" } $editorToken
Assert-Codigo "CP-SEG-01 editor POST" 403 $postEditor.Codigo

$delEditor = Invoke-Atlas "DELETE" "/api/empresas/1/clients/101" $null $editorToken
Assert-Codigo "CP-SEG-01 editor DELETE" 403 $delEditor.Codigo

$lista = Invoke-Atlas "GET" "/api/empresas/1/clients?nombre=Andina" $null $token
Assert-Codigo "Listado Andina" 200 $lista.Codigo

$nuevo = Invoke-Atlas "POST" "/api/empresas/1/clients" @{
    nombre = "Pyme Paso a Paso"
    descripcion = "Caso de baja logica"
    direccion = "Santiago"
    contacto = "qa@paso.cl"
    datosBancarios = "cuenta de prueba"
    rut = "77.222.222-2"
} $token
Assert-Codigo "Crear cliente" 201 $nuevo.Codigo

$baja = Invoke-Atlas "DELETE" "/api/empresas/1/clients/$($nuevo.Json.id)" $null $token
Assert-Codigo "CP-FUN-02 baja logica" 200 $baja.Codigo

$ausente = Invoke-Atlas "GET" "/api/empresas/1/clients/$($nuevo.Json.id)" $null $token
Assert-Codigo "Cliente eliminado" 404 $ausente.Codigo

$contrato = Invoke-Atlas "GET" "/api/clientes/101/contratos" $null $token
Assert-Codigo "Contrato CT-0012" 200 $contrato.Codigo

$png = Join-Path $env:TEMP "CT-0012.png"
[IO.File]::WriteAllBytes($png, [Convert]::FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="))
$subidaCodigo = & curl.exe -s -o "$env:TEMP\atlas-doc.txt" -w "%{http_code}" -X POST "$Base/api/contratos/1/documentos" -H "Authorization: Bearer $token" -F "archivo=@$png;type=image/png"
Assert-Codigo "CP-INT-01 documento" 201 ([int]$subidaCodigo)

$enlace = Invoke-Atlas "POST" "/api/contratos/1/enlace" @{} $token
Assert-Codigo "Enlace temporal" 201 $enlace.Codigo

$audit = Invoke-Atlas "GET" "/api/empresas/1/auditoria" $null $token
Assert-Codigo "RF-6 auditoria" 200 $audit.Codigo

$logout = Invoke-Atlas "POST" "/api/auth/logout" @{ refreshToken = $admin.Json.refreshToken } $token
Assert-Codigo "RF-1.2 logout" 200 $logout.Codigo

Write-Host ""
Write-Host "Resultado: $Ok correctas, $Mal fallidas"
if ($Mal -gt 0) { exit 1 }
