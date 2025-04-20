
export const convertToMermaid = (json: string): string => {

    try {
        const flow = JSON.parse(json);

        const triggers = flow.properties.definition.triggers;
        const [triggerName] = Object.keys(triggers);
        const triggerDetails = triggers[triggerName] as Trigger;

        const actionMap: ActionsMap = flow.properties.definition.actions;

        var mermaid = `graph TD;`;
        mermaid += `${cleanStepName(triggerName)}["Trigger: ${escapeStepName(triggerName)}<br/>Type: ${triggerDetails.type}"];`;
        const processActionsReuslt = processActions(actionMap, { name: cleanStepName(triggerName), action: undefined });
        mermaid += `${processActionsReuslt.mermaid}`;

        return mermaid;
    }
    catch (error) {
        console.error("Error parsing JSON:", error);
        return "Error parsing JSON";
    }
}

const processActions = (actions: ActionsMap, previousStep: Step, label: string | undefined = undefined): ProcessActionsResult => {

    let mermaid = "";

    const sorted = topologicalSort(actions);

    for (let index = 0; index < sorted.length; index++) {
        const element = sorted[index];

        const elementCleanName = cleanStepName(element);

        const action = actions[element];

        if (action.type === "Switch" && action.cases) {

            const id = shortId();

            const switchStepStart = `Switch_Start_${id}`;
            const switchEndStep = `Switch_End_${id}`;

            if (previousStep.name) {
                mermaid += `${previousStep.name} --> ${switchStepStart}["Switch - Start<br/>${action.expression}"];`;
            } else {
                mermaid += `${switchStepStart}["Switch - Start<br/>${action.expression}"];`;
            }

            Object.entries(action.cases).forEach(([caseName, caseAction]) => {
                const caseStepName = caseAction.case || caseName;
                if (caseAction.actions) {
                    const processActionsResult = processActions(caseAction.actions, { name: switchStepStart, action: undefined }, caseStepName);
                    mermaid += processActionsResult.mermaid;
                    mermaid += `${processActionsResult.lastStep} --> ${switchEndStep}["Switch - End"];`;
                }
            });

            previousStep = { name: switchEndStep, action: undefined };
        } else if (action.type === "If") {

            const id = shortId();

            const conditionStepStart = `Condition_Start_${id}`;
            const conditionEndStep = `Condition_End_${id}`;

            if (previousStep.name) {
                mermaid += `${previousStep.name} --> ${label ? '|' + label + '|' : ''}${conditionStepStart}["Condition - Start<br/>${translateIfExpression(action.expression)}"];`;
            } else {
                mermaid += `${conditionStepStart}["Condition - Start<br/>${translateIfExpression(action.expression)}"];`;
            }

            if (action.actions) {
                const processActionsResult = processActions(action.actions, { name: conditionStepStart, action: undefined }, "true");
                mermaid += processActionsResult.mermaid;
                if (processActionsResult.lastStep) {
                    mermaid += `${processActionsResult.lastStep} --> ${conditionEndStep}["Condition - End"];`;
                }
            } else {
                // no actions defined 
                mermaid += `${conditionStepStart} --> |true|${conditionEndStep}["Condition - End"];`;
            };
            if (action.else?.actions) {
                const processActionsResult = processActions(action.else.actions, { name: conditionStepStart, action: undefined }, "false");
                mermaid += processActionsResult.mermaid;
                if (processActionsResult.lastStep) {
                    mermaid += `${processActionsResult.lastStep} --> ${conditionEndStep}["Condition - End"];`;
                }
            } else {
                // no else defined 
                mermaid += `${conditionStepStart} --> |false|${conditionEndStep}["Condition - End"];`;
            };

            previousStep = { name: conditionEndStep, action: undefined };
        } else if (action.type === "Foreach" && action.actions) {

            const id = shortId();

            const foreachStepStart = `Foreach_Start_${id}`;

            if (previousStep.name) {
                mermaid += `${previousStep.name} --> ${label ? '|' + label + '|' : ''}${foreachStepStart};`;
            } else {
                mermaid += `${foreachStepStart};`;
            }

            mermaid += `subgraph ${foreachStepStart}["${action.type}: ${escapeStepName(element)}"];`;

            label = undefined;

            const processActionsResult = processActions(action.actions, { name: undefined, action: action });
            mermaid += processActionsResult.mermaid;
            mermaid += `end;`;

            previousStep = { name: foreachStepStart, action: undefined };
        } else if (action.actions) {

            if (previousStep.name) {
                mermaid += `${cleanStepName(previousStep.name)} --> ${label ? '|' + label + '|' : ''}${elementCleanName}["${action.type}: ${escapeStepName(element)}"];`;
            } else {
                mermaid += `${label ? '|' + label + '|' : ''}${elementCleanName}["${action.type}: ${escapeStepName(element)}];`;
            }

            label = undefined;

            const processActionsResult = processActions(action.actions, { name: elementCleanName, action: action });
            mermaid += processActionsResult.mermaid;

            previousStep = { name: processActionsResult.lastStep, action: undefined };
        } else if (action.type === "Terminate") {
            if (previousStep.name) {

                mermaid += `${cleanStepName(previousStep.name)} --> ${label ? '|' + label + '|' : ''}${elementCleanName}["${action.type}: ${escapeStepName(element)}"];`;
            }
            else {
                mermaid += `${label ? '|' + label + '|' : ''}${elementCleanName}["${action.type}: ${escapeStepName(element)}"];`;
            }
            previousStep = { name: undefined, action: undefined };
        } else {
            if (previousStep.name) {
                mermaid += `${cleanStepName(previousStep.name)} --> ${label ? '|' + label + '|' : ''}${elementCleanName}["${action.type}: ${escapeStepName(element)}"];`;
            } else {
                mermaid += `${label ? '|' + label + '|' : ''}${elementCleanName}["${action.type}: ${escapeStepName(element)}"];`;
            }
            previousStep = { name: elementCleanName, action: action };

            label = undefined;
        }
    };

    return { mermaid, lastStep: previousStep.name };
}

