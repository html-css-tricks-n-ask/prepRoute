import { useMemo, memo, useState, useEffect, useCallback } from "react";
import { formatDate } from "../../../utils/formatters";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import Button from "../../../components/common/Button";

// ─── Mobile breakpoint hook ───────────────────────────────────────────────────
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < breakpoint,
  );

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const onChange = (e) => setIsMobile(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [breakpoint]);

  return isMobile;
}

// ─── Action buttons (shared between table cell and mobile card) ───────────────
function TestActions({ test, navigate, handleDelete, isDeleting }) {
  return (
    <div className="test-card-actions">
      {/* View / Preview */}
      <Button
        variant="secondary"
        className="btn-icon test-card-btn"
        title="View & Preview"
        onClick={() => navigate(`/test/${test.id}/preview`)}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </Button>

      {/* Edit (locked when live) */}
      {test.status !== "live" ? (
        <Button
          variant="secondary"
          className="btn-icon test-card-btn"
          title="Edit Test Details"
          onClick={() => navigate(`/test/edit/${test.id}`)}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--primary)" }}
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </Button>
      ) : (
        <Button
          variant="secondary"
          className="btn-icon test-card-btn"
          title="Edit locked (Published)"
          disabled
          style={{ opacity: 0.25, cursor: "not-allowed" }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </Button>
      )}

      {/* Delete */}
      <Button
        variant="danger"
        className="btn-icon test-card-btn"
        title="Delete Test"
        onClick={() => handleDelete(test.id, test.name)}
        disabled={isDeleting}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </Button>
    </div>
  );
}

