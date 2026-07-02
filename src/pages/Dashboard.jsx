import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';
import { 
  useReactTable, 
  getCoreRowModel, 
  flexRender 
} from '@tanstack/react-table';
import toast from 'react-hot-toast';
import { 
  useGetTestsQuery, 
  useGetSubjectsQuery, 
  useDeleteTestMutation 
} from '../store/apiSlice';
import { FiPlus } from 'react-icons/fi';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import Card from '../components/common/Card';

export default function Dashboard() {
  const navigate = useNavigate();
  
  // RTK Query fetches
  const { data: tests = [], isLoading: testsLoading, error: testsError, refetch: refetchTests } = useGetTestsQuery();
  const { data: subjects = [], isLoading: subjectsLoading } = useGetSubjectsQuery();
  const [deleteTest, { isLoading: isDeleting }] = useDeleteTestMutation();

  // Filter and Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Delete modal state triggers
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState(null);

  const handleDelete = useCallback((testId, testName) => {
    setTestToDelete({ id: testId, name: testName });
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = async () => {
    if (!testToDelete) return;
    try {
      await deleteTest(testToDelete.id).unwrap();
      toast.success('Test deleted successfully.');
      refetchTests();
      setIsDeleteModalOpen(false);
      setTestToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error(err.data?.message || err.message || 'Something went wrong. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  // Client-side filtering logic memoized
  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (test.subject && test.subject.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesSubject = subjectFilter 
        ? test.subject_id === subjectFilter || test.subject === subjectFilter 
        : true;
        
      const matchesStatus = statusFilter ? test.status === statusFilter : true;
      
      return matchesSearch && matchesSubject && matchesStatus;
    });
  }, [tests, searchQuery, subjectFilter, statusFilter]);

  // TanStack Table columns definition memoized
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Test Name',
      cell: (info) => <span style={{ fontWeight: 600 }}>{info.getValue()}</span>,
    },
    {
      accessorKey: 'subject',
      header: 'Subject',
      cell: (info) => (
        <span style={{ 
          padding: '0.25rem 0.5rem', 
          background: 'var(--primary-glow)', 
          border: '1px solid var(--border-color)',
          borderRadius: '4px',
          fontSize: '0.8rem',
          fontWeight: 500,
          color: 'var(--primary)'
        }}>
          {info.getValue()}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (info) => {
        const status = info.getValue() || 'draft';
        return <span className={`badge badge-${status}`}>{status}</span>;
      },
    },
    {
      accessorKey: 'total_questions',
      header: 'Questions',
      cell: (info) => `${info.getValue() || 0} Qs`,
    },
    {
      accessorKey: 'total_time',
      header: 'Duration',
      cell: (info) => `${info.getValue() || 0} mins`,
    },
    {
      accessorKey: 'created_at',
      header: 'Created Date',
      cell: (info) => formatDate(info.getValue()),
    },
    {
      id: 'actions',
      header: () => <div style={{ textAlign: 'right' }}>Actions</div>,
      cell: ({ row }) => {
        const test = row.original;
        return (
          <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
            <Button 
              variant="secondary" 
              className="btn-icon" 
              title="View & Preview"
              onClick={() => navigate(`/test/${test.id}/preview`)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </Button>

            {test.status !== 'live' ? (
              <Button 
                variant="secondary" 
                className="btn-icon" 
                title="Edit Test Details"
                onClick={() => navigate(`/test/edit/${test.id}`)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}>
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
                style={{ opacity: 0.25, cursor: 'not-allowed' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </Button>
          </div>
        );
      },
    }
  ], [navigate, handleDelete, isDeleting]);

  // TanStack Table Instance
  const table = useReactTable({
    data: filteredTests,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const loading = testsLoading || subjectsLoading;

  return (
    <div>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Test"
        message={`Are you sure you want to delete the test "${testToDelete?.name || ''}"?\n\nThis action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
      />
      
      <div className="dashboard-header mb-5">
        <div>
          <h1 className="page-title mb-1">Tests Directory</h1>
          <p className="small-text text-muted" style={{ margin: 0 }}>Create, manage, and publish academic tests</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/test/create')}>
          <FiPlus style={{ marginRight: '6px' }} size={16} />
          Create New Test
        </Button>
      </div>

      {/* Filter and Search Bar */}
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

      {testsError && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-md)',
          color: '#fca5a5',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          Failed to load tests directory. Please try again later.
        </div>
      )}

      {loading ? (
        <Card className="skeleton-pulse">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <div className="skeleton-line" style={{ width: '30%' }}></div>
              <div className="skeleton-line" style={{ width: '15%' }}></div>
              <div className="skeleton-line" style={{ width: '10%' }}></div>
              <div className="skeleton-line" style={{ width: '15%' }}></div>
              <div className="skeleton-line" style={{ width: '15%' }}></div>
              <div className="skeleton-line" style={{ width: '15%', marginLeft: 'auto' }}></div>
            </div>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                <div className="skeleton-line" style={{ width: '30%', height: '20px' }}></div>
                <div className="skeleton-line" style={{ width: '15%' }}></div>
                <div className="skeleton-line" style={{ width: '10%' }}></div>
                <div className="skeleton-line" style={{ width: '15%' }}></div>
                <div className="skeleton-line" style={{ width: '15%' }}></div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                  <div className="skeleton-circle" style={{ width: '32px', height: '32px' }}></div>
                  <div className="skeleton-circle" style={{ width: '32px', height: '32px' }}></div>
                  <div className="skeleton-circle" style={{ width: '32px', height: '32px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : filteredTests.length === 0 ? (
        <Card style={{ padding: '64px 32px' }}>
          <EmptyState
            title="No Tests Found"
            description={tests.length === 0 
              ? "Get started by creating your very first test. You can add questions and publish it later." 
              : "No tests match your current search and filter criteria. Try adjusting them."}
            icon={
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="9" y1="15" x2="15" y2="15"></line>
                <line x1="9" y1="19" x2="15" y2="19"></line>
                <line x1="9" y1="11" x2="10" y2="11"></line>
              </svg>
            }
            actionButton={tests.length === 0 && (
              <Button onClick={() => navigate('/test/create')}>
                Create New Test
              </Button>
            )}
          />
        </Card>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
