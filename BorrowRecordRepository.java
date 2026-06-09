package com.library.backend.repository;

import com.library.backend.model.BorrowRecord;
import com.library.backend.model.Member;
import com.library.backend.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {
    List<BorrowRecord> findByMember(Member member);
    List<BorrowRecord> findByBookAndReturnDateIsNull(Book book);
}
