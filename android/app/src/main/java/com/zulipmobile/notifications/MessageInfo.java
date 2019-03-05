package com.zulipmobile.notifications;

class MessageInfo {
    private String content;
    private int messageId;

    MessageInfo(String content, int messageId) {
        this.content = content;
        this.messageId = messageId;
    }

    String getContent() {
        return content;
    }

    int getMessageId() {
        return messageId;
    }
}
