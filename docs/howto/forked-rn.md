# Using a `react-native` with cherry-picked or custom changes

Since 2024-09, we use a fork of `react-native` to make changes
atop 0.68.7. We prefer to avoid upgrading to later `react-native`
releases because it's laborious and we're eager to retire this
codebase and transition to `zulip-flutter`.

When there's an issue in React Native that calls for changes in
React Native:

- Push those changes to our RN fork, `zulip/react-native`,
  on the `0.68.7-zulip` branch.

- Update the `package.json`:

  ```json
  "react-native": "zulip/react-native#<commit-id>",
  ```

- Run `yarn`.

When building for Android, it will take longer the first time because
React Native is built from source. (`react-native` releases on NPM,
which we've been using until recently, come with a pre-built binary.)
