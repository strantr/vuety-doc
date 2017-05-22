import * as ts from "typescript";
import * as fs from "fs";

export interface VuetyComponent {
    className: string;
    name: string | undefined;
    provides: ProvidesField[];
    injects: ProvidesField[];
    props: ClassField[];
    // emits: string[];
}

interface ClassField {
    name: string;
    type: string;
    // defaultValue?: any;
}

interface ProvidesField extends ClassField {
    field: string;
}

function getDecoratorName(decorator: ts.Decorator) {
    if (decorator.expression.kind === ts.SyntaxKind.CallExpression) {
        const callExpression = decorator.expression as ts.CallExpression;
        if ("text" in callExpression.expression) {
            const identifierNode = callExpression.expression as ts.Identifier;
            return identifierNode.text;
        }
    } else if (decorator.expression.kind === ts.SyntaxKind.Identifier) {
        const identifierNode = decorator.expression as ts.Identifier;
        return identifierNode.text;
    }
    return undefined;
}

function getComponentName(componentDecorator: ts.Decorator) {
    const callExpression = componentDecorator.expression as ts.CallExpression;
    if (callExpression.arguments.length && callExpression.arguments[0].kind === ts.SyntaxKind.ObjectLiteralExpression) {
        const componentOptions = callExpression.arguments[0] as ts.ObjectLiteralExpression;
        for (const p of componentOptions.properties) {
            if ("text" in p.name && (p.name as ts.Identifier).text === "name") {
                if (p.kind === ts.SyntaxKind.PropertyAssignment) {
                    const assing = p as ts.PropertyAssignment;
                    if (assing.initializer.kind === ts.SyntaxKind.StringLiteral) {
                        const name = assing.initializer as ts.StringLiteral;
                        return name.text;
                    }
                }
            }
        }
    }
    return undefined;
}

function processProp(prop: ts.PropertyDeclaration, decorator: ts.Decorator, propertyName: string, component: VuetyComponent, checker: ts.TypeChecker) {
    // TODO: Get default value 
    component.props.push({
        name: propertyName,
        // defaultValue: undefined,
        type: checker.typeToString(checker.getTypeFromTypeNode(prop.type))
    });
}

function processProvideInject(prop: ts.PropertyDeclaration, decorator: ts.Decorator, propertyName: string, arr: ProvidesField[], checker: ts.TypeChecker) {
    let field = propertyName;
    if (decorator.expression.kind === ts.SyntaxKind.CallExpression) {
        const callExpression = decorator.expression as ts.CallExpression;
        if (callExpression.arguments.length) {
            const str = callExpression.arguments[0] as ts.StringLiteral;
            field = str.text;
        }
    }
    arr.push({
        name: field,
        // defaultValue: undefined,
        type: checker.typeToString(checker.getTypeFromTypeNode(prop.type)),
        field: propertyName
    });
}

function processMembers(classNode: ts.ClassDeclaration, component: VuetyComponent, checker: ts.TypeChecker) {
    for (const member of classNode.members) {
        if (member.kind === ts.SyntaxKind.PropertyDeclaration || member.kind === ts.SyntaxKind.GetAccessor) {
            const prop = member as ts.PropertyDeclaration;
            if (prop.decorators) {
                const propName = (member.name as ts.Identifier).text;
                for (const propertyDecorator of prop.decorators) {
                    const decoratorName = getDecoratorName(propertyDecorator);
                    switch (decoratorName) {
                        case "Prop":
                            processProp(prop, propertyDecorator, propName, component, checker);
                            break;
                        case "Provide":
                            processProvideInject(prop, propertyDecorator, propName, component.provides, checker);
                            break;
                        case "Inject":
                            processProvideInject(prop, propertyDecorator, propName, component.injects, checker);
                            break;
                    }
                }
            }
        }
    }
}

function walk(node: ts.Node, checker: ts.TypeChecker, components: VuetyComponent[]) {
    if (node.kind === ts.SyntaxKind.ClassDeclaration) {
        const classNode = node as ts.ClassDeclaration;
        if (classNode.decorators.length) {
            for (const classDecorator of classNode.decorators) {
                const name = getDecoratorName(classDecorator);
                if (name === "Component") {
                    let current = {
                        className: classNode.name.text,
                        name: getComponentName(classDecorator),
                        provides: [],
                        injects: [],
                        props: [],
                        emits: []
                    };
                    components.push(current);
                    processMembers(classNode, current, checker);
                }
            }
        }
    } else if ("statements" in node) {
        node["statements"].forEach(n => walk(n, checker, components));
    }
}

export function getDoc(file: string) {
    const program = ts.createProgram([file], {});
    const sourceFile = program.getSourceFile(file);
    if (!sourceFile) {
        throw new Error("File not found: '" + file + "'.");
    }
    const checker = program.getTypeChecker();

    const components: VuetyComponent[] = [];
    walk(sourceFile, checker, components);
    return components;
}