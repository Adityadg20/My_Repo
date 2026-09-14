import { useState } from "react";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import MergeForm from "./components/MergeForm";
import ConflictList from "./components/ConflictList";
import CodeEditor from "./components/CodeEditor";
import ActionButtons from "./components/ActionButtons";

function App() {
    const [mergeResult, setMergeResult] = useState(null);
    const [selectedFile, setSelectedFile] = useState("");
    const [mergeStatus, setMergeStatus] = useState("No merge started");

    const handleMergeStarted = (result) => {
        setMergeResult(result);
        setSelectedFile("");

        if (result?.conflictedFiles?.length > 0) {
            setMergeStatus(
                `${result.conflictedFiles.length} conflict file(s) found`
            );
        } else {
            setMergeStatus("Merge started without conflicts");
        }
    };

    const handleFileSelect = (file) => {
        setSelectedFile(file);
    };

    const handleFileSaved = (file, content) => {
        console.log("File saved:", file);
        console.log("Saved content:", content);
    };

    const handleActionCompleted = (actionName, result) => {
        console.log(`${actionName} completed:`, result);

        /*
         * Continue Merge may return an updated list of conflicted files.
         * We update mergeResult so ConflictList receives the latest data.
         */
        if (actionName === "Continue Merge") {
            setMergeResult((previousResult) => ({
                ...previousResult,
                ...result,
            }));

            const remainingConflicts = result?.conflictedFiles || [];

            if (remainingConflicts.length === 0) {
                setMergeStatus("Merge completed successfully");
                setSelectedFile("");
            } else {
                setMergeStatus(
                    `${remainingConflicts.length} conflict file(s) remaining`
                );

                /*
                 * If the currently selected file is no longer conflicted,
                 * clear the editor selection.
                 */
                if (!remainingConflicts.includes(selectedFile)) {
                    setSelectedFile("");
                }
            }
        }

        if (actionName === "Stage File") {
            setMergeStatus("File staged successfully");
        }

        if (actionName === "Push Changes") {
            setMergeStatus("Changes pushed successfully");
        }
    };

    const conflictedFiles = mergeResult?.conflictedFiles || [];

    return (
        <div className="app">
            <Header />

            <div className="app-layout">
                <Sidebar />

                <main className="main-content">
                    {/* Merge status card */}
                    <section className="card merge-status-card">
                        <div className="status-header">
                            <div>
                                <h2>Merge Status</h2>
                                <p className="card-description">
                                    Current status of your merge operation.
                                </p>
                            </div>

                            <span
                                className={`status-badge ${
                                    conflictedFiles.length > 0
                                        ? "status-warning"
                                        : mergeResult
                                            ? "status-success"
                                            : "status-neutral"
                                }`}
                            >
                {mergeStatus}
              </span>
                        </div>

                        {mergeResult?.currentBranch && (
                            <div className="branch-info">
                <span>
                  <strong>Current Branch:</strong>{" "}
                    {mergeResult.currentBranch}
                </span>
                            </div>
                        )}
                    </section>

                    <MergeForm onMergeStarted={handleMergeStarted} />

                    <ConflictList
                        mergeResult={mergeResult}
                        onFileSelect={handleFileSelect}
                    />

                    <CodeEditor
                        selectedFile={selectedFile}
                        onFileSaved={handleFileSaved}
                    />

                    <ActionButtons
                        selectedFile={selectedFile}
                        mergeResult={mergeResult}
                        onActionCompleted={handleActionCompleted}
                    />

                    {mergeResult && (
                        <section className="card merge-result-card">
                            <h2>Merge Response</h2>

                            <pre>
                {JSON.stringify(mergeResult, null, 2)}
              </pre>
                        </section>
                    )}
                </main>
            </div>
        </div>
    );
}

export default App;