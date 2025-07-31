import React from "react";
import "./FlowChart.css";

const FlowChart = ({ formPages }) => {
  const pageMap = formPages.reduce((acc, page) => {
    acc[page.pageID] = page;
    return acc;
  }, {});

  const hasCondition = (page) =>
    page.pageCondition &&
    page.pageCondition.ifTruePage &&
    page.pageCondition.ifFalsePage;

  const rootPage = formPages.find(hasCondition);

  if (!rootPage) {
    return (
      <div className="flowchart-container" style={{ position: "relative" }}>
        <p>No conditional pages found. Click Next to move towards Publish</p>
        <button
          className="goToPublishModal"
          style={{
            backgroundColor: "#000",
            color: "#fff",
            padding: "10px 24px",
            border: "none",
            borderRadius: "12px",
            fontSize: "16px",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            position: "absolute",
            top: "650px",
            right: "10px",
          }}
          onClick={() => setPubishModal(true)}
        >
          Next
        </button>
      </div>
    );
  }

  const buildTrueBranch = () => {
    const branch = [];
    let currentID = rootPage.pageCondition.ifTruePage;

    while (currentID && pageMap[currentID]) {
      const page = pageMap[currentID];
      branch.push(page);
      currentID = page.pageCondition?.ifTruePage;
    }

    return branch;
  };

  const buildFalseBranch = () => {
    const branch = [];
    let currentID = rootPage.pageCondition.ifFalsePage;

    while (currentID && pageMap[currentID]) {
      const page = pageMap[currentID];
      branch.push(page);
      currentID = page.pageCondition?.ifFalsePage;
    }

    return branch;
  };

  const trueBranch = buildTrueBranch();
  const falseBranch = buildFalseBranch();

  return (
    <div
      className="flowchart-container"
      style={{
        position: "relative",
      }}
    >
      <div className="flowchart-root">
        <div className="page-box root">
          <span>{rootPage.pageName}</span>
          <img src="/polygonIcon.png" alt="" />
        </div>
        <div className="labels-row">
          <div className="label-branch">
            <img src="/trueIcon.png" alt="True" className="condition-icon" />
          </div>
          <div className="label-branch">
            <img src="/falseIcon.png" alt="False" className="condition-icon" />
          </div>
        </div>

        <div className="branches-row">
          <div className="branch left-branch">
            {trueBranch.map((page, idx) => (
              <React.Fragment key={page.pageID}>
                <div className="connector-line" />
                <div className="page-box">{page.pageName}</div>
              </React.Fragment>
            ))}
          </div>

          <div className="branch right-branch">
            <div className="connector-line vertical-line" />
            <div className="connector-line horizontal-line" />
            <div className="branch-inner">
              {falseBranch.map((page) => (
                <React.Fragment key={page.pageID}>
                  <div className="connector-line connector-line-right" />
                  <div className="page-box">{page.pageName}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        className="goToPublishModal"
        style={{
          backgroundColor: "#000",
          color: "#fff",
          padding: "10px 24px",
          border: "none",
          borderRadius: "12px",
          fontSize: "16px",
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
          position: "absolute",
          top: "650px",
          right: "10px",
        }}
        onClick={() => setPubishModal(true)}
      >
        Next
      </button>
    </div>
  );
};

export default FlowChart;
