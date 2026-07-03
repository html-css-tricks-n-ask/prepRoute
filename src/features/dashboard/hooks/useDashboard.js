import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  useGetTestsQuery, 
  useGetSubjectsQuery, 
  useDeleteTestMutation 
} from '../../../store/apiSlice';

export function useDashboard() {
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
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    testToDelete,
    handleDelete,
    handleConfirmDelete,
    filteredTests
  };
}
