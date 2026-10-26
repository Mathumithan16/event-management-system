# Email verification

## Run the API locally

From this directory, start the backend listening on the network interface so a
phone running the app can reach it. You can double-click `run.bat` or start it
from PowerShell:

```powershell
.\run.bat
```

The backend must be reachable at port `8000`. When testing on a physical phone,
keep the phone and computer on the same Wi-Fi network and allow Python through
the Windows firewall if prompted. The server binds to `0.0.0.0` so devices on
your local network can connect. Set `EXPO_PUBLIC_API_URL` in
`mobile/.env.local` to `http://<computer-ipv4-address>:8000` as described in
the [mobile setup instructions](../mobile/README.md).

If startup reports a PostgreSQL connection timeout, check that the database
listed by `DATABASE_URL` in `.env` is available and that your network or
database access rules allow the connection. The API connects to the database
before it starts listening on port `8000`.

## Configure email

New registrations receive a six-digit verification code by email. The code
expires after 10 minutes, can be requested again after a 60-second cooldown,
and is invalidated after five incorrect attempts. An account cannot log in
until its email address is verified.

Registration sends the verification email before it completes. Configure these
variables in the backend environment (or `.env`) or registration returns an
error and no account is created:

```text
SMTP_EMAIL=sender@example.com
SMTP_APP_PASSWORD=your-smtp-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

`SMTP_HOST` and `SMTP_PORT` are optional and default to Gmail on port 587.

## JWT authentication and Google sign-in

The API issues 60-minute HS256 access tokens from both password login and
Google sign-in. Set `JWT_SECRET_KEY` in the backend `.env` to a long,
randomly-generated secret before starting the API. Keep it private and use the
same value across API instances.

The backend needs `google-auth[requests]` installed to verify Google ID tokens:
`pip install "google-auth[requests]"`.

Google sign-in verifies the Google ID token on the server. Add every OAuth
client ID used by the mobile app to `GOOGLE_CLIENT_IDS`, separated by commas.
The legacy single-value `GOOGLE_CLIENT_ID` is also accepted:

```text
GOOGLE_CLIENT_IDS=web-client-id,android-client-id,ios-client-id
```

The mobile app sends the ID token to `POST /auth/google` and receives the same
`access_token` response shape as `POST /auth/login`. Accounts created with
Google have a verified email immediately. Existing password accounts are not
automatically linked to Google; those users must continue using their current
login method.

Fresh databases get the `google_sub` field from the SQLAlchemy model.

After registration, submit the address and code to `POST /auth/verify-email`:

```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

Use `POST /auth/resend-verification` with `{"email":"user@example.com"}` to
request another code.

For an existing database, run
[`migrations/001_email_verification.sql`](./migrations/001_email_verification.sql)
first, then
[`migrations/002_google_sso.sql`](./migrations/002_google_sso.sql). Existing
accounts remain verified. Fresh databases create the added columns through
the SQLAlchemy models.
