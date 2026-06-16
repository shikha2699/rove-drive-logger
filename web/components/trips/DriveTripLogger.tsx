"use client";

import { useTrips } from "@/hooks/useTrips";
import { SummaryCards } from "./SummaryCards";
import { FilterToggle } from "./FilterToggle";
import { TripRow } from "./TripRow";
import { TripModal } from "./TripModal";
import { DeleteDialog } from "./DeleteDialog";
import { EmptyState } from "./EmptyState";

export function DriveTripLogger() {
  const {
    trips,
    summary,
    filter,
    loading,
    error,
    modalOpen,
    modalMode,
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
  } = useTrips();

  return (
    <div className="app">
      <header className="header">
        <div className="header__brand">
          <div className="header__logo">
            <div className="header__logo-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
              </svg>
            </div>
            <h1 className="header__title">Drive Trip Logger</h1>
          </div>
          <p className="header__subtitle">Log your drives. Keep the ones that matter.</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={openAddModal}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add trip
        </button>
      </header>

      {error && (
        <div className="error-banner" role="alert">
          <span>{error}</span>
          <button type="button" onClick={retryLoad}>
            Retry
          </button>
        </div>
      )}

      <SummaryCards summary={summary} />

      <div className="toolbar">
        <FilterToggle value={filter} onChange={setFilter} />
        {!loading && trips.length > 0 && (
          <span className="toolbar__count">
            {trips.length} {trips.length === 1 ? "trip" : "trips"}
          </span>
        )}
      </div>

      {loading ? (
        <div className="state">
          <div className="spinner" aria-hidden="true" />
          <p className="state__text">Loading trips…</p>
        </div>
      ) : trips.length === 0 ? (
        <EmptyState onAddTrip={openAddModal} filterActive={filter === "memorable"} />
      ) : (
        <div className="trip-list">
          {trips.map((trip) => (
            <TripRow
              key={trip.id}
              trip={trip}
              onEdit={openEditModal}
              onDelete={setDeletingTrip}
              onToggleMemorable={handleToggleMemorable}
              togglingId={togglingId}
            />
          ))}
        </div>
      )}

      <TripModal
        open={modalOpen}
        mode={modalMode}
        data={formData}
        onChange={setFormData}
        onClose={closeModal}
        onSubmit={handleSubmit}
        saving={saving}
        error={formError}
      />

      <DeleteDialog
        trip={deletingTrip}
        onConfirm={handleDelete}
        onCancel={() => !deleting && setDeletingTrip(null)}
        deleting={deleting}
      />
    </div>
  );
}
