package com.zulipmobile.notifications;

public class InvalidNotificationEventException extends Exception {

    public InvalidNotificationEventException(String invalidNotificationEvent) {
        super(invalidNotificationEvent);
    }
}
