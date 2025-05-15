package com.malnutrition.backend.domain.alarm.alarm.repository.alarmRepository;

import com.malnutrition.backend.domain.alarm.alarm.entity.Alarm;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlarmRepository extends JpaRepository<Alarm, Long> {
    Slice<Alarm> findByListener_Id (Long id, Pageable pageable);

    List<Alarm> findByListener_Id (Long id);

}
