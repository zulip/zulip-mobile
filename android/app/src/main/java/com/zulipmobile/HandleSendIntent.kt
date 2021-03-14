package com.zulipmobile;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.content.ComponentName;
import android.os.Bundle;

class HandleSendIntent : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        intent.component = ComponentName(applicationContext.packageName, "com.zulipmobile.MainActivity")
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        startActivity(intent)
        finish()
    }
}
