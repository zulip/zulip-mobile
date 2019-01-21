package com.zulipmobile;

public class AppSession {
    private static AppSession appSession;

    private String shareDataType;
    private String shareData;

    public static AppSession getAppSession() {
        if (appSession == null) {
            appSession = new AppSession();
        }
        return appSession;
    }

    public String getShareDataType() {
        return shareDataType;
    }

    public void setShareDataType(String shareDataType) {
        this.shareDataType = shareDataType;
    }

    public String getShareData() {
        return shareData;
    }

    public void setShareData(String shareData) {
        this.shareData = shareData;
    }
}
