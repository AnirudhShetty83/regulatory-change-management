package com.internship.tool.service;

import com.internship.tool.entity.RegulatoryChange;
import com.internship.tool.repository.RegulatoryChangeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class RegulatoryChangeService {

    private final RegulatoryChangeRepository repository;

    public RegulatoryChangeService(RegulatoryChangeRepository repository) {
        this.repository = repository;
    }

    public RegulatoryChange updateChange(Long id, RegulatoryChange updateData) {
        RegulatoryChange existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Regulatory Change not found with id: " + id));

        // Note: In a real app, you might use an ObjectMapper or map specific fields explicitly
        if (updateData.getTitle() != null) existing.setTitle(updateData.getTitle());
        if (updateData.getDescription() != null) existing.setDescription(updateData.getDescription());
        if (updateData.getCategory() != null) existing.setCategory(updateData.getCategory());
        if (updateData.getRegulatoryBody() != null) existing.setRegulatoryBody(updateData.getRegulatoryBody());
        if (updateData.getStatus() != null) existing.setStatus(updateData.getStatus());
        if (updateData.getPriority() != null) existing.setPriority(updateData.getPriority());
        if (updateData.getImpactScore() != null) existing.setImpactScore(updateData.getImpactScore());
        if (updateData.getEffectiveDate() != null) existing.setEffectiveDate(updateData.getEffectiveDate());
        if (updateData.getDeadline() != null) existing.setDeadline(updateData.getDeadline());

        return repository.save(existing);
    }

    public void softDelete(Long id) {
        RegulatoryChange existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Regulatory Change not found with id: " + id));
        existing.setIsDeleted(true);
        repository.save(existing);
    }

    @Transactional(readOnly = true)
    public Page<RegulatoryChange> searchChanges(String keyword, Pageable pageable) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return repository.findAllByIsDeletedFalse(pageable);
        }
        return repository.searchByKeyword(keyword, pageable);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalActive = repository.countByIsDeletedFalse();
        stats.put("totalActive", totalActive);

        // Convert List<Object[]> to Map<String, Long> for Status
        Map<String, Long> byStatus = new HashMap<>();
        List<Object[]> statusCounts = repository.countByStatus();
        for (Object[] row : statusCounts) {
            byStatus.put(row[0].toString(), (Long) row[1]);
        }
        stats.put("byStatus", byStatus);

        // Convert List<Object[]> to Map<String, Long> for Priority
        Map<String, Long> byPriority = new HashMap<>();
        List<Object[]> priorityCounts = repository.countByPriority();
        for (Object[] row : priorityCounts) {
            byPriority.put(row[0].toString(), (Long) row[1]);
        }
        stats.put("byPriority", byPriority);

        return stats;
    }
}
