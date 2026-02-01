#!/bin/bash

# Skript na generovanie TypeScript API klienta z OpenAPI specifikácie

API_URL="${VITE_API_URL:-http://localhost:5234}"
SWAGGER_URL="${API_URL}/swagger/v1/swagger.json"
OUTPUT_DIR="./src/api/generated"

echo "🚀 Generujem TypeScript API klienta z backendu..."
echo "📍 API URL: $SWAGGER_URL"
echo "📦 Output: $OUTPUT_DIR"
echo ""

# Kontrola, či beží API
if ! curl -s "$SWAGGER_URL" > /dev/null 2>&1; then
    echo "❌ API nie je dostupné na $SWAGGER_URL"
    echo ""
    echo "💡 Skús spustiť backend:"
    echo "   cd ../MediaMarket.API && dotnet run"
    echo ""
    exit 1
fi

# Stiahni OpenAPI JSON
echo "📥 Sťahujem OpenAPI JSON z backendu..."
curl -s "$SWAGGER_URL" > /tmp/swagger.json

if [ ! -s /tmp/swagger.json ]; then
    echo "❌ Nepodarilo sa stiahnuť OpenAPI JSON"
    exit 1
fi

# Generuj TypeScript klienta
echo "⚙️  Generujem TypeScript API klienta..."
echo ""

npx --yes openapi-typescript-codegen --input /tmp/swagger.json --output "$OUTPUT_DIR" --client fetch --name ApiClient --useOptions --useUnionTypes --exportCore true --exportServices true --exportModels true

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ API klient úspešne vygenerovaný!"
    
    # Automaticky vytvor api.ts wrapper (ak neexistuje)
    if [ ! -f "$OUTPUT_DIR/../client.ts" ]; then
        echo "📝 Vytváram client.ts wrapper..."
        cat > "$OUTPUT_DIR/../client.ts" << 'EOF'
/**
 * API Client wrapper pre jednoduchšie použitie
 * 
 * Tento súbor poskytuje konfigurovaný API klient s predvolenými nastaveniami.
 * Importuj tento súbor namiesto priameho importu z generated.
 */

import { ApiClient } from './generated';

// Backend URL - môžeš zmeniť podľa potreby
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5234';

// Vytvor a exportuj konfigurovaný API klient
export const apiClient = new ApiClient({
  BASE: API_BASE_URL,
  // Tu môžeš pridať ďalšie konfigurácie (headers, timeout, atď.)
});

// Re-export všetkých typov pre pohodlie
export * from './generated/models';
export * from './generated';
EOF
        echo "✅ client.ts wrapper vytvorený!"
    else
        echo "ℹ️  client.ts wrapper už existuje, preskakujem..."
    fi
    
    echo ""
    echo "📁 Umiestnenie: $OUTPUT_DIR"
    echo ""
    echo "💡 Použitie:"
    echo "   import { apiClient } from './api/client';"
    echo "   import type { UserResponse } from './api/generated/models';"
    echo ""
else
    echo ""
    echo "❌ Chyba pri generovaní API klienta"
    exit 1
fi
