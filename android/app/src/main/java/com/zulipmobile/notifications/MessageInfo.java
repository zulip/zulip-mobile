package com.zulipmobile.notifications;

public class MessageInfo {
    private String content;
    private int messageId;
    private long timestamp;

    public MessageInfo(String content, int messageId, long timestamp) {
        this.content = content;
        this.messageId = messageId;
        this.timestamp = timestamp;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public String getContent() {
        return content;
    }

    public int getMessageId() {
        return messageId;
    }
}
