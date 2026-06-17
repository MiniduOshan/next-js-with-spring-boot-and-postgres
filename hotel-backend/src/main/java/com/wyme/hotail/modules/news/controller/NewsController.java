package com.wyme.hotail.modules.news.controller;

import com.wyme.hotail.core.exception.ResourceNotFoundException;
import com.wyme.hotail.modules.news.entity.NewsUpdate;
import com.wyme.hotail.modules.news.repository.NewsUpdateRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/news")
public class NewsController {

    private final NewsUpdateRepository newsUpdateRepository;

    public NewsController(NewsUpdateRepository newsUpdateRepository) {
        this.newsUpdateRepository = newsUpdateRepository;
    }

    @GetMapping
    public ResponseEntity<List<NewsUpdate>> getNews() {
        return ResponseEntity.ok(newsUpdateRepository.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping
    public ResponseEntity<NewsUpdate> createNews(
            @RequestHeader(value = "x-owner-email", required = false) String author,
            @RequestBody NewsUpdate news) {
        if (author != null) {
            news.setAuthor(author);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(newsUpdateRepository.save(news));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NewsUpdate> updateNews(@PathVariable("id") UUID id, @RequestBody NewsUpdate updated) {
        NewsUpdate existing = newsUpdateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("News update not found"));
        existing.setTitle(updated.getTitle());
        existing.setContent(updated.getContent());
        existing.setStatus(updated.getStatus());
        return ResponseEntity.ok(newsUpdateRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNews(@PathVariable("id") UUID id) {
        newsUpdateRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
