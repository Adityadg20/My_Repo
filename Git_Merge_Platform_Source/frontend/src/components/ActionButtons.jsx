import { useState } from "react";
import api from "../services/api";

function ActionButtons({
                           selectedFile,
                           mergeResult,
                           onActionCompleted,
                       }) {
    const [loadingAction, setLoadingAction] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const executeAction = async (actionName, requestFunction) => {
        try {
            setLoadingAction(actionName);
            setMessage("");
            setError("");

            const response = await requestFunction();

            console.log(`${actionName} response:`, response.data);

            setMessage(
                response.data?.message ||
                `${actionName} completed successfully.`
            );

            if (onActionCompleted) {
                onActionCompleted(actionName, response.data);
            }
        } catch (err) {
            console.error(`${actionName} error:`, err);

            const errorMessage =
                err.response?.data?.message ||
                err.response?.data ||
                `Failed to execute ${actionName}.`;

            setError(
                typeof errorMessage === "string"
                    ? errorMessage
                    : `Failed to execute ${actionName}.`
            );
        } finally {
            setLoadingAction("");
        }
    };

    const handleStage = () => {
        if (!selectedFile) {
            setError("Please select a file before staging.");
            setMessage("");
            return;
        }

        executeAction("Stage File", () =>
            api.post("/merge/stage", {
                path: selectedFile,
            })
        );
    };

    const handleContinueMerge = () => {
        executeAction("Continue Merge", () =>
            api.post("/merge/continue", {})
        );
    };

    const handlePush = () => {
        executeAction("Push Changes", () =>
            api.post("/merge/push", {})
        );
    };

    const hasMergeStarted = Boolean(mergeResult);
    const isLoading = Boolean(loadingAction);

    return (
        <section className="card action-buttons-card">
            <h2>Merge Actions</h2>

            <p className="card-description">
                Save, stage, continue, and push your merge changes.
            </p>

            <div className="action-buttons">
                <button
                    className="secondary-button"
                    onClick={handleStage}
                    disabled={!selectedFile || isLoading}
                >
                    {loadingAction === "Stage File"
                        ? "Staging..."
                        : "Stage File"}
                </button>

                <button
                    className="primary-button"
                    onClick={handleContinueMerge}
                    disabled={!hasMergeStarted || isLoading}
                >
                    {loadingAction === "Continue Merge"
                        ? "Continuing..."
                        : "Continue Merge"}
                </button>

                <button
                    className="success-button"
                    onClick={handlePush}
                    disabled={!hasMergeStarted || isLoading}
                >
                    {loadingAction === "Push Changes"
                        ? "Pushing..."
                        : "Push Changes"}
                </button>
            </div>

            {message && (
                <div className="message success-message">
                    {message}
                </div>
            )}

            {error && (
                <div className="message error-message">
                    {error}
                </div>
            )}
        </section>
    );
}

export default ActionButtons;