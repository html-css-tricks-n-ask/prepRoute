import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  useGetTestByIdQuery,
  useFetchQuestionsBulkQuery,
  useUpdateTestMutation,
} from "../store/apiSlice";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import EmptyState from "../components/common/EmptyState";

export default function PreviewPublish() {
  const navigate = useNavigate();
  const { id: testId } = useParams();

  // RTK Query fetches
  const {
    data: test,
    isLoading: testLoading,
    error: testError,
  } = useGetTestByIdQuery(testId);
  const { data: questions = [], isLoading: questionsLoading } =
    useFetchQuestionsBulkQuery(test?.questions, {
      skip: !test?.questions?.length,
    });

  const [updateTest, { isLoading: isPublishing }] = useUpdateTestMutation();
  const [isPublished, setIsPublished] = useState(false);

  const handlePublish = async () => {
    try {
      await updateTest({ id: testId, status: "live" }).unwrap();
      setIsPublished(true);
      toast.success("Test published successfully!");

      // Redirect back to dashboard after a short delay
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      console.error(err);
      toast.error(
        err.data?.message || err.message || "Failed to publish test.",
      );
    }
  };

  const loading = testLoading || questionsLoading;

  if (loading) {
    return (
      <div
        className="skeleton-pulse"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
          maxWidth: "850px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "2rem",
            marginBottom: "1rem",
          }}
        >
          <div
            className="skeleton-line"
            style={{ width: "150px", height: "24px" }}
          ></div>
          <div
            className="skeleton-line"
            style={{ width: "150px", height: "24px" }}
          ></div>
          <div
            className="skeleton-line"
            style={{ width: "150px", height: "24px" }}
          ></div>
        </div>
      </div>
    );
  }

  if (testError || !test) {
    return (
      <div
        style={{
          background: "rgba(239, 68, 68, 0.15)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          borderRadius: "var(--radius-md)",
          color: "#fca5a5",
          padding: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        Failed to load test details for review.
      </div>
    );
  }

  if (isPublished) {
    return (
      <div
        className="success-banner"
        style={{ margin: "4rem auto", maxWidth: "600px", textAlign: "center" }}
      >
        <div
          className="success-icon"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "var(--primary-light)",
            color: "var(--primary)",
            marginBottom: "24px",
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h2
          style={{
            fontSize: "24px",
            fontWeight: 600,
            color: "var(--heading)",
            marginBottom: "8px",
          }}
        >
          Test Published!
        </h2>
        <p
          style={{
            color: "var(--body-text)",
            marginBottom: "24px",
            lineHeight: "1.6",
          }}
        >
          Your test <strong>{test?.name}</strong> is now live. Students can
          access and attempt it.
        </p>
        <span style={{ fontSize: "12px", color: "var(--muted-text)" }}>
          Redirecting back to your dashboard...
        </span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "850px", margin: "0 auto" }}>
      {/* Wizard Steps Indicator */}
      <div className="steps-indicator">
        <div
          className="step-node completed"
          onClick={() => navigate(`/test/edit/${testId}`)}
          style={{ cursor: "pointer" }}
        >
          1<span className="step-label">Test Details</span>
        </div>
        <div
          className="step-node completed"
          onClick={() => navigate(`/test/${testId}/questions`)}
          style={{ cursor: "pointer" }}
        >
          2<span className="step-label">Add Questions</span>
        </div>
        <div className="step-node active">
          3<span className="step-label">Preview & Publish</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Section 1: Overview Summary */}
        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "24px",
              borderBottom: "1px solid var(--border)",
              paddingBottom: "24px",
              marginBottom: "24px",
            }}
          >
            <div>
              <Badge
                status={test.status || "draft"}
                style={{ marginBottom: "8px" }}
              />
              <h1 className="page-title">{test.name}</h1>
              <p
                className="small-text text-muted"
                style={{ margin: "4px 0 0 0" }}
              >
                Subject:{" "}
                <strong style={{ color: "var(--heading)" }}>
                  {test.subject}
                </strong>
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <Button
                variant="secondary"
                onClick={() => navigate(`/test/edit/${testId}`)}
                disabled={isPublishing}
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
                  style={{ marginRight: "6px" }}
                >
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
                Edit Details
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate(`/test/${testId}/questions`)}
                disabled={isPublishing}
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
                  style={{ marginRight: "6px" }}
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Edit Questions
              </Button>
            </div>
          </div>

          <div
            className="form-grid-two-col"
            style={{
              gridTemplateColumns: "repeat(3, 1fr)",
              background: "var(--primary-light)",
              padding: "24px",
              borderRadius: "12px",
              border: "1px solid rgba(91,92,235,0.15)",
            }}
          >
            <div>
              <span
                className="caption text-muted"
                style={{
                  textTransform: "uppercase",
                  fontWeight: 600,
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Parameters
              </span>
              <div
                className="small-text"
                style={{
                  fontWeight: 600,
                  color: "var(--heading)",
                  lineHeight: "1.6",
                }}
              >
                Type:{" "}
                <span
                  style={{
                    color: "var(--primary)",
                    textTransform: "capitalize",
                  }}
                >
                  {test.type}
                </span>{" "}
                <br />
                Difficulty:{" "}
                <span
                  style={{
                    color: "var(--primary)",
                    textTransform: "capitalize",
                  }}
                >
                  {test.difficulty}
                </span>
              </div>
            </div>

            <div>
              <span
                className="caption text-muted"
                style={{
                  textTransform: "uppercase",
                  fontWeight: 600,
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Marking Scheme
              </span>
              <div
                className="small-text"
                style={{
                  fontWeight: 600,
                  color: "var(--heading)",
                  lineHeight: "1.6",
                }}
              >
                Correct:{" "}
                <span style={{ color: "var(--success)" }}>
                  +{test.correct_marks}
                </span>{" "}
                <br />
                Incorrect:{" "}
                <span style={{ color: "var(--danger)" }}>
                  {test.wrong_marks}
                </span>{" "}
                <br />
                Unattempted:{" "}
                <span style={{ color: "var(--body-text)" }}>
                  {test.unattempt_marks}
                </span>
              </div>
            </div>

            <div>
              <span
                className="caption text-muted"
                style={{
                  textTransform: "uppercase",
                  fontWeight: 600,
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Totals Summary
              </span>
              <div
                className="small-text"
                style={{
                  fontWeight: 600,
                  color: "var(--heading)",
                  lineHeight: "1.6",
                }}
              >
                Questions:{" "}
                <span style={{ color: "var(--primary)" }}>
                  {questions.length} Qs
                </span>{" "}
                <br />
                Time Limit:{" "}
                <span style={{ color: "var(--primary)" }}>
                  {test.total_time} mins
                </span>{" "}
                <br />
                Max Score:{" "}
                <span style={{ color: "var(--primary)" }}>
                  {test.total_marks} Marks
                </span>
              </div>
            </div>
          </div>

          {test.topics && test.topics.length > 0 && (
            <div style={{ marginTop: "24px" }}>
              <span
                className="caption text-muted"
                style={{
                  fontWeight: 500,
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Targeted Topics & Sub-topics
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {test.topics.map((t, i) => (
                  <Badge
                    key={`t-${i}`}
                    status="draft"
                    style={{
                      background: "var(--primary-light)",
                      color: "var(--primary)",
                      border: "1px solid rgba(91,92,235,0.1)",
                    }}
                  >
                    {t}
                  </Badge>
                ))}
                {test.sub_topics &&
                  test.sub_topics.map((st, i) => (
                    <Badge
                      key={`st-${i}`}
                      status="draft"
                      style={{
                        background: "rgba(124, 58, 237, 0.1)",
                        color: "var(--primary)",
                        border: "1px solid rgba(124, 58, 237, 0.1)",
                      }}
                    >
                      {st}
                    </Badge>
                  ))}
              </div>
            </div>
          )}
        </Card>

        {/* Section 2: Questions Preview List */}
        <div>
          <h2 className="section-title mb-4">
            Questions Preview ({questions.length})
          </h2>

          {questions.length === 0 ? (
            <Card style={{ padding: "48px", textAlign: "center" }}>
              <EmptyState
                title="No questions added"
                description="Please click 'Edit Questions' to add questions."
                icon={
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4" />
                    <path d="M12 16h.01" />
                  </svg>
                }
              />
            </Card>
          ) : (
            <div>
              {questions.map((q, index) => (
                <Card key={q.id || index} className="mb-4">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      borderBottom: "1px solid var(--border)",
                      paddingBottom: "12px",
                      marginBottom: "16px",
                      
                    }}
                  >
                    <span style={{ fontWeight: 600, color: "var(--primary)" }}>
                      Question {index + 1}
                    </span>
                    <Badge
                      status="draft"
                      style={{ textTransform: "capitalize" }}
                    >
                      Difficulty: {q.difficulty || "medium"}
                    </Badge>
                  </div>

                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 500,
                      marginBottom: "20px",
                      color: "var(--heading)",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {q.question}
                  </div>

                  {q.media_url && (
                    <div
                      style={{
                        marginBottom: "20px",
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                        overflow: "hidden",
                        maxWidth: "350px",
                      }}
                    >
                      <img
                        src={q.media_url}
                        alt={`Question ${index + 1} reference visual`}
                        style={{
                          width: "100%",
                          height: "auto",
                          display: "block",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  <div className="options-grid">
                    <div
                      className={`option-preview ${q.correct_option === "option1" ? "correct" : ""}`}
                    >
                      <strong>A:</strong> {q.option1}
                    </div>
                    <div
                      className={`option-preview ${q.correct_option === "option2" ? "correct" : ""}`}
                    >
                      <strong>B:</strong> {q.option2}
                    </div>
                    <div
                      className={`option-preview ${q.correct_option === "option3" ? "correct" : ""}`}
                    >
                      <strong>C:</strong> {q.option3}
                    </div>
                    <div
                      className={`option-preview ${q.correct_option === "option4" ? "correct" : ""}`}
                    >
                      <strong>D:</strong> {q.option4}
                    </div>
                  </div>

                  {q.explanation && (
                    <div
                      style={{
                        marginTop: "20px",
                        background: "var(--background)",
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                        padding: "16px",
                      }}
                    >
                      <strong
                        style={{
                          fontSize: "13px",
                          color: "var(--primary)",
                          display: "block",
                          marginBottom: "4px",
                        }}
                      >
                        Solution Explanation:
                      </strong>
                      <span
                        style={{ fontSize: "14px", color: "var(--body-text)" }}
                      >
                        {q.explanation}
                      </span>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Action Footer */}
        <Card style={{ padding: "16px 24px", marginBottom: "32px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Button
              variant="secondary"
              onClick={() => navigate("/")}
              disabled={isPublishing}
            >
              Exit to Dashboard
            </Button>
            <Button
              variant="primary"
              onClick={handlePublish}
              disabled={isPublishing || questions.length === 0}
              style={{ minWidth: "180px" }}
            >
              {isPublishing ? (
                <span>Publishing...</span>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    justifyContent: "center",
                  }}
                >
                  Publish Test
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </div>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
