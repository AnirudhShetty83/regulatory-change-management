package com.internship.tool.controller;

import com.internship.tool.entity.RegulatoryChange;
import com.internship.tool.service.RegulatoryChangeService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/changes")
public class RegulatoryChangeController {

    private final RegulatoryChangeService service;

    public RegulatoryChangeController(RegulatoryChangeService service) {
        this.service = service;
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @PostMapping
    public ResponseEntity<RegulatoryChange> createChange(@RequestBody RegulatoryChange newChange) {
        return ResponseEntity.ok(service.createChange(newChange));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<RegulatoryChange> updateChange(
            @PathVariable Long id, 
            @RequestBody RegulatoryChange updateData) {
        return ResponseEntity.ok(service.updateChange(id, updateData));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> softDeleteChange(@PathVariable Long id) {
        service.softDelete(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('VIEWER', 'MANAGER', 'ADMIN')")
    @GetMapping("/search")
    public ResponseEntity<Page<RegulatoryChange>> searchChanges(
            @RequestParam(name = "q", required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? 
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        return ResponseEntity.ok(service.searchChanges(keyword, pageable));
    }

    @PreAuthorize("hasAnyRole('VIEWER', 'MANAGER', 'ADMIN')")
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(service.getDashboardStats());
    }
}
