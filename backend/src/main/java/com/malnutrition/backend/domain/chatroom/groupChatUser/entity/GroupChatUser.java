package com.malnutrition.backend.domain.chatroom.groupChatUser.entity;

import com.malnutrition.backend.domain.chatroom.chatmessage.enums.UserType;
import com.malnutrition.backend.domain.chatroom.groupChatRoom.entity.GroupChatRoom;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "group_chat_users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GroupChatUser extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_chat_room_id")
    private GroupChatRoom groupChatRoom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private boolean isMuted;
}
