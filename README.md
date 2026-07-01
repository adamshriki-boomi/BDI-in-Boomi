<p align="center">
  <img src="./src/components/Icons/icons/R_logo.svg" height="80">
</p>

# Table Of Contents

- [Dev Instructions](#Dev-Instructions)
  - [3rd Party Frameworks](#3rd-Party-Frameworks)
  - [Recommended DevTools](#Recommended-DevTools)
- [Project Style Guide](#Project-Style-Guide)
  - [API](#api)
  - [State Managment](#State-Managment)
    - [consuming a store state or actions](#consuming-a-store-state-or-actions)
    - [components & containers](#components-&-containers)
    - [styles](#styles)
    - [routing](#routing)
    - [forms](#forms)
    - [hooks lib](#hooks-lib)
    - [Icons & Images](#Icons-&-Images)
- [Code Conventions](#conventions)
- [Editor Configuration](#Editor-Configuration)
  - [VSCODE](#VSCODE)
- [Testing](#Testing)
  - [E2E - cypress](#E2E---cypress)
  - [Component Testing](#Component-Testing)
- [Storybook](#Storybook)



##Deployment
-[Docs](https://rivery-jira.atlassian.net/wiki/spaces/RnD/pages/572719143/Deploy+react+rivery+to+production)



# Dev Instructions
Project should run on ssl mode with certificate.

[//]: # (- create a `local certificate` by following https://www.freecodecamp.org/news/how-to-set-up-https-locally-with-create-react-app#creating-a-ssl-certificate)

[//]: # (  - make sure you add the correct domain to certificate creation script `mkcert -key-file ./.cert/key.pem -cert-file ./.cert/cert.pem "localhost.rivery.in"`)

- add new line in your **etc/hosts** `127.0.0.1 localhost.rivery.in` (https://localhost.rivery.in becomes available)
- run `nvm use` to set the node version (install nvm if you don't have it)
- run `export NODE_TLS_REJECT_UNAUTHORIZED=0` so cypress installation will work with zscaler
- run `npm i` 
- use `sudo npm start` (that's required for ssl and port:443 in localhost)
- use `sudo npm run storybook` to run storybook (requires sudo because `npm start` runs with it)
- use `npm run e2e` or `npm run e2e:prod` to run cypress end to end tests
(running cypress on prod requires to change your .env.development file to run on production)
## 3rd Party Frameworks

This project was bootstrapped with:

- [Create React App](https://github.com/facebook/create-react-app)
- [Redux](https://redux.js.org/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Hook Form](https://react-hook-form.com/)
- [React Table](https://react-table.tanstack.com/)

## Recommended DevTools

- [Redux DevTools](http://extension.remotedev.io/)
- [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en)

# Project Style Guide

## API

- all api's are defined in `src/api`
- new endpoints should be defined at `src/api/endpoints`, and added to `src/api/endpoints/index.ts`
- then, api's are available via `API[name_of_api][method_name]`, i.e `API.environments.fetch()`

## State Managment

- The Store is configured in `src/store`,
- to create a new reducer:
  - duplicate the relevant reducer: **adapter** for a collection (environments), **slice** for non-collection
    - adapter - after duplicating the directory, replace "_adapter_" with the new reducer name and "_Adapter_" respectivley. make sure to rename files with the same strategy as well.
  - define proper **REDUCER_KEY** in its `XYZ.types.ts`
  - add import statement in `reducers.ts`

### consuming a store state or actions

communication with the store in **components**, should be made only via the store hooks, i.e `useCore()`

## Components & Containers

- **src/containers** includes components that usually are top level OR views of routes
- **src/components** is the reusable components lib that can be used in both containers and components

when adding a component, add an export statement in **src/components/index.ts**

## Styles

- base UI library is bootstrap
- custom variables should be set in [src/styles/bootstrap/\_variables.scss](src/styles/bootstrap/_variables.scss)

setting a bootstrap scss variable is prefferd over new manual classes. consult [Bootstrap's Themeing Guide](https://getbootstrap.com/docs/4.6/getting-started/theming/)

## Routing

- routing must be performed by **react-router-dom**
- main app routes are defined in `src/app`
- sub-routes may be defined inside **src/containers**
- a route that requires an authentication should use **PrivateRoute.tsx**

## forms

- form interactions should use [react-hook-form](https://react-hook-form.com/)

## hooks lib

- useful hooks are available at https://streamich.github.io/react-use

## Icons & Images

- any new svg icon should be added to `components/Icons/icons`
- name is as the jsx component you want - i.e - RiveryIcon
- next, run `npm run build:svg` - this creates a `RiveryIcon.tsx` in `components/Icons/components` and exported via `components/Icons`
- use `<RiverIcon>`
- for dev and display - use `npm run icons` to see all icons in a local server

## Code Conventions

- component files should be named with **PascalCase.tsx**
- component scss file should be named with **PascalCase.tsx**
- hooks files should be named **useCamelCase.ts**
- all other files should include a relevant suffix - **feature.suffix.ts**
- project is using eslint and prettier for linting and code formatting (configure editor properly)
- each screen (or major feature) should have its own directory under **src/containers**
- storybook stories should be places next to its component file. it should be names exactly as the components file along with the prefix, i.e, `COMPONENT.stories.tsx`
- all constants/globals should be defined in `.env.*` files on the project's root

## Editor Configuration

### VSCODE

if using `VSCODE`, this project includes a workspace settings and recommended extensions.

View the recommended extensions:

- open the project in vscode,
- click on the "Extensions" item on the sidebar (or via menu: View -> Extensions)
- click on the filter icon and select “Recommended” from the menu
- A panel of "Workspace Recommendations" should appear
- installing "Peacock" will set the editor with Rivery brand color

## Testing

e2e tests are preffered over component testing.
there are few methods to test rivery's front end app:

### E2E - cypress

- tests are placed at `./cypress/integration`
- follow [https://docs.cypress.io/](https://docs.cypress.io/)
- cypress env variables are defined within `./cypress.json` - follow [cypress guide on env variables](https://docs.cypress.io/guides/guides/environment-variables.html) (local variation can be created in a non-repo file `./cypress.env.json` - ignored from git)

### Component Testing

test should be written with [testing-library](https://testing-library.com/docs/) with [react support](https://testing-library.com/docs/react-testing-library/intro)

## Storybook

for mocking api, [MSW.js](https://mswjs.io/docs/) is used, [demo in storybook](https://msw-sb.netlify.app/?path=/story/guides-introduction--page)

each story should mock the relevant api it's using

## Version Release

using npm's `npm version TYPE` (TYPE can be patch | minor | major or a semver pattern X.Y.Z)

postversion script handles adding tags and push those to master

After running npm version, `git push master` is required since `package.version` is updated.

## Available Scripts

### `sudo npm start`

Runs the app in the development mode.<br />
Open [https://rivery.local](https://rivery.local) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
