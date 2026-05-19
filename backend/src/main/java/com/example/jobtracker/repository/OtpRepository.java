package com.example.jobtracker.repository;

import com.example.jobtracker.entity.OtpRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OtpRepository extends JpaRepository<OtpRecord, Long> {
    Optional<OtpRecord> findByIdentifier(String identifier);
    void deleteByIdentifier(String identifier);
}
