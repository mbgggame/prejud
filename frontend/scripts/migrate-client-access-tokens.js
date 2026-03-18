/**
 * MIGRATE CLIENT ACCESS TOKENS
 * 
 * Script temporário para migrar agreements legados sem clientAccessToken.
 * 
 * INSTRUÇÕES DE USO:
 * 
 * 1. SERVICE ACCOUNT:
 *    - Baixe o service account JSON do Firebase Console
 *    - Salve em: C:\prejud-saas-new\frontend\scripts\service-account.json
 *    - NUNCA commite este arquivo no git
 * 
 * 2. INSTALAR DEPENDÊNCIA:
 *    cd C:\prejud-saas-new\frontend
 *    npm install firebase-admin
 * 
 * 3. RODAR EM MODO DRY-RUN (padrão - apenas visualiza):
 *    node scripts\migrate-client-access-tokens.js
 * 
 * 4. RODAR MIGRAÇÃO REAL (após aprovação do dry-run):
 *    - Edite este arquivo: altere DRY_RUN = true para DRY_RUN = false
 *    - Salve o arquivo
 *    - Execute: node scripts\migrate-client-access-tokens.js
 * 
 * 5. VERIFICAR RESULTADO:
 *    - Confira os logs de totais
 *    - Verifique os exemplos listados
 *    - Em caso de erro, o batch NÃO commita alterações parciais
 * 
 * SEGURANÇA:
 * - Script é idempotente: rodar múltiplas vezes não duplica tokens
 * - Batch commits a cada 500 updates para evitar timeouts
 * - DRY_RUN padrão impede alterações acidentais
 */

const admin = require('firebase-admin');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURAÇÃO - ALTERAR APENAS ESTA LINHA PARA MIGRAÇÃO REAL
// ============================================================================

const DRY_RUN = false; // true = apenas lista, false = executa migração

// ============================================================================
// INICIALIZAÇÃO FIREBASE ADMIN
// ============================================================================

const serviceAccountPath = path.join(__dirname, 'service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ ERRO: Arquivo service-account.json não encontrado!');
  console.error('   Caminho esperado:', serviceAccountPath);
  console.error('   Baixe o service account no Firebase Console > Configurações > Contas de serviço');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'prejud-saas'
});

const db = admin.firestore();

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

function generateToken() {
  return crypto.randomUUID();
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  console.log('  ' + title);
  console.log('='.repeat(60));
}

// ============================================================================
// MIGRAÇÃO PRINCIPAL
// ============================================================================

