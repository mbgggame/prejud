#!/bin/bash
# Script de deploy da Cloud Function corrigida

echo "🚀 Iniciando deploy da Cloud Function..."

cd C:/prejud-saas-new/functions

echo "📦 Instalando dependências..."
npm install

echo "🔨 Compilando TypeScript..."
npm run build

echo "🚀 Deploy para Firebase..."
firebase deploy --only functions:getFreelancerDashboard

echo "✅ Deploy concluído!"
echo ""
echo "📝 Para verificar os logs:"
echo "   firebase functions:log --function getFreelancerDashboard"
