package com.malnutrition.backend.domain.counseling.schedule.repository;

import com.malnutrition.backend.domain.counseling.schedule.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

}
