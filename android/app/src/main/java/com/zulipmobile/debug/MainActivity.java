package com.zulipmobile.debug;

import com.zulipmobile.ZulipActivity;

/**
 * Entry point activity for debug build
 * <p>
 * We are pretending that our package name is
 * `com.zulipmobile.debug` (by adding a comment
 * in manifest (see previous commits)) to
 * `react-native run-android`.
 * <p>
 * So there should a laucher activity present
 * at this pretended package name.
 * <p>
 * This activity extends the ZulipActivity which
 * contains all the logics.
 **/

public class MainActivity extends ZulipActivity {

}
