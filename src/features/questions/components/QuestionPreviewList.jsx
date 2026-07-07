import Badge from '../../../components/common/Badge';
import EmptyState from '../../../components/empty/EmptyState';
import QuestionPreviewCard from './QuestionPreviewCard';

export default function QuestionPreviewList({
  questionsList,
  handleEditQuestion,
  handleDeleteQuestion,
  allTopics
}) {
  return (
    <div className="card question-list-pane">
      <h3 className="card-title mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <span>Questions List</span>
        <Badge status="live" style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: 'none' }}>
          {questionsList.length} Added
        </Badge>
      </h3>

      {questionsList.length === 0 ? (
        <EmptyState
          title="No questions added yet"
          description="Use the builder on the left to write questions."
          icon={
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
          }
        />
      ) : (
        <div className="question-list-scroll">
          {questionsList.map((q, idx) => (
            <QuestionPreviewCard
              key={idx}
              q={q}
              idx={idx}
              handleEditQuestion={handleEditQuestion}
              handleDeleteQuestion={handleDeleteQuestion}
              allTopics={allTopics}
            />
          ))}
        </div>
      )}
    </div>
  );
}
