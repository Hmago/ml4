#!/bin/bash
cd "$(dirname "$0")"

# Kill any existing server on port 8000
lsof -ti:8000 | xargs kill -9 2>/dev/null

sleep 1
open "http://localhost:8000" 2>/dev/null || xdg-open "http://localhost:8000" 2>/dev/null
python3 -m http.server 8000
