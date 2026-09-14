package com.personal.gitmerge.service;

import com.personal.gitmerge.dto.*;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.MergeResult;
import org.eclipse.jgit.api.PullResult;
import org.eclipse.jgit.api.Status;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.lib.Ref;
import org.eclipse.jgit.transport.PushResult;
import org.eclipse.jgit.transport.UsernamePasswordCredentialsProvider;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class GitMergeService {

    private final WorkspaceService workspaceService;

    public GitMergeService(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    private Git openRepository(Path workspace) throws IOException {
        return Git.open(workspace.toFile());
    }

    private void checkoutBranch(Git git, String branch) throws GitAPIException {
        git.checkout()
                .setName(branch)
                .call();
    }

    private PullResult pullLatest(Git git) throws GitAPIException {

        PullResult pullResult = git.pull().call();

        if (!pullResult.isSuccessful()) {
            throw new RuntimeException("Pull failed");
        }

        return pullResult;
    }

    public MergeResponse startMerge(MergeRequest request) {
        Path workspace = workspaceService.getWorkspace();

        try {
            Git git = openRepository(workspace);

            checkoutBranch(git, request.getTargetBranch());
            PullResult pullResult = pullLatest(git);

            Ref sourceBranch = git.getRepository()
                    .findRef(request.getSourceBranch());

            MergeResult mergeResult = git.merge()
                    .include(sourceBranch)
                    .call();
            MergeResult.MergeStatus status = mergeResult.getMergeStatus();

            String branch = git.getRepository().getBranch();
            if (!status.isSuccessful()) {
                Map<String, int[][]> conflicts = mergeResult.getConflicts();
                List<String> conflictedFiles = new ArrayList<>(conflicts.keySet());

                return new MergeResponse(
                        "CONFLICTING",
                        git.getRepository().getBranch(),
                        "Merge conflicts detected",
                        conflictedFiles);


            } else {
                return new MergeResponse(
                        mergeResult.getMergeStatus().toString(),
                        branch,
                        "Merge executed successfully",
                        null
                );
            }
        } catch (IOException | GitAPIException e) {
            return new MergeResponse(
                    "FAILED",
                    null,
                    e.getMessage(),
                    null
            );
        }
    }


    public FileResponse getConflictFile(String path) {

        try {

            Path workspace = workspaceService.getWorkspace().toAbsolutePath().normalize();
            Path filePath = workspace.resolve(path).normalize();
            String content = Files.readString(filePath);
            if (!filePath.startsWith(workspace)) {
                throw new RuntimeException("Invalid file path");
            }
            else {
                return new FileResponse(path, content);
            }
        } catch (IOException e) {

            throw new RuntimeException("Unable to read file: " + e.getMessage());

        }

    }
    public void saveFile(SaveFileRequest request) {

        try {

            Path workspace = workspaceService.getWorkspace();

            Path file = workspace.resolve(request.getPath());

            Files.writeString(file, request.getContent());

        } catch (IOException e) {

            throw new RuntimeException(e);

        }

    }
    public void stageFile(StageFileRequest request) {

        try {

            Path workspace = workspaceService.getWorkspace();

            Git git = Git.open(workspace.toFile());

            git.add()
                    .addFilepattern(request.getPath())
                    .call();

        } catch (Exception e) {

            throw new RuntimeException(e);

        }

    }
    public MergeResponse continueMerge() {

        try {

            Path workspace = workspaceService.getWorkspace();

            Git git = Git.open(workspace.toFile());

            Status status = git.status().call();

            if (!status.getConflicting().isEmpty()) {

                return new MergeResponse(
                        "FAILED",
                        git.getRepository().getBranch(),
                        "Resolve all conflicts first.",
                        new ArrayList<>(status.getConflicting())
                );

            }

            git.commit()
                    .setMessage("Merge completed via Git Merge Platform")
                    .call();

            return new MergeResponse(
                    "SUCCESS",
                    git.getRepository().getBranch(),
                    "Merge completed successfully",
                    null
            );

        } catch (Exception e) {

            return new MergeResponse(
                    "FAILED",
                    null,
                    e.getMessage(),
                    null
            );

        }

    }


    public MergeResponse pushChanges() {

        try {

            Path workspace = workspaceService.getWorkspace();

            Git git = Git.open(workspace.toFile());

            Iterable<PushResult> pushResults = git.push()
                    .setRemote("origin")
                    .setCredentialsProvider(
                            new UsernamePasswordCredentialsProvider(
                            System.getenv("GIT_USERNAME"),
                            System.getenv("GIT_TOKEN")
                    )
                    )
                    .call();;

            return new MergeResponse(
                    "SUCCESS",
                    git.getRepository().getBranch(),
                    "Changes pushed successfully.",
                    null
            );

        } catch (Exception e) {

            return new MergeResponse(
                    "FAILED",
                    null,
                    e.getMessage(),
                    null
            );

        }
    }
}