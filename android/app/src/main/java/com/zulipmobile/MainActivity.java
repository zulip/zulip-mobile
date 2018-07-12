package com.zulipmobile;

/**
 * Entry point activity for the APP
 * <p>
 * Which just extends ZulipActvitiy, which also contains all the logic.
 * <p>
 * We are pretending that our package name is `com.zulipmobile.debug`
 * by adding a comment in the manifest (just for RN).
 * <p>
 * If we are pretending that our package name is something different
 * we want valid activity (entry point activity) which should be
 * present at this pretending package.
 * <p>
 * Thus extracting logic will help in avoiding logic duplicacy.
 */

public class MainActivity extends ZulipActivity {

}