function shortId() {
    return (
        Date.now().toString(36) +
        Math.random().toString(36).substring(2, 5)
    );
}

function translateIfExpression(expression: ExpressionMap | undefined): string {
    if (!expression) return "";

    const processInner = (values: any): string => {
        return Object.entries(values)
            .map(([name, map]) =>
                Object.entries(map as []).map(([innerName, innerValues]) => {
                    try {
                        return `${innerName} => ${(innerValues as []).join(",")}<br/>`;
                    } catch (error) {
                        console.error("Error processing inner expression:", error);
                        return "";
                    }
                }).join("")
            ).join("");
    };

    return Object.entries(expression)
        .map(([expressionName, values]) => {
            if (expressionName === "and" || expressionName === "or") {
                return `${expressionName} => <br/>(` + processInner(values) + `)`;
            }
            try {
                return `${expressionName} => ${(values as []).join(",")}<br/>`;
            } catch (error) {
                console.error("Error processing expression:", error);
                return "";
            }
        }).join("");
}

function cleanStepName(stepName: string | undefined): string {
    if (!stepName) return "";

    // Remove any unwanted characters or patterns from the step name
    // For example, remove spaces and special characters
    return stepName.replace(/[^a-zA-Z0-9_]/g, "_");
}

function escapeStepName(stepName: string | undefined): string {
    if (!stepName) return "";

    // Remove any unwanted characters or patterns from the step name
    // For example, remove spaces and special characters
    return stepName.replace(/"/g, '');
}

function topologicalSort(actions: ActionsMap): string[] {
    const graph = new Map<string, Set<string>>();
    const inDegree = new Map<string, number>();

    // Initialize graph and in-degree
    for (const actionName of Object.keys(actions)) {
        graph.set(actionName, new Set());
        inDegree.set(actionName, 0);
    }

    // Build graph from runAfter dependencies
    for (const [actionName, action] of Object.entries(actions)) {
        if (action.runAfter) {
            for (const dep of Object.keys(action.runAfter)) {
                graph.get(dep)?.add(actionName);
                inDegree.set(actionName, (inDegree.get(actionName) || 0) + 1);
            }
        }
    }

    // Queue of actions with no dependencies
    const queue: string[] = [];
    for (const [actionName, degree] of inDegree.entries()) {
        if (degree === 0) queue.push(actionName);
    }

    // Process the graph
    const result: string[] = [];
    while (queue.length > 0) {
        const current = queue.shift()!;
        result.push(current);

        for (const neighbor of graph.get(current) || []) {
            inDegree.set(neighbor, (inDegree.get(neighbor) || 1) - 1);
            if (inDegree.get(neighbor) === 0) {
                queue.push(neighbor);
            }
        }
    }

    // If result doesn't include all actions, there’s a cycle
    if (result.length !== Object.keys(actions).length) {
        throw new Error('Cycle detected in action dependencies!');
    }

    return result;
}

interface Action {
    runAfter?: Record<string, string[]>;
    foreach?: string;
    actions?: ActionsMap;
    cases?: ActionsMap;
    case?: string;
    else?: Action;
    expression?: ExpressionMap;
    metadata: {
        operationMetadataId: string;
    };
    type: string;
    inputs?: any;
}

interface Trigger {
    splitOn: string;
    metadata: {
        operationMetadataId: string;
    };
    type: string;
    inputs: {
        host: {
            connectionName: string;
            operationId: string;
            apiId: string;
        };
        parameters: {
            folderPath: string;
            includeAttachments: boolean;
            importance: string;
            fetchOnlyWithAttachment: boolean;
        };
        authentication: string;
    };
}

interface Step {
    name: string | undefined;
    action: Action | undefined;
}

type ProcessActionsResult = {
    mermaid: string;
    lastStep: string | undefined;
}

type ActionsMap = Record<string, Action>;
type ExpressionMap = Record<string, []>;

