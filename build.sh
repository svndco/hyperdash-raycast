#!/bin/bash

# HyperDash Build Script
# Builds the Raycast extension and auto-increments version

set -e  # Exit on error

echo "🔨 Building HyperDASH Raycast Extension..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Auto-increment version (patch version)
echo "📝 Incrementing version..."
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "Current version: $CURRENT_VERSION"

# Split version into parts (e.g., "0.3.0" -> 0, 3, 0)
IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR="${VERSION_PARTS[0]}"
MINOR="${VERSION_PARTS[1]}"
PATCH="${VERSION_PARTS[2]}"

# Increment patch version
NEW_PATCH=$((PATCH + 1))
NEW_VERSION="${MAJOR}.${MINOR}.${NEW_PATCH}"

# Update package.json with new version and version info preference
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json
    sed -i '' "s/\"description\": \"hyperDASH v$CURRENT_VERSION/\"description\": \"hyperDASH v$NEW_VERSION/" package.json
    sed -i '' "s/\"placeholder\": \"v$CURRENT_VERSION\"/\"placeholder\": \"v$NEW_VERSION\"/" package.json
    sed -i '' "s/\"default\": \"$CURRENT_VERSION\"/\"default\": \"$NEW_VERSION\"/" package.json
else
    # Linux
    sed -i "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json
    sed -i "s/\"description\": \"hyperDASH v$CURRENT_VERSION/\"description\": \"hyperDASH v$NEW_VERSION/" package.json
    sed -i "s/\"placeholder\": \"v$CURRENT_VERSION\"/\"placeholder\": \"v$NEW_VERSION\"/" package.json
    sed -i "s/\"default\": \"$CURRENT_VERSION\"/\"default\": \"$NEW_VERSION\"/" package.json
fi

echo "New version: $NEW_VERSION"

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist

# Build the extension
echo "📦 Building extension..."
npm run build

# Verify build output
if [ -f "dist/browse.js" ] && [ -f "dist/projects.js" ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📦 Version: $NEW_VERSION"
    echo ""
    echo "Output files:"
    ls -lh dist/*.js
    echo ""
    echo "📍 Build location: $SCRIPT_DIR/dist"
    echo ""
    echo "To use in Raycast:"
    echo "1. Open Raycast"
    echo "2. Go to Extensions"
    echo "3. Click '+' and 'Add Script Directory'"
    echo "4. Select: $SCRIPT_DIR"
else
    echo "❌ Build failed - output files not found"
    exit 1
fi
