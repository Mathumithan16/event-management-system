# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the backend from the repository's `backend` directory. See the
   [backend setup instructions](../backend/README.md).

3. If testing on a physical device, create a `.env.local` file in this
   directory and set the backend computer's LAN address:

   ```text
   EXPO_PUBLIC_API_URL=http://192.168.1.10:8000
   ```

   Replace `192.168.1.10` with the computer's IPv4 address from `ipconfig`.
   Keep the phone and computer on the same Wi-Fi network. Start the backend
   with `backend/run.bat`; it must listen on `0.0.0.0:8000` and be allowed
   through Windows Firewall. On the phone, open
   `http://192.168.1.10:8000/` in a browser to confirm it can reach the API.
   If an older packaged `EventManagementAPI.exe` is already running, close it
   before starting `run.bat`; the packaged version may listen only on
   `127.0.0.1`, which phones cannot access. Restart Expo after changing
   `.env.local`.
   For web on the same computer, the default API address is
   `http://127.0.0.1:8000`.

4. To enable Google sign-in, create OAuth client IDs for the app's Android,
   iOS, and web platforms in Google Cloud Console. Set the client IDs used by
   your targets in `mobile/.env.local`:

   ```text
   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id
   ```

   Also allow those same IDs in the backend `GOOGLE_CLIENT_IDS` setting as
   described in the [backend setup instructions](../backend/README.md).
   Configure the OAuth clients with the Android package/SHA-1, iOS bundle ID,
   and web redirect settings for the app you build. These client IDs are public
   identifiers, not client secrets. Restart Expo after changing the file.

5. Start the app

   ```bash
   npx expo start
   ```

   Reload the app after changing `.env.local`.

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
