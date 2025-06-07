package com.malnutrition.backend.domain.chatroom.groupChatRoom.entity;

import com.malnutrition.backend.domain.chatroom.groupChatMessage.entity.GroupChatMessage;
import com.malnutrition.backend.domain.chatroom.groupChatUser.entity.GroupChatUser;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "group_chat_rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GroupChatRoom extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trainer_id", nullable = false)
    private User createdBy;

    @OneToMany(mappedBy = "groupChatRoom", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GroupChatUser> participants;

    @OneToMany(mappedBy = "groupChatRoom", cascade = CascadeType.ALL)
    private List<GroupChatMessage> messages;
}