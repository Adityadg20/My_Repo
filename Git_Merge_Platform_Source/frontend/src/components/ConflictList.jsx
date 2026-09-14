function ConflictList({ mergeResult, onFileSelect }) {
    const conflictedFiles = mergeResult?.conflictedFiles || [];

    return (
        <section className="card conflict-list-card">
            <div className="section-header">
                <div>
                    <h2>Conflicted Files</h2>
                    <p className="card-description">
                        Files requiring manual conflict resolution.
                    </p>
                </div>

                {conflictedFiles.length > 0 && (
                    <span className="conflict-count">
            {conflictedFiles.length}{" "}
                        {conflictedFiles.length === 1 ? "file" : "files"}
          </span>
                )}
            </div>

            {!mergeResult && (
                <div className="empty-state">
                    Start a merge to view conflicted files.
                </div>
            )}

            {mergeResult && conflictedFiles.length === 0 && (
                <div className="success-state">
                    No conflicted files found.
                </div>
            )}

            {conflictedFiles.length > 0 && (
                <div className="file-list">
                    {conflictedFiles.map((file, index) => (
                        <button
                            key={`${file}-${index}`}
                            className="file-item"
                            onClick={() => onFileSelect && onFileSelect(file)}
                        >
                            <span className="file-icon">📄</span>
                            <span className="file-name">{file}</span>
                            <span className="file-arrow">›</span>
                        </button>
                    ))}
                </div>
            )}
        </section>
    );
}

export default ConflictList;