# Performance

## Rerenders
Duplicate rerenders of some expensive components like [MessageList](https://github.com/zulip/zulip-mobile/blob/27483c9a8d9f8e62eeaa02846906cbc26e137b88/src/message/MessageList.js) can be a significant performance bottleneck.

Try to follow these tips to avoid needless rerenders of your components.

1. Divide your components into Presentational and Container components. This helps in separation of concerns and also increase performance.
Refer to this [document](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0).

    Also have a look at these [redux examples] (https://github.com/reactjs/redux/tree/master/examples) to gain a better understanding of this separation.

2. Use [PureComponent](https://facebook.github.io/react/docs/react-api.html#react.purecomponent) where props and component level state is not mutated.

3. Always declare handler functions outside your render method. This prevents new references to your function from being passed every time your component receives props, for example:

    prefer
    ```javascript
        handleOnPress() {
            ...do something
        }

        render() {
            return (
                <WrappedComponent onPress={this.handleOnPress} />
            );
        }
    ```

    over
    ```javascript
        render() {
            return (
                <WrappedComponent onPress={() => {...do something}} />
            );
        }
    ```

4. Avoid using `…this.props`
Passing all the props to wrapped components is generally not needed and requires more shallow comparisons than required (when using PureComponent).

5. Prefer using selectors to access a part of state. For anything that needs calculating use [reselect's](https://github.com/reactjs/reselect/blob/master/README.md) memoized selectors.

6. In general, try to have primitive props, which are immutable and will make switching to PureComponents easier.

7. Make sure to not create new objects on each render when passing to children. This will nullify PureComponent optimization because the two objects will be referentially different.

## Testing

- One can use `console.time("label")` and `console.timeEnd("label")` to time execution of a block of code.

- To test rerenders use this [Higher-order Component](https://gist.github.com/Sam1301/caea1f70bcef1e2e16080ad563012b33).
