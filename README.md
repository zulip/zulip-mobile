# Zulip Mobile
**NOTE: VERY EARLY PROOF OF CONCEPT (NOT USABLE)**

Zulip Mobile is a new, experimental mobile client written in Javascript with React Native. The current goal is to assess whether React Native makes sense as a long-term direction for the mobile apps.

It will initially target iOS only (although most of the code will be cross-platform).

## Development

### System requirements
* Mac OS X (El Capitan recommended)
* XCode (7+ recommended)

### Dev setup
```
git clone https://github.com/zulip/zulip-mobile.git
cd zulip-mobile
npm install
```

### Running on iOS simulator
`npm run ios` will launch a new terminal with the React Native packager and open up the app in the iOS simulator.

## Testing

### Unit tests
`npm test` runs the unit test suite.

## Linting
`npm run lint` checks the codebase against our linting rules. We're using the AirBnB ES6 and React style guides.

## Why React Native?
Pros:
* Support iOS and Android with one codebase
* Familar web programming model (React + Javascript + Flexbox)

Cons:
* Potential performance issues
* Greater technical risk (new ecosystem, not as battle-tested as native code)
