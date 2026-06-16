"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Trip, TripFilter, TripFormData, TripModalMode, TripSummary } from "@/types/trip";
import { DEFAULT_TRIP_SUMMARY } from "@/constants/trip";
import { tripService } from "@/services/trip.service";
import { emptyFormData, tripToFormData } from "@/utils/format";
import { validateTripForm } from "@/utils/form";

interface TripsContextValue {
  trips: Trip[];
  summary: TripSummary;
  filter: TripFilter;
  loading: boolean;
  error: string | null;
  modalOpen: boolean;
  modalMode: TripModalMode;
  editingTrip: Trip | null;
  formData: TripFormData;
  formError: string | null;
  saving: boolean;
  deletingTrip: Trip | null;
  deleting: boolean;
  togglingId: string | null;
  setFilter: (filter: TripFilter) => void;
  setFormData: (data: TripFormData) => void;
  setDeletingTrip: (trip: Trip | null) => void;
  openAddModal: () => void;
  openEditModal: (trip: Trip) => void;
  closeModal: () => void;
  handleSubmit: () => Promise<void>;
  handleDelete: () => Promise<void>;
  handleToggleMemorable: (trip: Trip) => Promise<void>;
  retryLoad: () => void;
}

const TripsContext = createContext<TripsContextValue | null>(null);

export function TripsProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [summary, setSummary] = useState<TripSummary>(DEFAULT_TRIP_SUMMARY);
  const [filter, setFilter] = useState<TripFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<TripModalMode>("add");
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [formData, setFormData] = useState<TripFormData>(emptyFormData());
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [deletingTrip, setDeletingTrip] = useState<Trip | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadTrips = useCallback(async (memorableOnly = false) => {
    try {
      setError(null);
      const data = await tripService.fetchAll(memorableOnly);
      setTrips(data.trips);
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load trips");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadTrips(filter === "memorable");
  }, [filter, loadTrips]);

  const openAddModal = useCallback(() => {
    setModalMode("add");
    setEditingTrip(null);
    setFormData(emptyFormData());
    setFormError(null);
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((trip: Trip) => {
    setModalMode("edit");
    setEditingTrip(trip);
    setFormData(tripToFormData(trip));
    setFormError(null);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    if (saving) return;
    setModalOpen(false);
    setFormError(null);
  }, [saving]);

  const handleSubmit = useCallback(async () => {
    setFormError(null);

    const validationError = validateTripForm(formData);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSaving(true);
    try {
      if (modalMode === "add") {
        await tripService.create(formData);
      } else if (editingTrip) {
        await tripService.update(editingTrip.id, formData);
      }
      setModalOpen(false);
      await loadTrips(filter === "memorable");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save trip");
    } finally {
      setSaving(false);
    }
  }, [formData, modalMode, editingTrip, filter, loadTrips]);

  const handleDelete = useCallback(async () => {
    if (!deletingTrip) return;
    setDeleting(true);
    try {
      await tripService.delete(deletingTrip.id);
      setDeletingTrip(null);
      await loadTrips(filter === "memorable");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete trip");
      setDeletingTrip(null);
    } finally {
      setDeleting(false);
    }
  }, [deletingTrip, filter, loadTrips]);

  const handleToggleMemorable = useCallback(
    async (trip: Trip) => {
      setTogglingId(trip.id);
      try {
        await tripService.toggleMemorable(trip);
        await loadTrips(filter === "memorable");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update trip");
      } finally {
        setTogglingId(null);
      }
    },
    [filter, loadTrips]
  );

  const retryLoad = useCallback(() => {
    setLoading(true);
    loadTrips(filter === "memorable");
  }, [filter, loadTrips]);

  const value = useMemo<TripsContextValue>(
    () => ({
      trips,
      summary,
      filter,
      loading,
      error,
      modalOpen,
      modalMode,
      editingTrip,
      formData,
      formError,
      saving,
      deletingTrip,
      deleting,
      togglingId,
      setFilter,
      setFormData,
      setDeletingTrip,
      openAddModal,
      openEditModal,
      closeModal,
      handleSubmit,
      handleDelete,
      handleToggleMemorable,
      retryLoad,
    }),
    [
      trips,
      summary,
      filter,
      loading,
      error,
      modalOpen,
      modalMode,
      editingTrip,
      formData,
      formError,
      saving,
      deletingTrip,
      deleting,
      togglingId,
      openAddModal,
      openEditModal,
      closeModal,
      handleSubmit,
      handleDelete,
      handleToggleMemorable,
      retryLoad,
    ]
  );

  return <TripsContext.Provider value={value}>{children}</TripsContext.Provider>;
}

export function useTripsContext() {
  const context = useContext(TripsContext);
  if (!context) {
    throw new Error("useTripsContext must be used within a TripsProvider");
  }
  return context;
}
