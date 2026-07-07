import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  useGetTestsQuery,
  useGetSubjectsQuery,
  useDeleteTestMutation,
} from '../../../store/apiSlice';
import { useModal } from '../../../hooks/useModal';
import { useDebounce } from '../../../hooks/useDebounce';

export function useDashboard() {
  const navigate = useNavigate();

  const { data: tests = [], isLoading: testsLoading, error: testsError, refetch: refetchTests } = useGetTestsQuery();
  const { data: subjects = [], isLoading: subjectsLoading } = useGetSubjectsQuery();
  const [deleteTest, { isLoading: isDeleting }] = useDeleteTestMutation();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Debounced search avoids filtering on every keystroke
  const debouncedSearch = useDebounce(searchQuery, 250);

  // Delete confirmation modal (replaces manual isOpen + testToDelete state)
  const deleteModal = useModal();

  const handleDelete = useCallback((testId, testName) => {
    deleteModal.open({ id: testId, name: testName });
  }, [deleteModal]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteModal.item) return;
    try {
      await deleteTest(deleteModal.item.id).unwrap();
      toast.success('Test deleted successfully.');
      refetchTests();
      deleteModal.close();
    } catch (err) {
      console.error(err);
      toast.error(err.data?.message || err.message || 'Something went wrong. Please try again.');
    }
  }, [deleteModal, deleteTest, refetchTests]);

  // Client-side filtering — recomputes only when deps change
  const filteredTests = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return tests.filter(test => {
      const matchesSearch =
        test.name.toLowerCase().includes(q) ||
        (test.subject && test.subject.toLowerCase().includes(q));
      const matchesSubject = subjectFilter
        ? test.subject_id === subjectFilter || test.subject === subjectFilter
        : true;
      const matchesStatus = statusFilter ? test.status === statusFilter : true;
      return matchesSearch && matchesSubject && matchesStatus;
    });
  }, [tests, debouncedSearch, subjectFilter, statusFilter]);

  const loading = testsLoading || subjectsLoading;

  return {
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
    // Expose modal state with names matching existing Dashboard.jsx consumers
    isDeleteModalOpen: deleteModal.isOpen,
    setIsDeleteModalOpen: (val) => (val ? deleteModal.open() : deleteModal.close()),
    testToDelete: deleteModal.item,
    handleDelete,
    handleConfirmDelete,
    filteredTests,
  };
}
