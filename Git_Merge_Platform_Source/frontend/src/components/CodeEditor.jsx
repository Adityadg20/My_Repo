import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import api from "../services/api";

function getEditorLanguage(fileName) {
    if (!fileName) return "plaintext";

    const extension = fileName.split(".").pop().toLowerCase();

    const languageMap = {
        java: "java",
        js: "javascript",
        jsx: "javascript",
        ts: "typescript",
        tsx: "typescript",
        json: "json",
        xml: "xml",
        html: "html",
        css: "css",
        scss: "scss",
        yml: "yaml",
        yaml: "yaml",
        properties: "ini",
        sh: "shell",
        bash: "shell",
        py: "python",
        sql: "sql",
        md: "markdown",
    };

    return languageMap[extension] || "plaintext";
}
function getConflictCount(content) {
    if (!content) return 0;

    const conflictStartMarkers = content.match(/^<<<<<<<.*$/gm);

    return conflictStartMarkers ? conflictStartMarkers.length : 0;
}
function CodeEditor({ selectedFile, onFileSaved }) {
    const [fileContent, setFileContent] = useState("");
    const [originalContent, setOriginalContent] = useState("");

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [saveMessage, setSaveMessage] = useState("");

    /*
     * A file has unsaved changes when the current editor content
     * differs from the content originally loaded from the backend.
     */
    const hasUnsavedChanges = fileContent !== originalContent;
    const conflictCount = getConflictCount(fileContent);

    const loadFileContent = async () => {
        if (!selectedFile) {
            setFileContent("");
            setOriginalContent("");
            setError("");
            setSaveMessage("");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setSaveMessage("");

            const response = await api.get("/merge/file", {
                params: {
                    path: selectedFile,
                },
            });

            const content =
                typeof response.data === "string"
                    ? response.data
                    : response.data?.content || "";

            setFileContent(content);
            setOriginalContent(content);
        } catch (err) {
            console.error("Error loading file:", err);

            const errorMessage =
                err.response?.data?.message ||
                err.response?.data ||
                "Failed to load file content.";

            setError(
                typeof errorMessage === "string"
                    ? errorMessage
                    : "Failed to load file content."
            );

            setFileContent("");
            setOriginalContent("");
        } finally {
            setLoading(false);
        }
    };

    /*
     * Load the selected file whenever the selected file changes.
     */
    useEffect(() => {
        loadFileContent();
    }, [selectedFile]);

    const handleEditorChange = (value) => {
        setFileContent(value || "");
        setSaveMessage("");
    };

    const handleSave = async () => {
        if (!selectedFile) {
            setError("Please select a file first.");
            return;
        }

        if (!hasUnsavedChanges) {
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSaveMessage("");

            const requestData = {
                path: selectedFile,
                content: fileContent,
            };

            const response = await api.post("/merge/save", requestData);

            /*
             * After saving, the current content becomes the new
             * original content. Therefore, the file is no longer dirty.
             */
            setOriginalContent(fileContent);

            setSaveMessage(
                response.data?.message || "File saved successfully."
            );

            if (onFileSaved) {
                onFileSaved(selectedFile, fileContent);
            }
        } catch (err) {
            console.error("Error saving file:", err);

            const errorMessage =
                err.response?.data?.message ||
                err.response?.data ||
                "Failed to save file.";

            setError(
                typeof errorMessage === "string"
                    ? errorMessage
                    : "Failed to save file."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleReload = async () => {
        if (hasUnsavedChanges) {
            const shouldReload = window.confirm(
                "You have unsaved changes. Are you sure you want to reload the file?"
            );

            if (!shouldReload) {
                return;
            }
        }

        await loadFileContent();
    };

    if (!selectedFile) {
        return (
            <section className="card code-editor-card">
                <div className="editor-header">
                    <div>
                        <h2>Code Editor</h2>
                        <p className="card-description">
                            Select a conflicted file to view and edit its content.
                        </p>
                    </div>
                </div>

                <div className="editor-empty-state">
                    No file selected.
                </div>
            </section>
        );
    }

    return (
        <section className="card code-editor-card">
            <div className="editor-header">
                <div>
                    <h2>Code Editor</h2>

                    <p className="editor-file-path">
                        {selectedFile}
                    </p>
                </div>

                <div className="editor-status-wrapper">
          <span
              className={`editor-status ${
                  hasUnsavedChanges
                      ? "editor-status-unsaved"
                      : "editor-status-saved"
              }`}
          >
            {hasUnsavedChanges ? "Unsaved changes" : "Saved"}
          </span>
                </div>
            </div>

            {loading && (
                <div className="editor-loading">
                    Loading file content...
                </div>
            )}

            {!loading && !error && (
                <>
                    <div className="editor-summary">
                        <div className="conflict-summary">
        <span className="summary-label">
          Conflict blocks:
        </span>

                            <span
                                className={`conflict-count-badge ${
                                    conflictCount > 0
                                        ? "has-conflicts"
                                        : "no-conflicts"
                                }`}
                            >
          {conflictCount}
        </span>
                        </div>

                        {conflictCount > 0 ? (
                            <p className="conflict-help-text">
                                Resolve all conflict markers before continuing the merge.
                            </p>
                        ) : (
                            <p className="conflict-help-text resolved-text">
                                No Git conflict markers detected in this file.
                            </p>
                        )}
                    </div>

                    <div className="monaco-container">
                        <Editor
                            height="450px"
                            language={getEditorLanguage(selectedFile)}
                            theme="vs-dark"
                            value={fileContent}
                            onChange={handleEditorChange}
                            options={{
                                automaticLayout: true,
                                minimap: {
                                    enabled: false,
                                },
                                fontSize: 14,
                                wordWrap: "on",
                                scrollBeyondLastLine: false,
                                padding: {
                                    top: 12,
                                    bottom: 12,
                                },
                            }}
                        />
                    </div>

                    <div className="editor-actions">
                        <button
                            className="primary-button"
                            onClick={handleSave}
                            disabled={saving || !hasUnsavedChanges}
                        >
                            {saving ? "Saving..." : "Save File"}
                        </button>

                        <button
                            className="secondary-button"
                            onClick={handleReload}
                            disabled={loading || saving}
                        >
                            Reload File
                        </button>

                        {saveMessage && (
                            <span className="save-success-message">
                {saveMessage}
              </span>
                        )}
                    </div>
                </>
            )}

            {error && (
                <div className="message error-message">
                    {error}
                </div>
            )}
        </section>
    );
}

export default CodeEditor;