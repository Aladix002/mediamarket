#!/bin/bash

# Script na spustenie celej aplikacie (backend + frontend)
# Pouzitie: ./start.sh

set -e

# Farba pre output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  MediaMarket - Spustenie aplikacie${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Zisti ci sme v spravnom adresari
if [ ! -f "MediaMarket.sln" ]; then
    echo -e "${YELLOW}Chyba: Script musi byt spusteny z root adresara projektu${NC}"
    exit 1
fi

# Funkcia na ukoncenie procesov pri Ctrl+C
cleanup() {
    echo ""
    echo -e "${YELLOW}Ukoncujem procesy...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM

# 1. Spusti backend
echo -e "${GREEN}[1/2] Spustam backend...${NC}"
cd MediaMarket.API

# Skontroluj ci existuju dependencies
if [ ! -d "bin" ] || [ ! -d "obj" ]; then
    echo -e "${YELLOW}Backend nie je zbuildovany, buildujem...${NC}"
    dotnet build > /dev/null 2>&1
fi

dotnet run > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Pockaj kym backend zacne
echo -e "${YELLOW}Cakam na backend (max 30 sekund)...${NC}"
BACKEND_READY=false
for i in {1..30}; do
    if curl -s http://localhost:5234/swagger > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend bezi na http://localhost:5234${NC}"
        BACKEND_READY=true
        break
    fi
    echo -n "."
    sleep 1
done
echo ""

if [ "$BACKEND_READY" = false ]; then
    echo -e "${YELLOW}⚠ Backend sa nespustil v casovom limite${NC}"
    echo -e "${YELLOW}Skontroluj logy: tail -f backend.log${NC}"
fi

# 2. Spusti frontend
echo ""
echo -e "${GREEN}[2/2] Spustam frontend...${NC}"
cd MediaMarket.Client

# Skontroluj ci su nainstalovane dependencies
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Frontend dependencies nie su nainstalovane, instalujem...${NC}"
    npm install
fi

npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Pockaj kym frontend zacne
echo -e "${YELLOW}Cakam na frontend (max 15 sekund)...${NC}"
FRONTEND_READY=false
for i in {1..15}; do
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Frontend bezi na http://localhost:5173${NC}"
        FRONTEND_READY=true
        break
    fi
    echo -n "."
    sleep 1
done
echo ""

if [ "$FRONTEND_READY" = false ]; then
    echo -e "${YELLOW}⚠ Frontend sa nespustil v casovom limite${NC}"
    echo -e "${YELLOW}Skontroluj logy: tail -f frontend.log${NC}"
    echo -e "${YELLOW}Alebo skus spustit manualne: cd MediaMarket.Client && npm run dev${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Aplikacia je spustena!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Backend:${NC}  http://localhost:5234"
echo -e "${BLUE}Swagger:${NC}  http://localhost:5234/swagger"
echo -e "${BLUE}Frontend:${NC} http://localhost:5173"
echo ""
echo -e "${YELLOW}Logy:${NC}"
echo -e "  Backend:  tail -f backend.log"
echo -e "  Frontend: tail -f frontend.log"
echo ""
echo -e "${YELLOW}Stlac Ctrl+C pre ukoncenie${NC}"
echo ""

# Cakaj na ukoncenie
wait
