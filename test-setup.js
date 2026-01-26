#!/usr/bin/env node

/**
 * Setup Test Script
 * Verifies that all dependencies and configuration are correct
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing AI Document Tool Setup...\n');

let hasErrors = false;

// Test 1: Check Node.js version
console.log('1️⃣  Checking Node.js version...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion >= 14) {
    console.log(`   ✅ Node.js ${nodeVersion} (OK)\n`);
} else {
    console.log(`   ❌ Node.js ${nodeVersion} (Need v14 or higher)\n`);
    hasErrors = true;
}

// Test 2: Check if node_modules exists
console.log('2️⃣  Checking dependencies...');
if (fs.existsSync(path.join(__dirname, 'node_modules'))) {
    console.log('   ✅ Dependencies installed\n');
} else {
    console.log('   ❌ Dependencies not installed. Run: npm install\n');
    hasErrors = true;
}

// Test 3: Check if .env file exists
console.log('3️⃣  Checking environment configuration...');
if (fs.existsSync(path.join(__dirname, '.env'))) {
    console.log('   ✅ .env file exists');
    
    // Check if API key is set
    require('dotenv').config();
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
        console.log('   ✅ OpenAI API key configured\n');
    } else {
        console.log('   ⚠️  OpenAI API key not set or using default value');
        console.log('   📝 Edit .env and add your API key\n');
        hasErrors = true;
    }
} else {
    console.log('   ❌ .env file not found');
    console.log('   📝 Run: cp .env.example .env\n');
    hasErrors = true;
}

// Test 4: Check directory structure
console.log('4️⃣  Checking directory structure...');
const requiredDirs = [
    'backend',
    'backend/services',
    'frontend',
    'frontend/css',
    'frontend/js',
    'uploads'
];

let allDirsExist = true;
for (const dir of requiredDirs) {
    if (!fs.existsSync(path.join(__dirname, dir))) {
        console.log(`   ❌ Missing directory: ${dir}`);
        allDirsExist = false;
        hasErrors = true;
    }
}

if (allDirsExist) {
    console.log('   ✅ All directories present\n');
}

// Test 5: Check required files
console.log('5️⃣  Checking required files...');
const requiredFiles = [
    'backend/server.js',
    'backend/services/documentService.js',
    'backend/services/aiService.js',
    'frontend/index.html',
    'frontend/css/styles.css',
    'frontend/js/app.js',
    'package.json'
];

let allFilesExist = true;
for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(__dirname, file))) {
        console.log(`   ❌ Missing file: ${file}`);
        allFilesExist = false;
        hasErrors = true;
    }
}

if (allFilesExist) {
    console.log('   ✅ All required files present\n');
}

// Test 6: Try to load required modules
console.log('6️⃣  Checking required npm packages...');
const requiredPackages = [
    'express',
    'cors',
    'multer',
    'pdf-parse',
    'mammoth',
    'openai',
    'dotenv'
];

let allPackagesInstalled = true;
for (const pkg of requiredPackages) {
    try {
        require.resolve(pkg);
    } catch (e) {
        console.log(`   ❌ Missing package: ${pkg}`);
        allPackagesInstalled = false;
        hasErrors = true;
    }
}

if (allPackagesInstalled) {
    console.log('   ✅ All required packages installed\n');
}

// Final result
console.log('═'.repeat(50));
if (hasErrors) {
    console.log('\n❌ Setup incomplete. Please fix the issues above.\n');
    console.log('📖 See QUICKSTART.md for setup instructions\n');
    process.exit(1);
} else {
    console.log('\n✅ Setup complete! You\'re ready to go!\n');
    console.log('🚀 Start the server with: npm start');
    console.log('🌐 Then open: http://localhost:3000\n');
    process.exit(0);
}