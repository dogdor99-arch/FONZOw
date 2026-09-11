# LINE notifications and release tests

## Current implementation

When a visitor clicks **ติดต่อสอบถาม / สั่งซื้อโดยตรง** on a Guitar Shop detail page, the browser calls the public `enquiry.contactClick` tRPC mutation. The server then sends a best-effort text push through the LINE Messaging API. The LINE access token is read only from server environment variables and is never sent to the browser. If LINE is not configured or the push fails, navigation still continues normally and the customer is not blocked.

## Render environment variables

Add these two secrets to the Render service environment. Do not commit them or place them in frontend `VITE_*` variables.

```text
LINE_CHANNEL_ACCESS_TOKEN=<LINE Messaging API channel access token>
LINE_RECIPIENT_ID=<LINE user ID or group ID>
```

The LINE Official Account must be allowed to message the recipient. For a group recipient, the bot must be joined to that group. The recipient ID is not the Official Account ID; it is the user or group ID that should receive the push.

## LINE Developer Console setup

Create or select a LINE Official Account, enable the Messaging API channel, issue a long-lived channel access token, and obtain the recipient ID. Add the two secrets to Render, redeploy, then test by clicking the direct-contact button on a product detail page. The message includes the product name, product code, current page URL, and Bangkok-local timestamp.

The implementation uses LINE's official push endpoint:

```text
POST https://api.line.me/v2/bot/message/push
```

## Testing with a real database

The current sandbox does not contain `DATABASE_URL`, so database-dependent Vitest cases cannot be run here. The source environment check reported `DATABASE_URL_MISSING`. To run all tests against a real test database, set a dedicated non-production MySQL/TiDB URL in the shell or CI secret, then run:

```bash
DATABASE_URL='mysql://USER:PASSWORD@HOST:3306/TEST_DATABASE' pnpm test -- --run
```

Use a disposable test database or a database snapshot. Do not use the live production database for destructive or stateful tests. The expected current result is 47 tests total; the prior run passed 42 and failed 5 only because the database was unavailable.

After configuring the test database, run the following verification sequence:

```bash
DATABASE_URL='...' pnpm check
DATABASE_URL='...' pnpm test -- --run
DATABASE_URL='...' pnpm build
```

The test command must report all test files and tests passing before calling the release fully verified.