async function migrateClientAccessTokens() {
  const startTime = Date.now();
  
  logSection('INICIANDO MIGRAÇÃO');
  console.log('Modo DRY_RUN:', DRY_RUN ? '✅ SIM (apenas visualização)' : '⚠️  NÃO (migração real)');
  console.log('Project ID: prejud-saas');
  console.log('Collection: agreements');
  
  try {
    // Estatísticas
    const stats = {
      totalRead: 0,
      withoutToken: 0,
      withToken: 0,
      wouldMigrate: 0,
      migrated: 0,
      skipped: 0,
      errors: 0,
      examples: []
    };

    // Buscar todos os agreements
    console.log('\n📖 Lendo collection "agreements"...');
    const snapshot = await db.collection('agreements').get();
    
    stats.totalRead = snapshot.size;
    console.log(`   Total de documentos lidos: ${stats.totalRead}`);

    // Separar documentos sem token
    const docsToMigrate = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const hasToken = data.clientAccessToken && typeof data.clientAccessToken === 'string';
      
      if (hasToken) {
        stats.withToken++;
        stats.skipped++;
      } else {
        stats.withoutToken++;
        docsToMigrate.push({
          id: doc.id,
          protocol: data.protocol || 'N/A',
          data: data
        });
      }
    });

    stats.wouldMigrate = docsToMigrate.length;
    
    console.log(`\n📊 ESTATÍSTICAS INICIAIS:`);
    console.log(`   Com clientAccessToken:    ${stats.withToken}`);
    console.log(`   Sem clientAccessToken:    ${stats.withoutToken}`);
    console.log(`   ${DRY_RUN ? 'Seriam migrados' : 'Serão migrados'}:          ${stats.wouldMigrate}`);

    // Coletar exemplos (até 10)
    if (docsToMigrate.length > 0) {
      console.log(`\n📋 EXEMPLOS (até 10):`);
      stats.examples = docsToMigrate.slice(0, 10).map(d => ({
        id: d.id,
        protocol: d.protocol
      }));
      
      stats.examples.forEach((ex, i) => {
        console.log(`   ${i + 1}. ID: ${ex.id} | Protocolo: ${ex.protocol}`);
      });
      
      if (docsToMigrate.length > 10) {
        console.log(`   ... e mais ${docsToMigrate.length - 10} documentos`);
      }
    }

    // Se for DRY_RUN, termina aqui
    if (DRY_RUN) {
      logSection('DRY-RUN CONCLUÍDO');
      console.log('✅ Nenhuma alteração foi feita no banco de dados.');
      console.log('👆 Para executar a migração real:');
      console.log('   1. Edite este arquivo');
      console.log('   2. Altere DRY_RUN = true para DRY_RUN = false');
      console.log('   3. Salve e execute novamente');
      return;
    }

    // MIGRAÇÃO REAL
    logSection('EXECUTANDO MIGRAÇÃO REAL');
    
    if (docsToMigrate.length === 0) {
      console.log('✅ Nenhum documento precisa ser migrado.');
      return;
    }

    // Processar em batches de 500 (limite do Firestore)
    const BATCH_SIZE = 500;
    let batch = db.batch();
    let batchCount = 0;
    let totalBatches = 0;
    let processedCount = 0;

    for (let i = 0; i < docsToMigrate.length; i++) {
      const docInfo = docsToMigrate[i];
      const docRef = db.collection('agreements').doc(docInfo.id);
      const newToken = generateToken();
      
      batch.update(docRef, {
        clientAccessToken: newToken,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      batchCount++;
      processedCount++;
      
      // Commit quando atingir o limite do batch ou último documento
      if (batchCount === BATCH_SIZE || i === docsToMigrate.length - 1) {
        try {
          await batch.commit();
          totalBatches++;
          console.log(`   ✅ Batch ${totalBatches} commitado (${batchCount} docs)`);
          stats.migrated += batchCount;
        } catch (error) {
          console.error(`   ❌ Erro no batch ${totalBatches + 1}:`, error.message);
          stats.errors += batchCount;
        }
        
        // Resetar batch
        batch = db.batch();
        batchCount = 0;
      }
    }

    // Resumo final
    logSection('MIGRAÇÃO CONCLUÍDA');
    console.log(`⏱️  Tempo total: ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
    console.log(`📊 RESUMO FINAL:`);
    console.log(`   Total lidos:        ${stats.totalRead}`);
    console.log(`   Já tinham token:    ${stats.withToken} (pulados)`);
    console.log(`   Migrados com sucesso: ${stats.migrated}`);
    console.log(`   Erros:              ${stats.errors}`);
    
    if (stats.examples.length > 0) {
      console.log(`\n📋 EXEMPLOS MIGRADOS:`);
      stats.examples.forEach((ex, i) => {
        console.log(`   ${i + 1}. ID: ${ex.id} | Protocolo: ${ex.protocol}`);
      });
    }

    if (stats.errors > 0) {
      console.log(`\n⚠️  ATENÇÃO: ${stats.errors} documentos falharam. Verifique os logs acima.`);
      process.exit(1);
    } else {
      console.log(`\n✅ Migração concluída com sucesso!`);
    }

  } catch (error) {
    console.error('\n❌ ERRO FATAL:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Encerrar conexão
    await admin.app().delete();
  }
}

// Executar
migrateClientAccessTokens();