// ─── Single mobile card ───────────────────────────────────────────────────────
function TestCard({ test, navigate, handleDelete, isDeleting }) {
  return (
    <div className="test-mobile-card">
      {/* Header: name + status */}
      <div className="test-card-header">
        <span className="test-card-name" title={test.name}>
          {test.name}
        </span>
        <span className={`badge badge-${test.status || "draft"}`}>
          {test.status || "draft"}
        </span>
      </div>

      {/* Subject badge */}
      <div className="test-card-subject">
        <span className="test-card-subject-badge">{test.subject}</span>
      </div>

      {/* Metadata row */}
      <dl className="test-card-meta">
        <div className="test-card-meta-item">
          <dt>Questions</dt>
          <dd>{test.total_questions || 0} Qs</dd>
        </div>
        <div className="test-card-meta-item">
          <dt>Duration</dt>
          <dd>{test.total_time || 0} mins</dd>
        </div>
        <div className="test-card-meta-item">
          <dt>Created</dt>
          <dd>{formatDate(test.created_at)}</dd>
        </div>
      </dl>

      {/* Footer: actions */}
      <div className="test-card-footer">
        <TestActions
          test={test}
          navigate={navigate}
          handleDelete={handleDelete}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
}

// ─── Mobile card list with client-side pagination ─────────────────────────────
const MOBILE_PAGE_SIZE = 8;

function MobileCardList({ filteredTests, navigate, handleDelete, isDeleting }) {
  const [page, setPage] = useState(0);
  const totalItems = filteredTests.length;
  const totalPages = Math.ceil(totalItems / MOBILE_PAGE_SIZE);
  const fromItem = totalItems === 0 ? 0 : page * MOBILE_PAGE_SIZE + 1;
  const toItem = Math.min((page + 1) * MOBILE_PAGE_SIZE, totalItems);
  const pageTests = filteredTests.slice(
    page * MOBILE_PAGE_SIZE,
    (page + 1) * MOBILE_PAGE_SIZE,
  );

  // Reset to page 0 whenever data changes
  useEffect(() => setPage(0), [filteredTests]);

  const prev = useCallback(() => setPage((p) => Math.max(0, p - 1)), []);
  const next = useCallback(
    () => setPage((p) => Math.min(totalPages - 1, p + 1)),
    [totalPages],
  );

  return (
    <div className="test-mobile-list">
      {pageTests.map((test) => (
        <TestCard
          key={test.id}
          test={test}
          navigate={navigate}
          handleDelete={handleDelete}
          isDeleting={isDeleting}
        />
      ))}

      {/* Pagination footer — same visual as desktop */}
      <div className="table-pagination-footer test-mobile-pagination">
        <div className="table-pagination-info">
          Showing{" "}
          <strong>
            {fromItem}–{toItem}
          </strong>{" "}
          of <strong>{totalItems}</strong> tests
        </div>
        <div className="table-pagination-actions">
          <Button
            variant="secondary"
            className="table-pagination-btn"
            onClick={prev}
            disabled={page === 0}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            className="table-pagination-btn"
            onClick={next}
            disabled={page >= totalPages - 1}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main TestsTable component ────────────────────────────────────────────────
function TestsTable({ filteredTests, handleDelete, isDeleting, navigate }) {
  const isMobile = useIsMobile();

  // TanStack Table columns — memoized, rebuilt only when handlers change
  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Test Name",
        cell: (info) => {
          const val = info.getValue() || "";
          return (
            <span
              title={val}
              style={{
                fontWeight: 600,
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {val}
            </span>
          );
        },
      },
      {
        accessorKey: "subject",
        header: "Subject",
        cell: (info) => (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "3px 8px",
              background: "var(--primary-glow)",
              border: "1px solid var(--border-color)",
              borderRadius: "4px",
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "var(--primary)",
              letterSpacing: "0.02em",
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => {
          const status = info.getValue() || "draft";
          return <span className={`badge badge-${status}`}>{status}</span>;
        },
      },
      {
        accessorKey: "total_questions",
        header: "Questions",
        meta: { align: "center" },
        cell: (info) => `${info.getValue() || 0} Qs`,
      },
      {
        accessorKey: "total_time",
        header: "Duration",
        meta: { align: "center" },
        cell: (info) => `${info.getValue() || 0} mins`,
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: (info) => formatDate(info.getValue()),
      },
      {
        id: "actions",
        header: () => "Actions",
        meta: { align: "right" },
        cell: ({ row }) => {
          const test = row.original;
          return (
            <div className="table-actions">
              <TestActions
                test={test}
                navigate={navigate}
                handleDelete={handleDelete}
                isDeleting={isDeleting}
              />
            </div>
          );
        },
      },
    ],
    [navigate, handleDelete, isDeleting],
  );

  const table = useReactTable({
    data: filteredTests,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  const pageSize = table.getState().pagination.pageSize;
  const pageIndex = table.getState().pagination.pageIndex;
  const totalItems = filteredTests.length;
  const fromItem = totalItems === 0 ? 0 : pageIndex * pageSize + 1;
  const toItem = Math.min((pageIndex + 1) * pageSize, totalItems);
  const emptyRowsCount = pageSize - table.getRowModel().rows.length;

  const colStyles = useMemo(
    () => ({
      name: {
        width: "14.28%",
        minWidth: "140px",
      },
      subject: {
        width: "14.28%",
        minWidth: "140px",
      },
      status: {
        width: "14.28%",
        minWidth: "140px",
        textAlign: "center",
      },
      total_questions: {
        width: "14.28%",
        minWidth: "140px",
        textAlign: "center",
      },
      total_time: {
        width: "14.28%",
        minWidth: "140px",
        textAlign: "center",
      },
      created_at: {
        width: "14.28%",
        minWidth: "140px",
      },
      actions: {
        width: "14.28%",
        minWidth: "140px",
        textAlign: "right",
      },
    }),
    [],
  );

  const getColStyle = (columnId) => colStyles[columnId] ?? {};

  // ── Mobile: card list ──────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <MobileCardList
        filteredTests={filteredTests}
        navigate={navigate}
        handleDelete={handleDelete}
        isDeleting={isDeleting}
      />
    );
  }

  // ── Desktop / Tablet: TanStack table ──────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div className="table-container table-container-with-pagination">
        <table className="table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} style={getColStyle(header.column.id)}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} style={getColStyle(cell.column.id)}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {emptyRowsCount > 0 &&
              Array.from({ length: emptyRowsCount }).map((_, index) => (
                <tr key={`empty-${index}`} className="table-placeholder-row">
                  {columns.map((col, cellIndex) => {
                    const colId = col.accessorKey || col.id;
                    return (
                      <td
                        key={`empty-cell-${cellIndex}`}
                        style={getColStyle(colId)}
                      >
                        &nbsp;
                      </td>
                    );
                  })}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className="table-pagination-footer">
        <div className="table-pagination-info">
          Showing{" "}
          <strong>
            {fromItem}–{toItem}
          </strong>{" "}
          of <strong>{totalItems}</strong> tests
        </div>
        <div className="table-pagination-actions">
          <Button
            variant="secondary"
            className="table-pagination-btn"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            className="table-pagination-btn"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export default memo(TestsTable);
