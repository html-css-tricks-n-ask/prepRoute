import React from 'react';

export default function DashboardFilters({
  searchQuery,
  setSearchQuery,
  subjectFilter,
  setSubjectFilter,
  statusFilter,
  setStatusFilter,
  subjects
}) {
  return (
    <div className="filter-bar mb-5">
      <input
        type="text"
        placeholder="Search tests by name..."
        className="form-control filter-input"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      
      <select
        className="form-control filter-select"
        value={subjectFilter}
        onChange={(e) => setSubjectFilter(e.target.value)}
      >
        <option value="">All Subjects</option>
        {subjects.map(s => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      <select
        className="form-control filter-select"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="">All Statuses</option>
        <option value="draft">Draft</option>
        <option value="live">Live</option>
      </select>
    </div>
  );
}
