import QuestionBlock from "./CreateForm/QuestionBlock"; // reuse same question UI
import "./ConditionModeView.css";
import { toast } from "react-toastify";
import { useState } from "react";
export default function ConditionModeView({
  currentPage,
  formPages,
  setFormPages,
}) {
  const [showConditionModal, setShowConditionModal] = useState(false);

  const handleConditionChange = (key, value) => {
    setFormPages((prev) =>
      prev.map((page) =>
        page.pageID === currentPage.pageID
          ? {
              ...page,
              pageCondition: {
                ...page.pageCondition,
                [key]: value,
              },
            }
          : page
      )
    );
  };

  const currentIndex = formPages.findIndex(
    (p) => p.pageID === currentPage.pageID
  );

  const otherPages = formPages
    .slice(currentIndex + 1)
    .filter((p) => p.pageID !== currentPage.pageID);

  // console.log(otherPages)

  return (
    <div
      style={{
        backgroundColor: "#f0f0f0",
        borderRadius: "12px",
        padding: "24px",
      }}
    >
      {currentPage.pageSections?.map((section, sectionIndex) => (
        <div
          key={section.sectionID}
          style={{
            backgroundColor: section.sectionColor,
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "20px",
          }}
        >
          {section.questions.map((question, qIndex) => (
            <QuestionBlock
              key={question.questionID}
              question={question}
              qIndex={qIndex}
              insideSection={true}
              sectionIndex={sectionIndex}
              isConditionMode={true}
              pageID={currentPage.pageID}
              setFormPages={setFormPages}
              formPages={formPages}
            />
          ))}
        </div>
      ))}

      {currentPage.pageQuestions?.map((question, index) => (
        <QuestionBlock
          key={question.questionID}
          question={question}
          qIndex={index}
          isConditionMode={true}
          pageID={currentPage.pageID}
          setFormPages={setFormPages}
          formPages={formPages}
        />
      ))}

      {currentPage.isConditionMode && (
        <button
          onClick={() => {
            if (!currentPage?.pageCondition?.devResponses) {
              // console.log(!currentPage?.pageCondition?.devResponses);
              toast.info(
                "Please set atleast one condition by responding to a question."
              );
              return;
            }
            setShowConditionModal(true);
          }}
        >
          Add Page Condition
        </button>
      )}

      {showConditionModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowConditionModal(false)}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <img
              src="/modalCloseIcon.png"
              alt="Close"
              className="close-icon"
              onClick={() => setShowConditionModal(false)}
            />

            <h3 style={{ marginBottom: "16px" }}>
              Select target pages for conditions
            </h3>

            {/* Select If True */}
            <label style={{ display: "block", marginBottom: "4px" }}>
              If True:
            </label>
            <select
              value={currentPage.pageCondition?.ifTruePage || ""}
              onChange={(e) =>
                handleConditionChange("ifTruePage", e.target.value)
              }
              style={{ marginBottom: "12px", width: "100%" }}
            >
              <option value="">-- Select Page --</option>
              {otherPages
                .filter(
                  (p) => p.pageID !== currentPage.pageCondition?.ifFalsePage
                )
                .map((p) => (
                  <option key={p.pageID} value={p.pageID}>
                    {p.pageName}
                  </option>
                ))}
            </select>

            {/* Select If False */}
            <label style={{ display: "block", marginBottom: "4px" }}>
              If False:
            </label>
            <select
              value={currentPage.pageCondition?.ifFalsePage || ""}
              onChange={(e) =>
                handleConditionChange("ifFalsePage", e.target.value)
              }
              style={{ marginBottom: "12px", width: "100%" }}
            >
              <option value="">-- Select Page --</option>
              {otherPages
                .filter(
                  (p) => p.pageID !== currentPage.pageCondition?.ifTruePage
                )
                .map((p) => (
                  <option key={p.pageID} value={p.pageID}>
                    {p.pageName}
                  </option>
                ))}
            </select>

            <button
              className="continue-button"
              onClick={() => {
                if (
                  !currentPage.pageCondition.ifFalsePage ||
                  !currentPage.pageCondition.ifTruePage
                ) {
                  toast.info(
                    "Please select the page for both the cases - True and False."
                  );
                  return;
                }

                setFormPages((prev) =>
                  prev.map((page) =>
                    page.pageID === currentPage.pageID
                      ? { ...page, isConditionMode: false }
                      : page
                  )
                );

                setShowConditionModal(false);
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
