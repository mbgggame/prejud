import { setGlobalOptions } from "firebase-functions/v2";
import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// Forçar a mesma região do Firestore (nam5 = northamerica-northeast1)
setGlobalOptions({ 
  maxInstances: 10,
  region: 'northamerica-northeast1' // Mesma região do Firestore
});

export const getFreelancerDashboard = onCall(async (request) => {
  const { freelancerId } = request.data;

  console.log(`[CLOUD FUNCTION] Região: northamerica-northeast1`);
  console.log(`[CLOUD FUNCTION] freelancerId recebido: ${freelancerId}`);

  if (!freelancerId) {
    throw new Error("freelancerId é obrigatório");
  }

  try {
    // Aguardar um pouco para garantir propagação (apenas para teste)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // ============================
    // BUSCAR ACORDOS
    // ============================
    console.log(`[CLOUD FUNCTION] Buscando acordos...`);
    const agreementsSnap = await db
      .collection("agreements")
      .where("freelancerId", "==", freelancerId)
      .get();

    console.log(`[CLOUD FUNCTION] Encontrados: ${agreementsSnap.size}`);

    // Se não encontrou, tentar por createdBy
    if (agreementsSnap.size === 0) {
      console.log(`[CLOUD FUNCTION] Tentando buscar por createdBy...`);
      const byCreator = await db
        .collection("agreements")
        .where("createdBy", "==", freelancerId)
        .get();
      console.log(`[CLOUD FUNCTION] Por createdBy: ${byCreator.size}`);
    }

    let agreements = agreementsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Ordenar manualmente
    agreements.sort((a, b) => {
      const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
      const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    const agreementIds = agreements.map((a: any) => a.id);
    let charges: any[] = [];

    if (agreementIds.length > 0) {
      try {
        const chargesSnap = await db
          .collection("charges")
          .where("agreementId", "in", agreementIds.slice(0, 10))
          .get();
        charges = chargesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      } catch (e) { console.error("[CLOUD FUNCTION] Erro charges:", e); }
    }

    const stats = {
      rascunhos: agreements.filter((a: any) => a.status === "draft").length,
      aguardandoCliente: agreements.filter((a: any) => a.status === "pending_client_confirmation").length,
      ativos: agreements.filter((a: any) => ["confirmed", "charge_open"].includes(a.status)).length,
      cobrancasPendentes: charges.filter((c: any) => c.status === "pending").length,
    };

    return {
      stats: {
        ...stats,
        totalAgreements: agreements.length,
        activeAgreements: stats.ativos,
        pendingConfirmation: stats.aguardandoCliente,
        inDispute: agreements.filter((a: any) => ['in_dispute','contested','charge_contested'].includes(a.status)).length,
        completed: agreements.filter((a: any) => a.status === 'closed').length,
        totalValue: agreements.reduce((sum: number, a: any) => sum + (Number(a.value) || 0), 0),
        pendingValue: charges.filter((c: any) => c.status === 'pending').reduce((sum: number, c: any) => sum + (Number(c.amount) || 0), 0),
        paidValue: charges.filter((c: any) => c.status === 'paid').reduce((sum: number, c: any) => sum + (Number(c.amount) || 0), 0)
      },
      agreements,
      charges,
      historico: [],
      prioridade: stats.aguardandoCliente > 0 ? "Você tem acordos aguardando cliente" : "Tudo sob controle",
    };

  } catch (error: any) {
    console.error("[CLOUD FUNCTION] ERRO FATAL:", error);
    throw new Error(`Falha ao carregar dashboard: ${error.message}`);
  }
});
