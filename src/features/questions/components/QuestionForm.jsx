import RichTextEditor from '../../../components/forms/RichTextEditor';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';

export default function QuestionForm({
  register,
  handleSubmit,
  setValue,
  reset,
  errors,
  questionValue,
  explanationValue,
  option1,
  option2,
  option3,
  option4,
  correctOption,
  questionTopic,
  questionSubTopic,
  difficulty,
  testTopics,
  testSubTopics,
  editingIndex,
  setEditingIndex,
  submitting,
  handleAddQuestion
}) {
  const errorsList = Object.values(errors).map(e => e.message);

  return (
    <div id="question-form-container" className="card question-builder-pane">
      <h3 className="card-title mb-4">
        {editingIndex !== null ? '📝 Edit Question details' : '➕ Question Builder'}
      </h3>

      {errorsList.length > 0 && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--danger)',
          padding: '12px',
          fontSize: '14px',
          marginBottom: '16px'
        }}>
          <ul style={{ paddingLeft: '16px', margin: 0 }}>
            {errorsList.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Scrollable form body */}
      <div className="question-builder-scroll">

      {/* Question text rich editor */}
      <RichTextEditor 
        value={questionValue}
        onChange={val => setValue('question', val)}
        label="Question Text"
        placeholder="Type question content here..."
        required={true}
        disabled={submitting}
      />

      {/* Options input */}
      <div className="form-row-grid-2" style={{ marginTop: '16px' }}>
        <Input
          label="Option 1"
          placeholder="Option 1"
          disabled={submitting}
          error={errors.option1?.message}
          {...register('option1')}
          style={{ marginBottom: 0 }}
        />
        <Input
          label="Option 2"
          placeholder="Option 2"
          disabled={submitting}
          error={errors.option2?.message}
          {...register('option2')}
          style={{ marginBottom: 0 }}
        />
      </div>

      <div className="form-row-grid-2">
        <Input
          label="Option 3"
          placeholder="Option 3"
          disabled={submitting}
          error={errors.option3?.message}
          {...register('option3')}
          style={{ marginBottom: 0 }}
        />
        <Input
          label="Option 4"
          placeholder="Option 4"
          disabled={submitting}
          error={errors.option4?.message}
          {...register('option4')}
          style={{ marginBottom: 0 }}
        />
      </div>

      {/* Correct Option */}
      <div className="form-group">
        <label className="form-label">
          Correct Answer Option
        </label>
        <select
          className="form-control"
          value={correctOption}
          onChange={(e) => setValue('correct_option', e.target.value)}
          disabled={submitting}
        >
          <option value="option1">Option 1: {option1 || '(Empty)'}</option>
          <option value="option2">Option 2: {option2 || '(Empty)'}</option>
          <option value="option3">Option 3: {option3 || '(Empty)'}</option>
          <option value="option4">Option 4: {option4 || '(Empty)'}</option>
        </select>
      </div>

      {/* Optional details */}
      <h4 className="small-text mb-3" style={{ fontWeight: 600, color: 'var(--primary)' }}>
        Optional Question Metadata
      </h4>

      <div className="form-row-grid-2">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Topic</label>
          <select
            className="form-control"
            value={questionTopic}
            onChange={(e) => {
              setValue('topic_id', e.target.value);
              setValue('sub_topic_id', '');
            }}
            disabled={submitting}
          >
            <option value="">-- Select Topic --</option>
            {testTopics.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Sub-topic</label>
          <select
            className="form-control"
            value={questionSubTopic}
            onChange={(e) => setValue('sub_topic_id', e.target.value)}
            disabled={submitting}
          >
            <option value="">-- Select Subtopic --</option>
            {testSubTopics
              .filter(st => !questionTopic || st.topic_id === questionTopic)
              .map(st => (
                <option key={st.id} value={st.id}>{st.name}</option>
              ))
            }
          </select>
        </div>
      </div>

      <div className="form-row-grid-2">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Difficulty</label>
          <select
            className="form-control"
            value={difficulty}
            onChange={(e) => setValue('difficulty', e.target.value)}
            disabled={submitting}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <Input
          label="Media URL"
          placeholder="Image/diagram URL"
          disabled={submitting}
          error={errors.media_url?.message}
          {...register('media_url')}
          style={{ marginBottom: 0 }}
        />
      </div>

      {/* Explanation rich editor */}
      <RichTextEditor 
        value={explanationValue}
        onChange={val => setValue('explanation', val)}
        label="Solution Explanation"
        placeholder="Explain the correct answer steps..."
        required={false}
        disabled={submitting}
      />

      </div>{/* end question-builder-scroll */}

      {/* Pinned submit button at bottom of builder column */}
      <div className="question-builder-actions">
        <Button
          variant="primary"
          style={{ flex: 1 }}
          onClick={handleSubmit(handleAddQuestion)}
          disabled={submitting}
        >
          {editingIndex !== null ? 'Update Question' : 'Add Question'}
        </Button>
        {editingIndex !== null && (
          <Button
            variant="secondary"
            onClick={() => {
              setEditingIndex(null);
              reset();
            }}
            disabled={submitting}
          >
            Cancel Edit
          </Button>
        )}
      </div>
    </div>
  );
}
