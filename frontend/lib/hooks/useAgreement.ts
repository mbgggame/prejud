"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Agreement,
  TimelineEvent,
  CreateDeadlineExtensionDTO,
  CreateAmendmentDTO,
  CreateChargeDTO,
  CreateNoticeDTO,
} from "@/types/agreement";
import { agreementService } from "@/services/agreementService";

interface UseAgreementReturn {
  agreement: Agreement | null;
  events: TimelineEvent[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  requestDeadlineExtension: (data: CreateDeadlineExtensionDTO) => Promise<void>;
  createAmendment: (data: CreateAmendmentDTO) => Promise<void>;
  createCharge: (data: CreateChargeDTO) => Promise<void>;
  sendNotice: (data: CreateNoticeDTO) => Promise<void>;
}

export function useAgreement(agreementId: string): UseAgreementReturn {
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgreement = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [agreementData, eventsData] = await Promise.all([
        agreementService.getAgreementById(agreementId),
        agreementService.getAgreementEvents(agreementId),
      ]);

      if (!agreementData) {
        setError("Acordo nao encontrado");
        return;
      }

      setAgreement(agreementData);
      setEvents(eventsData);
    } catch (err) {
      setError("Erro ao carregar acordo. Tente novamente.");
      console.error("Error fetching agreement:", err);
    } finally {
      setLoading(false);
    }
  }, [agreementId]);

  useEffect(() => {
    fetchAgreement();
  }, [fetchAgreement]);

  const requestDeadlineExtension = async (data: CreateDeadlineExtensionDTO) => {
    if (!agreement) return;
    try {
      await agreementService.requestDeadlineExtension(agreementId, data, agreement.freelancerName);
      await fetchAgreement();
    } catch (err) {
      console.error("Error requesting extension:", err);
      throw err;
    }
  };

  const createAmendment = async (data: CreateAmendmentDTO) => {
    if (!agreement) return;
    try {
      await agreementService.createAmendment(agreementId, data, agreement.freelancerName);
      await fetchAgreement();
    } catch (err) {
      console.error("Error creating amendment:", err);
      throw err;
    }
  };

  const createCharge = async (data: CreateChargeDTO) => {
    if (!agreement) return;
    try {
      await agreementService.createCharge(agreementId, data, agreement.freelancerName);
      await fetchAgreement();
    } catch (err) {
      console.error("Error creating charge:", err);
      throw err;
    }
  };

  const sendNotice = async (data: CreateNoticeDTO) => {
    if (!agreement) return;
    try {
      await agreementService.sendNotice(agreementId, data, agreement.freelancerName);
      await fetchAgreement();
    } catch (err) {
      console.error("Error sending notice:", err);
      throw err;
    }
  };

  return {
    agreement,
    events,
    loading,
    error,
    refresh: fetchAgreement,
    requestDeadlineExtension,
    createAmendment,
    createCharge,
    sendNotice,
  };
}
