import ConfirmationModal from '../components/modal/ConfirmationModal';
import { useDashboard } from '../features/dashboard/hooks/useDashboard';
import DashboardFilters from '../features/dashboard/components/DashboardFilters';
import TestsTable from '../features/dashboard/components/TestsTable';
import DashboardSkeleton from '../features/dashboard/components/DashboardSkeleton';
import Button from '../components/common/Button';
import EmptyState from '../components/empty/EmptyState';
import Card from '../components/common/Card';
import PageHeader from '../components/common/PageHeader';
import ErrorBanner from '../components/feedback/ErrorBanner';
import { FiPlus } from 'react-icons/fi';

export default function Dashboard() {
  const {
    navigate,
    tests,
    subjects,
    loading,
    testsError,
    isDeleting,
    searchQuery,
    setSearchQuery,
    subjectFilter,
    setSubjectFilter,
    statusFilter,
    setStatusFilter,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    testToDelete,
    handleDelete,
    handleConfirmDelete,
    filteredTests,
  } = useDashboard();

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

      <PageHeader
        title="Tests Directory"
        subtitle="Create, manage, and publish academic tests"
        action={
          <Button variant="primary" onClick={() => navigate('/test/create')}>
            <FiPlus style={{ marginRight: '6px' }} size={16} />
            Create New Test
          </Button>
        }
      />

      <DashboardFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        subjectFilter={subjectFilter}
        setSubjectFilter={setSubjectFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        subjects={subjects}
      />

      {testsError && (
        <ErrorBanner message="Failed to load tests directory. Please try again later." />
      )}

      {loading ? (
        <DashboardSkeleton />
      ) : filteredTests.length === 0 ? (
        <Card style={{ padding: '64px 32px' }}>
          <EmptyState
            title="No Tests Found"
            description={
              tests.length === 0
                ? 'Get started by creating your very first test. You can add questions and publish it later.'
                : 'No tests match your current search and filter criteria. Try adjusting them.'
            }
            icon={
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="9" y1="15" x2="15" y2="15"></line>
                <line x1="9" y1="19" x2="15" y2="19"></line>
                <line x1="9" y1="11" x2="10" y2="11"></line>
              </svg>
            }
            actionButton={
              tests.length === 0 && (
                <Button onClick={() => navigate('/test/create')}>Create New Test</Button>
              )
            }
          />
        </Card>
      ) : (
        <TestsTable
          filteredTests={filteredTests}
          handleDelete={handleDelete}
          isDeleting={isDeleting}
          navigate={navigate}
        />
      )}
    </div>
  );
}
