import { useNavigate } from "react-router-dom";

export default function NextPageButton({ currentPage, formPages }) {
  const navigate = useNavigate();

  const handleNext = () => {
    const currentCondition = currentPage.pageCondition;
    const { devResponses, ifTruePage, ifFalsePage } = currentCondition || {};
    // console.log(currentCondition)
    const doesMatch = () => {
      if (!devResponses || Object.keys(devResponses).length === 0) return false;

      for (const qID in devResponses) {
        const devAnswer = devResponses[qID];

        console.log(devAnswer);

        // Search for question in pageQuestions and pageSections
        const question =
          currentPage?.pageQuestions?.find(
            (q) => q.questionID === devAnswer.questionID
          ) ||
          currentPage?.pageSections
            ?.flatMap((s) => s.questions)
            .find((q) => q.questionID === devAnswer.questionID);

        console.log(question);

        if (!question) return false;

        const userAnswer = question.userResponse;
        console.log("User Answer - ", userAnswer);
        console.log("Dev Answer - ", devAnswer);

        // Strict comparison logic
        if (Array.isArray(devAnswer.developerResponse)) {
          if (
            !Array.isArray(userAnswer) ||
            devAnswer.developerResponse.length !== userAnswer.length ||
            !devAnswer.developerResponse.every((val) =>
              userAnswer.includes(val)
            )
          ) {
            console.log(!Array.isArray(userAnswer));
            console.log(devAnswer.length !== userAnswer.length);
            console.log(!userAnswer.includes(devAnswer.developerResponse[1]));
            console.log(!userAnswer.includes(devAnswer.developerResponse[0]));
            return false;
          }
        } else {
          console.log("in else");
          if (userAnswer !== devAnswer.developerResponse) return false;
        }
      }
      console.log("True");
      return true;
    };

    let nextPageID;

    if (devResponses && (ifTruePage || ifFalsePage)) {
      const conditionPassed = doesMatch();
      console.log(conditionPassed);
      nextPageID = conditionPassed ? ifTruePage : ifFalsePage;
    } else {
      // fallback: go to next sequential page
      const currentIndex = formPages.findIndex(
        (p) => p.pageID === currentPage.pageID
      );
      nextPageID = formPages[currentIndex + 1]?.pageID;
    }

    if (nextPageID) {
      navigate(`/createForm/${projectID}/${formID}/${nextPageID}`);
    }
  };

  return (
    <div style={{ textAlign: "right", marginTop: "32px" }}>
      <button
        style={{
          backgroundColor: "#000",
          color: "#fff",
          padding: "10px 24px",
          border: "none",
          borderRadius: "12px",
          fontSize: "16px",
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
          position: "relative",
        }}
        onClick={handleNext}
      >
        Next Page
      </button>
    </div>
  );
}
