export declare function proxy(requireFunc: Function, stubs: any): any;
export declare function proxyRequire(require: Function, path: string): any;
export declare function FuseBoxStubPlugin(test: any): {
    test: any;
    transform(file: any): void;
};
export declare function registerGlobals(): void;
export declare function webpackStubLoader(content: string): string;
