package com.personal.gitmerge.dto;

import lombok.Data;

@Data
public class MergeRequest {
    public String repositoryUrl;
    public String sourceBranch;
    public String targetBranch;

}
