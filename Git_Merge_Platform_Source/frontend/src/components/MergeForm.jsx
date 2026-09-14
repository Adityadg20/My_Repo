import { useState } from "react";
import api from "../services/api";

function MergeForm({ onMergeStarted }) {
    const [sourceBranch, setSourceBranch] = useState("");
    const [targetBranch, setTargetBranch] = useState("main");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!sourceBranch.trim()) {
            setError("Please enter a source branch.");
            return;
        }

        if (!targetBranch.trim()) {
            setError("Please enter a target branch.");
            return;
        }

        const requestData = {
            sourceBranch: sourceBranch.trim(),
            targetBranch: targetBranch.trim(),
        };

        try {
            setLoading(true);

            const response = await api.post("/merge/start", requestData);

            console.log("Merge response:", response.data);

            setSuccess(
                response.data.message || "Merge process started successfully."
            );

            if (onMergeStarted) {
                onMergeStarted(response.data);
            }
        } catch (err) {
            console.error("Merge error:", err);

            if (err.response) {
                setError(
                    err.response.data?.message ||
                    err.response.data ||
                    "The backend returned an error."
                );
            } else if (err.request) {
                setError(
                    "Could not connect to the backend. Make sure Spring Boot is running."
                );
            } else {
                setError("Something went wrong while starting the merge.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="card merge-form-card">
            <h2>Start a Merge</h2>
            <p className="card-description">
                Enter the source and target branches to begin the merge process.
            </p>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="sourceBranch">Source Branch</label>

                    <input
                        id="sourceBranch"
                        type="text"
                        placeholder="feature/login"
                        value={sourceBranch}
                        onChange={(event) => setSourceBranch(event.target.value)}
                        disabled={loading}
                    />

                    <small>
                        The branch whose changes you want to merge.
                    </small>
                </div>

                <div className="form-group">
                    <label htmlFor="targetBranch">Target Branch</label>

                    <input
                        id="targetBranch"
                        type="text"
                        placeholder="main"
                        value={targetBranch}
                        onChange={(event) => setTargetBranch(event.target.value)}
                        disabled={loading}
                    />

                    <small>
                        The branch into which the source branch will be merged.
                    </small>
                </div>

                <button type="submit" className="primary-button" disabled={loading}>
                    {loading ? "Starting Merge..." : "Start Merge"}
                </button>
            </form>

            {error && <div className="message error-message">{error}</div>}

            {success && (
                <div className="message success-message">{success}</div>
            )}
        </section>
    );
}

export default MergeForm;