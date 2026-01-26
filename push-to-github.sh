#!/bin/bash

# AI Document Tool - GitHub Push Script
# This script will help you push the repository to GitHub

echo "🚀 AI Document Tool - GitHub Push Helper"
echo "========================================"
echo ""

# Check if repository exists on GitHub
echo "📋 Step 1: Create GitHub Repository"
echo "Please go to: https://github.com/new"
echo "Repository name: ai-document-tool"
echo "Description: AI-powered document tool with multi-folder indexing, search, translation, and summarization"
echo "Visibility: Choose Public or Private"
echo "❌ DO NOT initialize with README, .gitignore, or license"
echo ""
read -p "Press Enter after you've created the repository on GitHub..."

echo ""
echo "🔗 Step 2: Setting up remote"
git remote remove origin 2>/dev/null
git remote add origin https://github.com/hansb001/ai-document-tool.git

echo ""
echo "📤 Step 3: Pushing to GitHub"
echo "You may be asked for your GitHub username and password/token"
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Success! Your repository is now on GitHub!"
    echo "🌐 View it at: https://github.com/hansb001/ai-document-tool"
else
    echo ""
    echo "❌ Push failed. This might be because:"
    echo "1. The repository doesn't exist on GitHub yet"
    echo "2. Authentication failed"
    echo ""
    echo "💡 Try these solutions:"
    echo ""
    echo "Option A: Use Personal Access Token"
    echo "1. Go to: https://github.com/settings/tokens"
    echo "2. Generate new token (classic) with 'repo' scope"
    echo "3. Use the token as your password when pushing"
    echo ""
    echo "Option B: Use SSH"
    echo "1. Generate SSH key: ssh-keygen -t ed25519 -C 'your_email@example.com'"
    echo "2. Add to GitHub: https://github.com/settings/keys"
    echo "3. Change remote: git remote set-url origin git@github.com:hansb001/ai-document-tool.git"
    echo "4. Push again: git push -u origin main"
fi