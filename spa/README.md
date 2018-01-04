## Getting Started

If you haven't already done so, [sign up](https://auth0.com) for your free Auth0 account and create a new client in the [dashboard](https://manage.auth0.com). Find the **domain** and **client ID** from the settings area and add the URL for your application to the **Allowed Callback URLs** box.

```bash
cd 01-Login
npm install
```

## Set the Client ID and Domain

Rename the `auth0-variables.js.example` file to `auth0-variables.js` and provide the **client ID** and **domain** there. This file is located in `src/auth/`.

## Run the Application

```bash
npm start
```

The application will be served at `http://localhost:8080`.

## Author

[Janne Koponen](https://arcticloon.fi)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE.txt) file for more info.

