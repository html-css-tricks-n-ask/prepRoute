import React, { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import Button from "../../../components/common/Button";

export default function TestsTable({
  filteredTests,
  handleDelete,
  isDeleting,
  navigate,
}) {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // TanStack Table columns definition memoized
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
                width: "100%",
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
              padding: "0.25rem 0.5rem",
              background: "var(--primary-glow)",
              border: "1px solid var(--border-color)",
              borderRadius: "4px",
              fontSize: "0.8rem",
              fontWeight: 500,
              color: "var(--primary)",
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
        cell: (info) => `${info.getValue() || 0} Qs`,
      },
      {
        accessorKey: "total_time",
        header: "Duration",
        cell: (info) => `${info.getValue() || 0} mins`,
      },
      {
        accessorKey: "created_at",
        header: "Created Date",
        cell: (info) => formatDate(info.getValue()),
      },
      {
        id: "actions",
        header: () => <div style={{ textAlign: "right" }}>Actions</div>,
        cell: ({ row }) => {
          const test = row.original;
          return (
            <div
              className="table-actions"
              style={{ justifyContent: "flex-end" }}
            >
              <Button
                variant="secondary"
                className="btn-icon"
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
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </Button>

              {test.status !== "live" ? (
                <Button
                  variant="secondary"
                  className="btn-icon"
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
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  className="btn-icon"
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
                    <rect
                      x="3"
                      y="11"
                      width="18"
                      height="11"
                      rx="2"
                      ry="2"
                    ></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </Button>
              )}

              <Button
                variant="danger"
                className="btn-icon"
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
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </Button>
            </div>
          );
        },
      },
    ],
    [navigate, handleDelete, isDeleting],
  );

  // TanStack Table Instance
  const table = useReactTable({
    data: filteredTests,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 8,
      },
    },
  });

  const pageSize = table.getState().pagination.pageSize;
  const pageIndex = table.getState().pagination.pageIndex;
  const totalItems = filteredTests.length;
  const fromItem = totalItems === 0 ? 0 : pageIndex * pageSize + 1;
  const toItem = Math.min((pageIndex + 1) * pageSize, totalItems);
  const emptyRowsCount = pageSize - table.getRowModel().rows.length;

  const getColStyle = (columnId) => {
    switch (columnId) {
      case "name":
        return { width: "360px", minWidth: "360px", maxWidth: "360px" };

      case "subject":
        return { width: "160px", minWidth: "160px", maxWidth: "160px" };

      case "status":
        return { width: "140px", minWidth: "140px", maxWidth: "140px" };

      case "total_questions":
        return { width: "140px", minWidth: "140px", maxWidth: "140px" };

      case "total_time":
        return { width: "140px", minWidth: "140px", maxWidth: "140px" };

      case "created_at":
        return { width: "180px", minWidth: "180px", maxWidth: "180px" };

      case "actions":
        return { width: "170px", minWidth: "170px", maxWidth: "170px" };

      default:
        return {};
    }
  };

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
