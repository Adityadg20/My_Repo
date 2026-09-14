package com.personal.gitmerge.service;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@Service
public class WorkspaceService {

    @Value("${workspace.root}")
    private String workspaceRoot;

    public Path getWorkspace() {

        Path workspacePath = Path.of(workspaceRoot, "My_Repo");

        if (!Files.exists(workspacePath)) {
            throw new RuntimeException(
                    "Repository not found in workspace/My_Repo");
        }

        return workspacePath;

    }
}