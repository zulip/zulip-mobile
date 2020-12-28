// flow-typed signature: 4c227e658fff67d328126eb392cb3317
// flow-typed version: c6154227d1/prop-types_v15.x.x/flow_>=v0.89.x <=v0.103.x

type $npm$propTypes$ReactPropsCheckType = (
  props: any,
  propName: string,
  componentName: string,
  href?: string
) => ?Error;

// Copied from: https://github.com/facebook/flow/blob/0938da8d7293d0077fbe95c3a3e0eebadb57b012/lib/react.js#L433-L449
declare module 'prop-types' {
  declare var array: React$PropType$Primitive<Array<any>>;
  declare var bool: React$PropType$Primitive<boolean>;
  declare var func: React$PropType$Primitive<(...a: Array<any>) => mixed>;
  declare var number: React$PropType$Primitive<number>;
  declare var object: React$PropType$Primitive<{ +[string]: mixed }>;
  declare var string: React$PropType$Primitive<string>;
  declare var symbol: React$PropType$Primitive<Symbol>;
  declare var any: React$PropType$Primitive<any>;
  declare var arrayOf: React$PropType$ArrayOf;
  declare var element: React$PropType$Primitive<any>;
  declare var instanceOf: React$PropType$InstanceOf;
  declare var node: React$PropType$Primitive<any>;
  declare var objectOf: React$PropType$ObjectOf;
  declare var oneOf: React$PropType$OneOf;
  declare var oneOfType: React$PropType$OneOfType;
  declare var shape: React$PropType$Shape;

  declare function checkPropTypes<V>(
    propTypes: { [key: $Keys<V>]: $npm$propTypes$ReactPropsCheckType },
    values: V,
    location: string,
    componentName: string,
    getStack: ?() => ?string
  ): void;
}
