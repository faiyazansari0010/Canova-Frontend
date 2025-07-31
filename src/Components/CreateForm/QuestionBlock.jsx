import { useParams } from "react-router-dom";
import "./QuestionBlock.css";
import { nanoid } from "nanoid";
import { toast } from "react-toastify";

const QuestionBlock = ({
  showPreview = false,
  question,
  qIndex,
  formPages,
  setFormPages,
  insideSection = false,
  sectionIndex,
  setUploadType,
  setShowUploadModal,
  currentQuestion,
  setCurrentQuestion,
  isConditionMode = false,
}) => {
  const { pageID } = useParams();
  const currentPage = formPages.find((p) => p.pageID === pageID);
  if (!currentPage) return null;

  const getDevResponse = () => {
    const page = formPages.find((p) => p.pageID === pageID);
    const devResponses = page?.pageCondition?.devResponses || [];
    const match = devResponses.find(
      (r) => r.questionID === question.questionID
    );
    return match?.developerResponse || "";
  };

  const updateCurrentQuestionSet = (newQuestions) => {
    setFormPages((prevPages) =>
      prevPages.map((page) => {
        if (page.pageID === pageID) {
          if (insideSection && typeof sectionIndex === "number") {
            let updatedPageSections = [...page.pageSections];
            if (newQuestions.length === 0) {
              updatedPageSections = updatedPageSections.filter(
                (_, idx) => idx !== sectionIndex
              );
              return {
                ...page,
                pageSections: updatedPageSections,
              };
            } else {
              updatedPageSections[sectionIndex] = {
                ...updatedPageSections[sectionIndex],
                questions: newQuestions,
              };
              return {
                ...page,
                pageSections: updatedPageSections,
              };
            }
          } else {
            return {
              ...page,
              pageQuestions: newQuestions,
            };
          }
        }
        return page;
      })
    );
  };

  const handleDevResponseChange = (value) => {
    console.log(formPages)
    setFormPages((prevPages) =>
      prevPages.map((page) => {
        if (page.pageID !== pageID) return page;

        const existing = page.pageCondition?.devResponses || [];
        const index = existing.findIndex(
          (r) => r.questionID === question.questionID
        );

        let updatedResponses = [...existing];

        if (index !== -1) {
          updatedResponses[index].developerResponse = value;
        } else {
          updatedResponses.push({
            questionID: question.questionID,
            developerResponse: value,
          });
        }

        return {
          ...page,
          pageCondition: {
            ...(page.pageCondition || {}),
            devResponses: updatedResponses,
          },
        };
      })
    );
  };

  const handleQuestionNameChange = (index, text) => {
    const updated = insideSection
      ? currentPage.pageSections?.[sectionIndex]?.questions || []
      : currentPage.pageQuestions || [];

    updated[index].questionName = text;
    updateCurrentQuestionSet(updated);
  };

  const toggleQuestionEditMode = (qIndex, editing) => {
    const updated = insideSection
      ? currentPage.pageSections?.[sectionIndex]?.questions || []
      : currentPage.pageQuestions || [];

    if (updated[qIndex].questionName === "") {
      updated[qIndex].questionName = "What is ?";
    }
    updated[qIndex].isEditing = editing;
    updateCurrentQuestionSet(updated);
  };

  const handleTypeChange = (index, type) => {
    const updated = [
      ...(insideSection
        ? currentPage.pageSections?.[sectionIndex]?.questions || []
        : currentPage.pageQuestions || []),
    ];

    updated[index].questionType = type;

    if (type === "Multiple Choice" || type === "Checkbox") {
      updated[index].options = [
        {
          optionType: type,
          optionID: nanoid(),
          optionName: "Option 1",
          isEditing: false,
        },
        {
          optionType: type,
          optionID: nanoid(),
          optionName: "Option 2",
          isEditing: false,
        },
      ];
    } else if (type === "Dropdown") {
      updated[index].options = [
        {
          optionType: type,
          optionID: nanoid(),
          optionName: "Please select...",
          isEditing: false,
        },
        {
          optionType: type,
          optionID: nanoid(),
          optionName: "Dropdown Option 1",
          isEditing: false,
        },
        {
          optionType: type,
          optionID: nanoid(),
          optionName: "Dropdown Option 2",
          isEditing: false,
        },
      ];
    } else if (type === "Rating") {
      updated[index].rating = 0;
    } else if (type === "Linear Scale") {
      updated[index].scale = 5;
    } else if (type === "Date") {
      updated[index].date = "";
    } else if (type === "File Upload") {
      updated[index].file = null;
    }

    if (type === "Checkbox") {
      updated[index].userResponse = [];
    } else if (type === "File Upload") {
      updated[index].userResponse = "";
      updated[index].file = null;
    } else {
      updated[index].userResponse = "";
    }
    console.log(updated);

    updateCurrentQuestionSet(updated);
  };

  const handleOptionTextChange = (qIndex, oIndex, value) => {
    const updated = insideSection
      ? currentPage.pageSections?.[sectionIndex]?.questions || []
      : currentPage.pageQuestions || [];
    updated[qIndex].options[oIndex].optionName = value;
    updateCurrentQuestionSet(updated);
  };

  const toggleOptionEditMode = (qIndex, oIndex, editing) => {
    const updated = insideSection
      ? currentPage.pageSections?.[sectionIndex]?.questions || []
      : currentPage.pageQuestions || [];
    if (updated[qIndex].options[oIndex].optionName === "") {
      updated[qIndex].options[
        oIndex
      ].optionName = `Option ${updated[qIndex].options.length}`;
    }
    updated[qIndex].options[oIndex].isEditing = editing;
    updateCurrentQuestionSet(updated);
  };

  const handleOptionKeyDown = (qIndex, oIndex, e) => {
    const updated = insideSection
      ? currentPage.pageSections?.[sectionIndex]?.questions || []
      : currentPage.pageQuestions || [];
    const type = updated[qIndex].questionType;

    if (e.key === "Enter") {
      e.preventDefault();
      e.preventDefault();
      updated[qIndex].options.splice(oIndex + 1, 0, {
        optionID: nanoid(),
        optionType: type,
        optionName:
          type === "Dropdown"
            ? `Dropdown Option ${updated[qIndex].options.length + 1}`
            : `Option ${updated[qIndex].options.length + 1}`,
        isEditing: true,
      });
      updateCurrentQuestionSet(updated);
    }

    if (
      e.key === "Backspace" &&
      updated[qIndex].options[oIndex].optionName.trim() === ""
    ) {
      if (updated[qIndex].options.length === 1) {
        toast.info("Atleast one option must be present.");
        updated[qIndex].options[oIndex].optionName = "Option 11";
        updateCurrentQuestionSet(updated);
        return;
      }
      updated[qIndex].options.splice(oIndex, 1);
      updateCurrentQuestionSet(updated);
    }
  };

  const handleQuestionDelete = (qIndex) => {
    const updated = insideSection
      ? currentPage.pageSections?.[sectionIndex]?.questions || []
      : currentPage.pageQuestions || [];
    updated.splice(qIndex, 1);
    updateCurrentQuestionSet(updated);
  };

  const handleRatingChange = (qIndex, value) => {
    const updated = insideSection
      ? currentPage.pageSections?.[sectionIndex]?.questions || []
      : currentPage.pageQuestions || [];
    updated[qIndex].rating = value;
    updated[qIndex].userResponse = value;
    updateCurrentQuestionSet(updated);
  };

  const handleScaleChange = (qIndex, value) => {
    const updated = insideSection
      ? currentPage.pageSections?.[sectionIndex]?.questions || []
      : currentPage.pageQuestions || [];
    updated[qIndex].scale = parseInt(value);
    updated[qIndex].userResponse = parseInt(value);
    updateCurrentQuestionSet(updated);
  };

  const handleDateChange = (qIndex, value) => {
    const updated = insideSection
      ? currentPage.pageSections?.[sectionIndex]?.questions || []
      : currentPage.pageQuestions || [];
    updated[qIndex].date = value;
    updated[qIndex].userResponse = value;
    updateCurrentQuestionSet(updated);
  };

  const handleResponseChange = (qIndex, value) => {
    const updated = insideSection
      ? currentPage.pageSections?.[sectionIndex]?.questions || []
      : currentPage.pageQuestions || [];
    updated[qIndex].userResponse = value;
    updateCurrentQuestionSet(updated);
  };

  const handleTextResponseChange = (qIndex, value) => {
    const updated = insideSection
      ? currentPage.pageSections?.[sectionIndex]?.questions || []
      : currentPage.pageQuestions || [];
    updated[qIndex].userResponse = value;
    updateCurrentQuestionSet(updated);
  };

  const handleSelectionResponse = (qIndex, value) => {
    const updated = insideSection
      ? currentPage.pageSections?.[sectionIndex]?.questions || []
      : currentPage.pageQuestions || [];
    updated[qIndex].userResponse = value;
    updateCurrentQuestionSet(updated);
  };

  const handleQuestionTextChange = (qIndex, newText) => {
    const updated = insideSection
      ? currentPage.pageSections?.[sectionIndex]?.questions || []
      : currentPage.pageQuestions || [];
    updated[qIndex] = {
      ...updated[qIndex],
      questionText: newText,
    };
    updateCurrentQuestionSet(updated);
    console.log(updated);
  };

  const handleQuestionTextKeyDown = (qIndex, e) => {
    if (e.key === "Backspace" && e.target.value === "") {
      const updated = insideSection
        ? currentPage.pageSections?.[sectionIndex]?.questions || []
        : currentPage.pageQuestions || [];
      delete updated[qIndex].questionText;
      delete updated[qIndex].isEditingQuestionText;

      updateCurrentQuestionSet([...updated]);
      console.log(updated);
    }
  };

  const toggleQuestionTextEditMode = (qIndex, isEditing) => {
    const updated = insideSection
      ? currentPage.pageSections?.[sectionIndex]?.questions || []
      : currentPage.pageQuestions || [];
    updated[qIndex] = {
      ...updated[qIndex],
      isEditingQuestionText: isEditing,
    };
    updateCurrentQuestionSet(updated);
  };

  const toggleDropdown = (qIndex) => {
    const updated = insideSection
      ? currentPage.pageSections?.[sectionIndex]?.questions || []
      : currentPage.pageQuestions || [];
    updated[qIndex].showDropdown = !updated[qIndex].showDropdown;
    updateCurrentQuestionSet(updated);
  };

  return (
    <>
      <div className="question-block" key={qIndex}>
        {question.questionImage && (
          <img
            src={question.questionImage}
            alt="Question image"
            className="question-img-preview"
          />
        )}

        {question.questionVideo && (
          <video
            src={question.questionVideo}
            controls
            className="question-video-preview"
          />
        )}

        {(question.questionText !== undefined ||
          question.isEditingQuestionText) && (
          <div className="question-text-container">
            {question.isEditingQuestionText ? (
              <textarea
                disabled={isConditionMode || showPreview}
                value={question.questionText}
                autoFocus
                onChange={(e) =>
                  handleQuestionTextChange(qIndex, e.target.value)
                }
                onKeyDown={(e) => handleQuestionTextKeyDown(qIndex, e)}
                onBlur={() => toggleQuestionTextEditMode(qIndex, false)}
                className="question-textarea"
                placeholder="Enter description here...Press Backspace to delete this input box"
              />
            ) : (
              <span
                className="question-text-display"
                onClick={() => toggleQuestionTextEditMode(qIndex, true)}
              >
                {question.questionText ||
                  "Click here to add question description..."}
              </span>
            )}
          </div>
        )}

        {isConditionMode || showPreview ? (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
              Q{qIndex + 1}. {question.questionName}
            </div>

            {question.questionType === "Short Answer" && (
              <input
                type="text"
                value={getDevResponse()}
                onChange={(e) => handleDevResponseChange(e.target.value)}
              />
            )}

            {question.questionType === "Long Answer" && (
              <textarea
                rows={4}
                value={getDevResponse()}
                onChange={(e) => handleDevResponseChange(e.target.value)}
              />
            )}

            {question.questionType === "Date" && (
              <input
                type="date"
                value={getDevResponse()}
                onChange={(e) => handleDevResponseChange(e.target.value)}
              />
            )}

            {question.questionType === "Multiple Choice" &&
              question.options.map((opt) => (
                <label
                  key={opt.optionID}
                  style={{ display: "block", marginBottom: "4px" }}
                >
                  <input
                    type="radio"
                    name={question.questionID}
                    checked={getDevResponse() === opt.optionID}
                    onChange={() => handleDevResponseChange(opt.optionID)}
                  />
                  {opt.optionName}
                </label>
              ))}

            {question.questionType === "Checkbox" &&
              question.options.map((opt) => {
                const devValue = getDevResponse();
                const selected = Array.isArray(devValue)
                  ? devValue.includes(opt.optionID)
                  : false;

                const toggleValue = (checked) => {
                  let updated = Array.isArray(devValue) ? [...devValue] : [];
                  if (checked) {
                    updated.push(opt.optionID);
                  } else {
                    updated = updated.filter((id) => id !== opt.optionID);
                  }
                  handleDevResponseChange(updated);
                };

                return (
                  <label
                    key={opt.optionID}
                    style={{ display: "block", marginBottom: "4px" }}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={(e) => toggleValue(e.target.checked)}
                    />
                    {opt.optionName}
                  </label>
                );
              })}

            {question.questionType === "Dropdown" && (
              <select
                value={getDevResponse()}
                onChange={(e) => handleDevResponseChange(e.target.value)}
              >
                <option value="">Select an option</option>
                {question.options.map((opt) => (
                  <option key={opt.optionID} value={opt.optionID}>
                    {opt.optionName}
                  </option>
                ))}
              </select>
            )}

            {question.questionType === "Linear Scale" && (
              <div style={{ display: "flex", gap: "12px" }}>
                {Array.from(
                  { length: question.maxScale - question.minScale + 1 },
                  (_, i) => question.minScale + i
                ).map((scale) => (
                  <label key={scale}>
                    <input
                      type="radio"
                      name={question.questionID}
                      checked={getDevResponse() === scale}
                      onChange={() => handleDevResponseChange(scale)}
                    />
                    {scale}
                  </label>
                ))}
              </div>
            )}

            {question.questionType === "Rating" && (
              <div style={{ display: "flex", gap: "10px" }}>
                {Array.from(
                  { length: question.maxRating },
                  (_, i) => i + 1
                ).map((star) => (
                  <span
                    key={star}
                    style={{
                      cursor: "pointer",
                      color: getDevResponse() >= star ? "gold" : "gray",
                      fontSize: "24px",
                    }}
                    onClick={() => handleDevResponseChange(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="question-header">
              <div className="questionHeaderContainer">
                <span className="question-number">Q{qIndex + 1}</span>

                {question.isEditing ? (
                  <textarea
                    autoFocus
                    value={question.questionName}
                    onChange={(e) =>
                      handleQuestionNameChange(qIndex, e.target.value)
                    }
                    onBlur={() => toggleQuestionEditMode(qIndex, false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        toggleQuestionEditMode(qIndex, false);
                      }
                      if (
                        e.key === "Backspace" &&
                        question?.questionName?.trim() === ""
                      ) {
                        handleQuestionDelete(qIndex);
                      }
                    }}
                    placeholder="Enter your question"
                    className="question-input"
                  />
                ) : (
                  <div
                    className="questionNameContainer"
                    onClick={() => toggleQuestionEditMode(qIndex, true)}
                  >
                    {question.questionName}
                  </div>
                )}
              </div>

              <div
                className="type-dropdown-wrapper"
                onClick={() => toggleDropdown(qIndex)}
              >
                <img
                  src="/dropdownIcon.png"
                  alt="Dropdown Icon"
                  className="dropdown-icon"
                />
                <span className="selected-type">{question.questionType}</span>

                {question.showDropdown && (
                  <div className="dropdown-options">
                    <div
                      onClick={() => {
                        handleTypeChange(qIndex, "Multiple Choice");
                        toggleDropdown(qIndex);
                      }}
                    >
                      Multiple Choice
                    </div>
                    <div onClick={() => handleTypeChange(qIndex, "Checkbox")}>
                      Checkbox
                    </div>
                    <div onClick={() => handleTypeChange(qIndex, "Dropdown")}>
                      Dropdown
                    </div>
                    <div
                      onClick={() => handleTypeChange(qIndex, "Short Answer")}
                    >
                      Short Answer
                    </div>
                    <div
                      onClick={() => handleTypeChange(qIndex, "Long Answer")}
                    >
                      Long Answer
                    </div>
                    <div onClick={() => handleTypeChange(qIndex, "Date")}>
                      Date
                    </div>
                    <div
                      onClick={() => handleTypeChange(qIndex, "File Upload")}
                    >
                      File Upload
                    </div>
                    <div
                      onClick={() => handleTypeChange(qIndex, "Linear Scale")}
                    >
                      Linear Scale
                    </div>
                    <div onClick={() => handleTypeChange(qIndex, "Rating")}>
                      Rating
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="question-options">
              {question.questionType === "Short Answer" && (
                <textarea
                  value={question.userResponse || ""}
                  onChange={(e) =>
                    handleTextResponseChange(qIndex, e.target.value)
                  }
                />
              )}

              {question.questionType === "Long Answer" && (
                <textarea
                  value={question.userResponse || ""}
                  onChange={(e) =>
                    handleTextResponseChange(qIndex, e.target.value)
                  }
                />
              )}

              {question.questionType === "Multiple Choice" &&
                question.options.map((opt, oIndex) => (
                  <div key={oIndex} className="option-row">
                    <input
                      style={{ cursor: "pointer" }}
                      type="radio"
                      name={`question-${question.questionID}`}
                      checked={question.userResponse === opt.optionID}
                      onChange={() =>
                        handleSelectionResponse(qIndex, opt.optionID)
                      }
                    />
                    {opt.isEditing ? (
                      <input
                        autoFocus
                        value={opt.optionName}
                        onChange={(e) =>
                          handleOptionTextChange(qIndex, oIndex, e.target.value)
                        }
                        onBlur={() =>
                          toggleOptionEditMode(qIndex, oIndex, false)
                        }
                        onKeyDown={(e) =>
                          handleOptionKeyDown(qIndex, oIndex, e)
                        }
                        className="option-input"
                      />
                    ) : (
                      <span
                        className="option-text-display"
                        onClick={() =>
                          toggleOptionEditMode(qIndex, oIndex, true)
                        }
                      >
                        {opt.optionName}
                      </span>
                    )}
                  </div>
                ))}

              {question.questionType === "Checkbox" &&
                question.options.map((opt, oIndex) => (
                  <div key={oIndex} className="option-row">
                    <input
                      type="checkbox"
                      name={`question-${question.questionID}`}
                      value={opt.optionID}
                      checked={
                        Array.isArray(question.userResponse) &&
                        question.userResponse.includes(opt.optionID)
                      }
                      onChange={(e) => {
                        const updated = insideSection
                          ? currentPage.pageSections?.[sectionIndex]
                              ?.questions || []
                          : currentPage.pageQuestions || [];
                        const isChecked = e.target.checked;
                        if (!Array.isArray(updated[qIndex].userResponse)) {
                          updated[qIndex].userResponse = [];
                        }

                        if (isChecked) {
                          updated[qIndex].userResponse.push(opt.optionID);
                        } else {
                          updated[qIndex].userResponse = updated[
                            qIndex
                          ].userResponse.filter((id) => id !== opt.optionID);
                        }

                        updateCurrentQuestionSet(updated);
                      }}
                    />

                    {opt.isEditing ? (
                      <input
                        autoFocus
                        value={opt.optionName}
                        onChange={(e) =>
                          handleOptionTextChange(qIndex, oIndex, e.target.value)
                        }
                        onBlur={() =>
                          toggleOptionEditMode(qIndex, oIndex, false)
                        }
                        onKeyDown={(e) =>
                          handleOptionKeyDown(qIndex, oIndex, e)
                        }
                        className="option-input"
                      />
                    ) : (
                      <span
                        className="option-text-display"
                        onClick={() =>
                          toggleOptionEditMode(qIndex, oIndex, true)
                        }
                      >
                        {opt.optionName}
                      </span>
                    )}
                  </div>
                ))}

              {question.questionType === "Dropdown" && (
                <div className="dropdown-wrapper">
                  <select
                    className="dropdown-select"
                    value={
                      question.userResponse ||
                      (question.options.length > 0
                        ? question.options[0].optionID
                        : "")
                    }
                    onChange={(e) =>
                      handleResponseChange(qIndex, e.target.value)
                    }
                  >
                    {question.options.map((opt) => (
                      <option key={opt.optionID} value={opt.optionID}>
                        {opt.optionName}
                      </option>
                    ))}
                  </select>

                  <div className="dropdown-options-list">
                    {question.options.map((opt, oIndex) => (
                      <div key={opt.optionID}>
                        {opt.isEditing ? (
                          <input
                            autoFocus
                            value={opt.optionName}
                            onChange={(e) =>
                              handleOptionTextChange(
                                qIndex,
                                oIndex,
                                e.target.value
                              )
                            }
                            onBlur={() =>
                              toggleOptionEditMode(qIndex, oIndex, false)
                            }
                            onKeyDown={(e) =>
                              handleOptionKeyDown(qIndex, oIndex, e)
                            }
                            className="option-input"
                          />
                        ) : (
                          <span
                            className="option-text-display"
                            onClick={() =>
                              toggleOptionEditMode(qIndex, oIndex, true)
                            }
                          >
                            {opt.optionName}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {question.questionType === "Rating" && (
                <div>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => {
                        handleRatingChange(qIndex, star); // Already sets rating visually
                        handleResponseChange(qIndex, star); // Also stores in userResponse
                      }}
                      style={{
                        cursor: "pointer",
                        color:
                          question.rating && question.rating >= star
                            ? "gold"
                            : "lightgray",
                        fontSize: "1.5rem",
                      }}
                    >
                      ★
                    </span>
                  ))}
                  <div>Selected: {question.rating || 0} Star(s)</div>
                </div>
              )}

              {question.questionType === "Linear Scale" && (
                <div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={question.scale}
                    onChange={(e) => {
                      handleScaleChange(qIndex, e.target.value); // updates UI slider
                      handleResponseChange(qIndex, e.target.value); // saves value to userResponse
                    }}
                  />
                  <span style={{ marginLeft: "10px" }}>{question.scale}</span>
                </div>
              )}

              {question.questionType === "Date" && (
                <input
                  type="date"
                  value={question.date || ""}
                  onChange={(e) => {
                    handleDateChange(qIndex, e.target.value); // for displaying
                    handleResponseChange(qIndex, e.target.value); // for storing
                  }}
                />
              )}

              {question.questionType === "File Upload" && (
                <div>
                  <button
                    onClick={() => {
                      if ((question.userResponse?.length || 0) >= 5) {
                        toast.error("You can only upload up to 5 files.");
                        return;
                      }
                      setCurrentQuestion({
                        ...currentQuestion,
                        insideSection: insideSection,
                        sectionIndex: sectionIndex,
                      });
                      setUploadType("File Upload");
                      setShowUploadModal(true);
                    }}
                  >
                    Upload Files
                  </button>
                  <div style={{ marginTop: "8px" }}>
                    <h4
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        marginBottom: "4px",
                      }}
                    >
                      Selected Files:
                    </h4>
                    <ul
                      style={{
                        fontSize: "14px",
                        paddingLeft: "20px",
                        marginTop: "4px",
                      }}
                    >
                      {Array.isArray(question?.userResponse) &&
                        question.userResponse.map((file, index) => (
                          <li key={index}>{file.name}</li>
                        ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default QuestionBlock;
