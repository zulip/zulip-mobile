package com.zulipmobile.notifications;

public class MessageInfo {
    private String content;
    private int messageId;

    public MessageInfo(String content, int messageId) {
        this.content = content;
        this.messageId = messageId;
    }

    public String getContent() {
        return content;
    }

    public int getMessageId() {
        return messageId;
    }
}
