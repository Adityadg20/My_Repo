package com.personal.gitmerge.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MergeResponse {

    private String status;
    private String currentBranch;
    private String message;
    private List<String> conflictedFiles;
}