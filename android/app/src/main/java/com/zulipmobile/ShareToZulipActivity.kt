package com.zulipmobile;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.content.ComponentName;
import android.os.Bundle;

/// The activity for when a user shares to Zulip from another app.
///
/// This is a tiny shim activity, which forwards the user on to our
/// [MainActivity] to get the actual UI for sharing to Zulip.
class ShareToZulipActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        intent.component = ComponentName(applicationContext.packageName, "com.zulipmobile.MainActivity")
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        startActivity(intent)
        finish()
    }
}
