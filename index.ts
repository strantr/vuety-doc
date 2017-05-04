import * as ts from "typescript";
import * as fs from "fs";

const file = "test.ts";
const program = ts.createProgram([file], {});
const sourceFile = program.getSourceFile(file);
const checker = program.getTypeChecker();

interface VuetyComponent {
    className: string;
    name: string | undefined;
    provides: ProvidesField[];
    injects: ProvidesField[];
    props: ClassField[];
    emits: string[];
}

interface ClassField {
    name: string;
    type: string;
    defaultValue?: any;
}

interface ProvidesField extends ClassField {
    field: string;
}

let Components: VuetyComponent[] = [];

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

function processProp(prop: ts.PropertyDeclaration, decorator: ts.Decorator, propertyName: string, component: VuetyComponent) {
    // TODO: Get default value 
    component.props.push({
        name: propertyName,
        defaultValue: undefined,
        type: checker.typeToString(checker.getTypeFromTypeNode(prop.type))
    });
}

function processProvideInject(prop: ts.PropertyDeclaration, decorator: ts.Decorator, propertyName: string, arr: ProvidesField[]) {
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
        defaultValue: undefined,
        type: checker.typeToString(checker.getTypeFromTypeNode(prop.type)),
        field: propertyName
    });
}

function processMembers(classNode: ts.ClassDeclaration, component: VuetyComponent) {
    for (const member of classNode.members) {
        if (member.kind === ts.SyntaxKind.PropertyDeclaration) {
            const prop = member as ts.PropertyDeclaration;
            const propName = (member.name as ts.Identifier).text;

            for (const propertyDecorator of prop.decorators) {
                const decoratorName = getDecoratorName(propertyDecorator);
                switch (decoratorName) {
                    case "Prop":
                        processProp(prop, propertyDecorator, propName, component);
                        break;
                    case "Provide":
                        processProvideInject(prop, propertyDecorator, propName, component.provides);
                        break;
                    case "Inject":
                        processProvideInject(prop, propertyDecorator, propName, component.injects);
                        break;
                }
            }
        }
    }
}

function walk(node: ts.Node) {
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
                    Components.push(current);
                    processMembers(classNode, current);
                }
            }
        }
    } else if ("statements" in node) {
        node["statements"].forEach(walk);
    }
}

walk(sourceFile);
console.log(JSON.stringify(Components, null, "\t"));