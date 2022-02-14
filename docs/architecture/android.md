# Android

The bulk of our codebase is platform-independent code, written in JS
to run in React Native's JS environment.  But we also need some
Android-native code and some iOS-native code, as well as build
configuration on each platform.

Notifications, in particular, rely heavily on platform-native code.


## Building, testing, running

Our build config on Android is written in Gradle, in the Groovy
language, following typical usage for Android apps.  See upstream
Android [build config docs][] for copious tips and details.

[build config docs]: https://developer.android.com/studio/build

When editing the build config, the reference docs for the [Gradle DSL][]
and the [Android Gradle Plugin][] are highly recommended.

[Gradle DSL]: https://docs.gradle.org/4.10.3/dsl/
[Android Gradle Plugin]: https://google.github.io/android-gradle-dsl/current/

For Android-specific tests, see the Android section of our
[testing doc](../howto/testing.md).

For building and running the app, see our
[main guide](../howto/build-run.md) and in particular the
"Android tips" section.


## Editing

For working on the Android build config and the Android-native code,
it's highly recommended to use Android Studio.  See our
[editor guide](../howto/editor.md).


## Kotlin and Java

Until early 2019, the Android-native code in our app was entirely
Java.  Since then, we've started using [Kotlin][].

[Kotlin]: http://kotlinlang.org/

Kotlin is a natural successor to Java: it offers numerous improvements
to make typical code shorter, clearer, and more type-safe, while
maintaining extremely smooth interoperability with Java.  For these
reasons Android upstream has invested heavily in
[first-class support][android-kotlin] for using Kotlin on Android,
and we've decided to move to it.

[android-kotlin]: https://developer.android.com/kotlin


### Learning more about Kotlin

In general: if you're already familiar with Java, don't worry about
learning Kotlin.  There's a lot that will be *helpful* to eventually
learn -- but only a small amount you need to learn *first*, before
just diving in and working with Kotlin.  You should spend no more than
a few hours on reading or exercises before starting to use it "for
real", either in Zulip or another real project.

Some resources for *getting started*:
* [Kotlin by Example][], from Kotlin upstream
* [Other tutorials][] listed on Kotlin upstream docs
* [Get Started with Kotlin on Android][], in Android upstream docs

[Kotlin by Example]: https://play.kotlinlang.org/byExample/overview
[Other tutorials]: https://kotlinlang.org/docs/tutorials/
[Get Started with Kotlin on Android]: https://developer.android.com/kotlin/get-started.html

Once you're using Kotlin for real, you'll have plenty of questions.
This is a great time to read the main documentation!  A powerful,
general, algorithm for learning is:
1. Try doing things you want to do.
2. Run into something you don't understand or don't know how to do.
3. Look it up *in a high-quality reference- or textbook-style source.*
   * For example, the official language or platform documentation for
     Kotlin or Android; or for JavaScript, MDN.
   * Anti-example: StackOverflow, with rare exceptions.  On the other
     hand, a StackOverflow answer is often a helpful step in *finding*
     the right documentation to read: do a web search for your
     problem, see an SO answer with the name of a possible solution,
     and use that to find documentation on that solution.
4. Read the entire section/chapter/article related to the question.
   Aim for a conceptual understanding that will help you answer a
   whole cluster of related questions.
   * This is hard work!  It will take more time at first than not
     doing it.  You'll probably get less development done today.
   * But it's a powerful, compounding investment that will make you
     more productive next week and next year.  Often you'll get more
     done this way even this week, and you almost surely will over the
     next year.
5. Do the thing you just learned how to do, and repeat from step 1.

Good resources for looking things up and learning more include:
* [Kotlin reference docs][] upstream -- tons of good stuff here,
  including many pages you'll definitely want to read eventually.
  Here's an incomplete list:
  * Key concepts that don't exist in Java:
    [null safety][], [extensions][], [inline functions][].
  * Key concepts that exist in Java but with differences:
    [control flow (especially `when`)][control-flow];
    [classes][].
  * Some [Kotlin idioms][].  This one is like StackOverflow answers;
    once you find something relevant here, you'll want to go look up
    its real documentation.
* [Kotlin standard library reference][kotlin-stdlib]; especially on
  [collections (List, Iterable, Map, etc.)][kotlin-collections].
* A [Kotlin style guide][android-kotlin-style],
  and a [bonus style guide][android-kotlin-java-interop] for Kotlin
  code that'll be used from Java.  These come from Android upstream,
  but their content isn't specific to Android.
* [Android KTX][], a library that uses Kotlin features to provide nicer
  interfaces to Android APIs.
* Various resources linked from [Android upstream][android-kotlin-resources].

[Kotlin reference docs]: https://kotlinlang.org/docs/reference/basic-types.html
[null safety]: https://kotlinlang.org/docs/reference/null-safety.html
[extensions]: https://kotlinlang.org/docs/reference/extensions.html
[inline functions]: https://kotlinlang.org/docs/reference/inline-functions.html
[control-flow]: https://kotlinlang.org/docs/reference/control-flow.html
[classes]: https://kotlinlang.org/docs/reference/classes.html
[Kotlin idioms]: https://kotlinlang.org/docs/reference/idioms.html
[kotlin-stdlib]: https://kotlinlang.org/api/latest/jvm/stdlib/index.html
[kotlin-collections]: https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/index.html
[android-kotlin-style]: https://developer.android.com/kotlin/style-guide
[android-kotlin-java-interop]: https://developer.android.com/kotlin/interop#kotlin_for_java_consumption
[Android KTX]: https://developer.android.com/kotlin/ktx.html
[android-kotlin-resources]: https://developer.android.com/kotlin/resources


### Migrating our code

Our strategy is:
* All **new code is in Kotlin**, not Java.
* All **code we're significantly modifying**, we first migrate to
  Kotlin, if it's still in Java.
* Some parts of our Java code rarely need changes.  Any code we aren't
  modifying, it's fine to leave as Java indefinitely.

Specific tactics when migrating a piece of Java code to Kotlin:
* Always make *separate commits* for migrating to Kotlin vs. making
  any other refactors, or any changes to the code's behavior.  This is
  an example of making [clear and coherent commits][].
* Use the [*automatic conversion*][automatic-conversion] feature of
  Android Studio (which hilariously even has a keyboard shortcut:
  Ctrl+Alt+Shift+K.)
  * Make a separate commit for the automatic conversion, typically
    with no other changes at all.  This is another example of clear
    and coherent commits: separating large, boring, mechanical changes
    from more interesting manual changes helps make both changes
    easier to read and understand.
  * Further changes to make the new Kotlin code more idiomatic, and to
    take advantage of Kotlin features to make it clearer, are great.
    These should be done as separate commits, as usual.

[automatic-conversion]: https://developer.android.com/studio/projects/add-kotlin#convert-to-kotlin-code
[clear and coherent commits]: https://zulip.readthedocs.io/en/latest/contributing/version-control.html
