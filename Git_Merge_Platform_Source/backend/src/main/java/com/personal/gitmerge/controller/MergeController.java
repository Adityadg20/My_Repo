package com.personal.gitmerge.controller;


import com.personal.gitmerge.dto.*;
import com.personal.gitmerge.service.GitMergeService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/merge")
@CrossOrigin("*")
public class MergeController {

    private final GitMergeService service;

    public MergeController(GitMergeService service) {
        this.service = service;
    }

    @PostMapping("/start")
    public Object startMerge(@RequestBody MergeRequest request) {

        return service.startMerge(request);

    }
    @GetMapping("/file")
    public FileResponse getConflictFile(
            @RequestParam String path) {

        return service.getConflictFile(path);
    }
    @PostMapping("/save")
    public String saveFile(@RequestBody SaveFileRequest request) {
        service.saveFile(request);
        return "File saved successfully";
    }
    @PostMapping("/stage")
    public String stageFile(@RequestBody StageFileRequest request) {

        service.stageFile(request);

        return "File staged successfully";
    }
    @PostMapping("/continue")
    public MergeResponse continueMerge() {
        return service.continueMerge();
    }
    @PostMapping("/push")
    public MergeResponse pushChanges() {
        return service.pushChanges();
    }
}