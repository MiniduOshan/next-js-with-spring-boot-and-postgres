package com.wyme.hotail.modules.news.repository;

import com.wyme.hotail.modules.news.entity.NewsUpdate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NewsUpdateRepository extends JpaRepository<NewsUpdate, UUID> {
    List<NewsUpdate> findAllByOrderByCreatedAtDesc();
}
