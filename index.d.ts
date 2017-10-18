export declare function setGlobalStubs(stubs: any): void;
export declare function proxy(requireFunc: Function, stubs: any): any;
export declare function mock(path: any, impl: any): void;
export declare function unmockAll(): void;
export declare function unmock(path: any): void;
export declare function proxyRequire(require: Function, path: string): any;
export declare function FuseBoxStubPlugin(test: any): {
    test: any;
    transform(file: any): void;
};
export declare function registerGlobals(): void;
export declare function registerNode(): void;
export declare function transform(content: string): string;
export declare function webpackStubLoader(content: string): string;
