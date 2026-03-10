import {
  Agreement,
  TimelineEvent,
  TimelineEventType,
  CreateDeadlineExtensionDTO,
  CreateAmendmentDTO,
  CreateChargeDTO,
  CreateNoticeDTO,
  AgreementStatus,
  ActorType,
} from "@/types/agreement";

import { isValidTransition } from "@/lib/agreement/state-machine";

let mockAgreements: Agreement[] = [
  {
    id: "agr_123",
    title: "Desenvolvimento de Landing Page",
    freelancerId: "freelancer_1",
    freelancerName: "Joao Silva",
    clientName: "Maria Oliveira",
    clientEmail: "maria@empresa.com",
    clientDocument: "123.456.789-00",
    serviceType: "Desenvolvimento de site",
    description: "Criacao de landing page institucional responsiva",
    value: "R$ 3.500,00",
    deadline: "15/04/2024",
    terms: "Entrega em 15 dias uteis. Inclui 2 revisoes.",
    status: "confirmed",
    protocol: "PRC-2024-001234",
    hash: "a3f5c8e9d2b1f4e7...",
    createdAt: "2024-03-01T10:00:00Z",
    updatedAt: "2024-03-01T10:00:00Z",
    timeline: [],
  },
];

let mockEvents: Map<string, TimelineEvent[]> = new Map([
  [
    "agr_123",
    [
      {
        id: "evt_1",
        type: "agreement_created",
        actorType: "freelancer",
        actorName: "Joao Silva",
        createdAt: "2024-03-01T10:00:00Z",
        title: "Acordo criado",
        description: "O acordo foi registrado na plataforma.",
      },
      {
        id: "evt_2",
        type: "invitation_sent",
        actorType: "system",
        actorName: "PreJud",
        createdAt: "2024-03-01T10:05:00Z",
        title: "Convite enviado",
        description: "Um convite foi enviado ao cliente para confirmacao.",
      },
      {
        id: "evt_3",
        type: "client_confirmed",
        actorType: "client",
        actorName: "Maria Oliveira",
        createdAt: "2024-03-02T14:30:00Z",
        title: "Acordo confirmado",
        description: "O cliente confirmou o acordo.",
      },
    ],
  ],
]);

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getCurrentISOString(): string {
  return new Date().toISOString();
}

export const agreementService = {
  async getAgreementById(id: string): Promise<Agreement | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const agreement = mockAgreements.find((a) => a.id === id);
    if (!agreement) return null;
    const events = mockEvents.get(id) || [];
    return { ...agreement, timeline: events };
  },

  async getAgreementEvents(agreementId: string): Promise<TimelineEvent[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockEvents.get(agreementId) || [];
  },

  async updateAgreementStatus(
    agreementId: string,
    newStatus: AgreementStatus,
    actor: "freelancer" | "client"
  ): Promise<void> {
    const agreement = mockAgreements.find((a) => a.id === agreementId);
    if (!agreement) throw new Error("Acordo nao encontrado");

    const isValid = isValidTransition(agreement.status, newStatus, actor);
    if (!isValid) {
      throw new Error(`Transicao invalida: ${agreement.status} -> ${newStatus}`);
    }

    agreement.status = newStatus;
    agreement.updatedAt = getCurrentISOString();
  },

  async addTimelineEvent(
    agreementId: string,
    event: Omit<TimelineEvent, "id" | "createdAt">
  ): Promise<TimelineEvent> {
    const newEvent: TimelineEvent = {
      ...event,
      id: generateId("evt"),
      createdAt: getCurrentISOString(),
    };

    const events = mockEvents.get(agreementId) || [];
    events.push(newEvent);
    mockEvents.set(agreementId, events);

    return newEvent;
  },

  async requestDeadlineExtension(
    agreementId: string,
    data: CreateDeadlineExtensionDTO,
    freelancerName: string
  ): Promise<void> {
    await this.updateAgreementStatus(agreementId, "deadline_extension_pending", "freelancer");
    await this.addTimelineEvent(agreementId, {
      type: "deadline_extension_requested",
      actorType: "freelancer",
      actorName: freelancerName,
      title: "Prorrogacao solicitada",
      description: `Novo prazo proposto: ${data.proposedDeadline}. Motivo: ${data.reason}`,
    });
  },

  async createAmendment(
    agreementId: string,
    data: CreateAmendmentDTO,
    freelancerName: string
  ): Promise<void> {
    await this.updateAgreementStatus(agreementId, "amendment_pending", "freelancer");
    await this.addTimelineEvent(agreementId, {
      type: "amendment_created",
      actorType: "freelancer",
      actorName: freelancerName,
      title: "Aditivo gerado",
      description: data.description,
    });
  },

  async createCharge(
    agreementId: string,
    data: CreateChargeDTO,
    freelancerName: string
  ): Promise<void> {
    await this.updateAgreementStatus(agreementId, "charge_open", "freelancer");
    await this.addTimelineEvent(agreementId, {
      type: "charge_created",
      actorType: "freelancer",
      actorName: freelancerName,
      title: "Cobranca criada",
      description: `Valor: R$ ${data.amount} - Vencimento: ${data.dueDate}`,
    });
  },

  async sendNotice(
    agreementId: string,
    data: CreateNoticeDTO,
    freelancerName: string
  ): Promise<void> {
    await this.updateAgreementStatus(agreementId, "notice_sent", "freelancer");
    await this.addTimelineEvent(agreementId, {
      type: "notice_sent",
      actorType: "freelancer",
      actorName: freelancerName,
      title: "Notificacao enviada",
      description: data.title,
    });
  },

  _resetMock(): void {
    mockEvents.clear();
    mockEvents.set("agr_123", [
      {
        id: "evt_1",
        type: "agreement_created",
        actorType: "freelancer",
        actorName: "Joao Silva",
        createdAt: "2024-03-01T10:00:00Z",
        title: "Acordo criado",
        description: "O acordo foi registrado na plataforma.",
      },
      {
        id: "evt_2",
        type: "invitation_sent",
        actorType: "system",
        actorName: "PreJud",
        createdAt: "2024-03-01T10:05:00Z",
        title: "Convite enviado",
        description: "Um convite foi enviado ao cliente para confirmacao.",
      },
      {
        id: "evt_3",
        type: "client_confirmed",
        actorType: "client",
        actorName: "Maria Oliveira",
        createdAt: "2024-03-02T14:30:00Z",
        title: "Acordo confirmado",
        description: "O cliente confirmou o acordo.",
      },
    ]);
  },
};