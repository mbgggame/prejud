# Fix: Dashboard não mostrava acordos

## Data: 21/03/2026 14:05

## Problema
O container 'Meus acordos' no Dashboard não estava exibindo os acordos criados, 
mesmo estando presentes no Firestore e funcionando o fluxo completo (email, 
aceitação, timeline).

## Causa Root
A Cloud Function 'getFreelancerDashboard' estava sendo usada para buscar os acordos,
mas por algum motivo não estava retornando os dados (possivelmente índice do 
Firestore ou delay na propagação).

## Solução Aplicada
Modificado o hook 'useFreelancerDashboard' para usar a função 'getFreelancerAgreements'
diretamente do cliente Firestore em vez da Cloud Function.

### Arquivos Alterados:
1. frontend/hooks/useFreelancerDashboard.ts
   - Alterado de: getFreelancerDashboardDataV2(freelancerId)
   - Alterado para: getFreelancerAgreements(freelancerId)
   - Adicionados logs de debug para monitoramento

2. frontend/services/dashboardService.ts (já tinha logs de debug)
   - Mantidos logs: [DEBUG] Raw agreements, [DEBUG] Primeiro agreement

## Próximos Passos Recomendados
1. Investigar por que a Cloud Function não retorna dados
2. Verificar se há necessidade de criar índice no Firestore para a query:
   - Collection: agreements
   - Fields: freelancerId (Ascending) + createdAt (Descending)
3. Decidir se mantém a solução atual ou corrige a Cloud Function

## Testado
✅ Acordos aparecem no dashboard
✅ Timeline funciona corretamente
✅ Email de convite enviado
✅ Cliente aceita proposta via link público
